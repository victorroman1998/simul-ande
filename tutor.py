"""Optional session 08 integration. Model chooses IDs; only local texts are rendered."""
from __future__ import annotations

from dataclasses import dataclass
import json
import os
import re
import requests
from jsonschema import validate
from engine import add_event


@dataclass(frozen=True)
class Settings:
    enabled: bool = False
    api_key: str = ""
    model: str = "gemini-2.5-flash-lite"
    spend_control_confirmed: bool = False
    input_rate: float | None = None
    output_rate: float | None = None

    @classmethod
    def from_mapping(cls, config=None):
        config = os.environ if config is None else config
        def flag(name):
            return str(config.get(name, "false")).lower() == "true"
        def rate(name):
            try:
                value = float(config.get(name, ""))
                return value if value >= 0 else None
            except (ValueError, TypeError):
                return None
        return cls(flag("LLM_ENABLED"), str(config.get("GEMINI_API_KEY", "")),
                   str(config.get("LLM_MODEL", "gemini-2.5-flash-lite")),
                   flag("LLM_SPEND_CONTROL_CONFIRMED"), rate("LLM_INPUT_USD_PER_MILLION"),
                   rate("LLM_OUTPUT_USD_PER_MILLION"))


def eligible_decisions(state, case):
    below = [c["decision_id"] for c in state["choices"]
             if c["score"] != next(d["max_score"] for d in case["decisions"] if d["id"] == c["decision_id"])]
    return below or [d["id"] for d in case["decisions"]]


def validate_selection(selection, eligible, case):
    schema = {"type": "object", "additionalProperties": False,
              "properties": {"focus_decision_id": {"type": "string", "enum": eligible},
                             "feedback_id": {"type": "string", "enum": [f"F{i:02}" for i in range(1, 7)]},
                             "question_id": {"type": "string", "enum": [f"Q{i:02}" for i in range(1, 7)]}},
              "required": ["focus_decision_id", "feedback_id", "question_id"]}
    validate(selection, schema)
    record = next(f for f in case["feedback_catalog"] if f["decision_id"] == selection["focus_decision_id"])
    if record["id"] != selection["feedback_id"] or record["question_id"] != selection["question_id"]:
        raise ValueError("IDs inconsistent with catalog")
    return record


def complete_tutor(state, case, settings: Settings, post=None):
    """Mutates only tutor metadata/events; reserves the attempt before any network call."""
    if not state["completed_at"]:
        raise ValueError("Complete the six decisions first")
    if state["tutor"] is not None:
        return state["tutor"]
    eligible = eligible_decisions(state, case)
    focus = eligible[0]
    catalog = next(f for f in case["feedback_catalog"] if f["decision_id"] == focus)
    selection = {"focus_decision_id": focus, "feedback_id": catalog["id"], "question_id": catalog["question_id"]}
    state["tutor"] = {"mode": "local_fallback", "selection": selection, "reason": "disabled_or_unconfigured",
                      "model": None, "input_tokens": None, "output_tokens": None, "estimated_cost_usd": None}
    result = state["tutor"]
    if settings.enabled and settings.api_key and settings.spend_control_confirmed:
        result["reason"] = "provider_or_validation_error"
        try:
            if not re.fullmatch(r"[a-zA-Z0-9._-]+", settings.model):
                raise ValueError("Invalid model identifier")
            # Closed, ASCII input; no justification, identifiers, free text, or secrets sent.
            # At most 1500 UTF-8 bytes of instruction/data, below the design token budget.
            prompt = json.dumps({"task": "Choose one eligible focus; Dn must pair with F0n,Q0n. Return only the three IDs.",
                                 "eligible": eligible, "facility": state["facility_id"],
                                 "choices": [{"id": c["option_id"], "critical": bool(c["critical_flag"])} for c in state["choices"]]},
                                separators=(",", ":"), ensure_ascii=True)
            if len(prompt.encode("utf-8")) > 1500:
                raise ValueError("Input budget exceeded")
            properties = {"focus_decision_id": {"type": "string", "enum": eligible},
                          "feedback_id": {"type": "string", "enum": [f"F{i:02}" for i in range(1, 7)]},
                          "question_id": {"type": "string", "enum": [f"Q{i:02}" for i in range(1, 7)]}}
            response = (post or requests.post)(
                f"https://generativelanguage.googleapis.com/v1beta/models/{settings.model}:generateContent",
                headers={"x-goog-api-key": settings.api_key, "Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": prompt}]}],
                      "generationConfig": {"temperature": 0, "maxOutputTokens": 150,
                                           "responseMimeType": "application/json",
                                           "responseJsonSchema": {"type": "object", "properties": properties,
                                                                  "required": list(properties), "additionalProperties": False},
                                           "thinkingConfig": {"thinkingBudget": 0}}}, timeout=10)
            response.raise_for_status()
            data = response.json()
            # Record known usage even if returned IDs are rejected.
            usage = data.get("usageMetadata", {})
            result["input_tokens"] = usage.get("promptTokenCount")
            result["output_tokens"] = usage.get("candidatesTokenCount")
            result["model"] = settings.model
            if all(isinstance(result[k], int) and result[k] >= 0 for k in ("input_tokens", "output_tokens")) and settings.input_rate is not None and settings.output_rate is not None:
                result["estimated_cost_usd"] = (result["input_tokens"] * settings.input_rate + result["output_tokens"] * settings.output_rate) / 1_000_000
            chosen = json.loads(data["candidates"][0]["content"]["parts"][0]["text"])
            validate_selection(chosen, eligible, case)
            result.update(mode="provider", selection=chosen, reason=None)
        except Exception:
            # Never display provider exceptions: they can include request headers / credentials.
            pass
    add_event(state, result["selection"]["focus_decision_id"], None,
              "tutor_completed" if result["mode"] == "provider" else "tutor_fallback")
    return result
