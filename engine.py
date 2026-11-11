"""Pure, transactional teaching engine. No network, LLM or clinical inference."""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
import json
from pathlib import Path
from uuid import uuid4

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent
CASE_PATH = ROOT / "data/case_nac_adult_v0_1.json"
DOMAINS = {"reasoning": "Razonamiento", "safety": "Seguridad",
           "resources": "Recursos", "referral": "Referencia"}


class RuleViolation(ValueError):
    """A blocked transition leaves the original state completely untouched."""


def load_case(path: Path = CASE_PATH) -> dict:
    case = json.loads(path.read_text(encoding="utf-8"))
    schema = json.loads((ROOT / "data/case.schema.json").read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(case)
    decisions = case["decisions"]
    if [d["id"] for d in decisions] != [f"D{i}" for i in range(1, 7)]:
        raise RuleViolation("Se necesitan seis decisiones ordenadas D1–D6.")
    for domain, maximum in case["scoring"]["max_by_domain"].items():
        if sum(d["max_score"][domain] for d in decisions) != maximum:
            raise RuleViolation("Máximos incoherentes.")
        if sum(d["options"][0]["score"][domain] for d in decisions) != maximum:
            raise RuleViolation("La ruta esperada no suma el máximo.")
    if sum(case["scoring"]["max_by_domain"].values()) != 100:
        raise RuleViolation("El total debe ser 100.")
    source_ids = {s["id"] for s in case["sources"]}
    evidence_ids = {e["id"] for e in case["evidence"]}
    for decision in decisions:
        if len({o["id"] for o in decision["options"]}) != 3:
            raise RuleViolation("Alternativas duplicadas o incompletas.")
        if not set(decision["source_ids"]) <= source_ids:
            raise RuleViolation("Fuente inexistente.")
        if not set(decision["evidence_ids"]) <= evidence_ids:
            raise RuleViolation("Evidencia inexistente.")
    return case


def new_attempt(case: dict, facility_id: str) -> dict:
    facility = next((f for f in case["facilities"] if f["id"] == facility_id), None)
    if facility is None:
        raise RuleViolation("Establecimiento desconocido.")
    return {"attempt_id": str(uuid4()), "case_id": case["case_id"],
            "case_version": case["case_version"], "medical_review": deepcopy(case["medical_review"]),
            "facility_id": facility_id, "facility": deepcopy(facility), "step": 0,
            "inventory_confirmed": False, "pending_correction": None,
            "choices": [], "events": [], "scores": dict.fromkeys(DOMAINS, 0),
            "critical_flags": [], "avoidable_delay_min": 0,
            "history_ids": [], "history_revealed_by_correction": False,
            "tests": {}, "treatments_administered": [], "support_started": False,
            "referral_activated": False, "transfer_prepared": False,
            "transfer_initially_incomplete": False, "tutor": None,
            "started_at": datetime.now(timezone.utc).isoformat(), "completed_at": None}


def confirm_inventory(state: dict) -> dict:
    result = deepcopy(state)
    result["inventory_confirmed"] = True
    return result


def option_label(option: dict, facility_id: str) -> str:
    return option.get("label_by_facility", {}).get(facility_id, option["label"])


def get_option(case: dict, decision_id: str, option_id: str) -> tuple[dict, dict]:
    decision = next((d for d in case["decisions"] if d["id"] == decision_id), None)
    option = next((o for o in decision["options"] if o["id"] == option_id), None) if decision else None
    if option is None:
        raise RuleViolation("Decisión u opción no válida.")
    return decision, option


def require_resource(state: dict, resource_id: str, quantity: int = 1) -> dict:
    resource = next((r for r in state["facility"]["resources"] if r["id"] == resource_id), None)
    if resource is None:
        raise RuleViolation(f"Recurso no declarado: {resource_id}.")
    checks = {"authorized_in_scenario": "autorización", "available": "disponibilidad",
              "staff_present": "personal", "supplies_present": "insumos"}
    missing = [label for key, label in checks.items() if not resource.get(key, False)]
    if resource.get("quantity", 0) < quantity:
        missing.append("stock suficiente")
    if missing:
        raise RuleViolation(f"Acción bloqueada: {resource_id}; falta {', '.join(missing)}. Revisar escenario.")
    return resource


def require_treatment(state: dict, case: dict) -> dict:
    treatment = case["treatments"][0]
    quantities = {p["resource_id"]: p["quantity_consumed"] for p in treatment["dose_plan"]}
    for resource_id in treatment["required_resource_ids"]:
        require_resource(state, resource_id, quantities.get(resource_id, 1))
    if not {h["id"] for h in case["patient"]["history"]} <= set(state["history_ids"]):
        raise RuleViolation("Completar antecedentes antes de administrar.")
    return treatment


def require_transfer(state: dict, case: dict) -> None:
    facility = state["facility"]
    transport = facility["transport"]
    if not facility["reference_phone_available"] or not case["receiving_hospital"]["acceptance_available_in_script"]:
        raise RuleViolation("Referencia bloqueada: falta comunicación o receptor.")
    if not all(transport[k] for k in ("assisted", "trained_team", "oximetry")):
        raise RuleViolation("Referencia bloqueada: soporte de transporte incompleto.")
    if transport["oxygen_autonomy_min"] < transport["travel_min"]:
        raise RuleViolation("Referencia bloqueada: autonomía de oxígeno insuficiente para el viaje ficticio.")


def add_event(state: dict, decision_id: str | None, option_id: str | None,
              event_type: str, score: dict | None = None, critical: str | None = None,
              delay: int = 0) -> None:
    state["events"].append({"sequence": len(state["events"]) + 1,
                            "decision_id": decision_id, "option_id": option_id,
                            "event_type": event_type, "score_delta": score or dict.fromkeys(DOMAINS, 0),
                            "critical_flag": critical, "avoidable_delay_min": delay})


def apply_safe_action(state: dict, case: dict, decision_id: str) -> None:
    if decision_id == "D1":
        state["support_started"] = state["referral_activated"] = True
    elif decision_id == "D2":
        state["history_ids"] = [h["id"] for h in case["patient"]["history"]]
    elif decision_id == "D5" and "TX01" not in state["treatments_administered"]:
        treatment = require_treatment(state, case)
        for dose in treatment["dose_plan"]:
            resource = require_resource(state, dose["resource_id"], dose["quantity_consumed"])
            resource["quantity"] -= dose["quantity_consumed"]
        state["treatments_administered"].append("TX01")
    elif decision_id == "D6":
        require_transfer(state, case)
        state["transfer_prepared"] = True


def mark_complete(state: dict) -> None:
    if state["step"] == 6 and state["pending_correction"] is None:
        state["completed_at"] = state["completed_at"] or datetime.now(timezone.utc).isoformat()


def confirm_decision(state: dict, case: dict, decision_id: str, option_id: str) -> dict:
    decision, option = get_option(case, decision_id, option_id)
    existing = next((c for c in state["choices"] if c["decision_id"] == decision_id), None)
    if existing:
        if existing["option_id"] == option_id:
            return deepcopy(state)  # idempotency, even after a rerun or final completion
        raise RuleViolation("La primera elección confirmada no se puede cambiar.")
    if not state["inventory_confirmed"]:
        raise RuleViolation("Confirma primero los recursos del turno.")
    if state["pending_correction"]:
        raise RuleViolation("Revisa la corrección antes de continuar.")
    if state["step"] >= 6 or case["decisions"][state["step"]]["id"] != decision_id:
        raise RuleViolation("Las decisiones se responden en orden.")
    # Check prerequisites BEFORE copying points or consuming anything.
    if decision_id == "D1":
        require_resource(state, "basic_assessment")
        require_resource(state, "oxygen")
        if not state["facility"]["reference_phone_available"]:
            raise RuleViolation("Falta comunicación de referencia.")
    if decision_id == "D5":
        require_treatment(state, case)
    if decision_id == "D6":
        require_transfer(state, case)
    requested = option.get("requested_tests_by_facility", {}).get(state["facility_id"], [])
    for test_id in requested:
        require_resource(state, test_id)
    result = deepcopy(state)
    result["choices"].append({"decision_id": decision_id, "option_id": option_id,
                              "score": deepcopy(option["score"]), "critical_flag": option["critical_flag"],
                              "consequence": option["consequence"]})
    for domain, points in option["score"].items():
        result["scores"][domain] += points
    if option["critical_flag"]:
        result["critical_flags"].append(option["critical_flag"])
    result["avoidable_delay_min"] += option["avoidable_delay_min"]
    result["transfer_initially_incomplete"] |= option.get("transfer_incomplete", False)
    result["history_ids"] = sorted(set(result["history_ids"]) | set(option.get("reveal_history_ids", [])))
    for test_id in requested:
        test = next(t for t in case["tests"] if t["id"] == test_id)
        result["tests"][test_id] = {"result": test["result"],
                                    "status": "available_teaching_jump" if test["result"] else "pending_at_transfer",
                                    "fictional": True}
    add_event(result, decision_id, option_id, "decision_confirmed", deepcopy(option["score"]),
              option["critical_flag"], option["avoidable_delay_min"])
    result["step"] += 1
    if option["requires_teaching_correction"]:
        result["pending_correction"] = decision_id
    else:
        apply_safe_action(result, case, decision_id)
    mark_complete(result)
    return result


def acknowledge_correction(state: dict, case: dict, decision_id: str) -> dict:
    if state["pending_correction"] != decision_id:
        if any(e["event_type"] == "teaching_correction" and e["decision_id"] == decision_id for e in state["events"]):
            return deepcopy(state)
        raise RuleViolation("No hay corrección pendiente para esta decisión.")
    result = deepcopy(state)
    if decision_id == "D2":
        result["history_revealed_by_correction"] = True
    apply_safe_action(result, case, decision_id)
    chosen = next(c for c in result["choices"] if c["decision_id"] == decision_id)
    add_event(result, decision_id, chosen["option_id"], "teaching_correction")
    result["pending_correction"] = None
    mark_complete(result)
    return result


def outcome(state: dict) -> str:
    if state["critical_flags"]:
        return "Se identificó una decisión crítica: revisar antes de repetir. Recorrido con intervención docente."
    if state["transfer_initially_incomplete"]:
        return "Transferencia inicialmente incompleta; se completó mediante corrección docente."
    return "Transferencia preparada; comunicar información disponible y pendiente al receptor ficticio."


def export_attempt(state: dict, case: dict) -> dict:
    keys = ("attempt_id", "case_id", "case_version", "medical_review", "facility_id", "choices",
            "scores", "critical_flags", "avoidable_delay_min", "events", "tests",
            "treatments_administered", "transfer_prepared", "transfer_initially_incomplete",
            "started_at", "completed_at", "tutor")
    result = {key: deepcopy(state[key]) for key in keys}
    result["fictional"] = True
    result["risk_reference"] = deepcopy(case["patient"]["risk_reference"])
    result["stock_remaining"] = {r["id"]: r["quantity"] for r in state["facility"]["resources"]}
    result["outcome"] = outcome(state)
    if state["completed_at"]:
        result["usage_seconds"] = round((datetime.fromisoformat(state["completed_at"]) - datetime.fromisoformat(state["started_at"])).total_seconds(), 1)
    return result
