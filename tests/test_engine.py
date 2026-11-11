from copy import deepcopy
from itertools import product
import json
import pytest

from engine import (RuleViolation, acknowledge_correction, confirm_decision, confirm_inventory,
                    export_attempt, new_attempt, outcome)


def play(case, facility="F_I2", letters="AAAAAA"):
    state = confirm_inventory(new_attempt(case, facility))
    for number, letter in enumerate(letters, 1):
        decision_id = f"D{number}"
        state = confirm_decision(state, case, decision_id, f"{decision_id}_{letter}")
        if state["pending_correction"]:
            state = acknowledge_correction(state, case, decision_id)
    return state


@pytest.mark.parametrize("facility", ["F_I2", "F_I4"])
@pytest.mark.parametrize("letters", ["AAAAAA", "AABAAA"])
def test_safe_alternatives_are_equivalent(case, facility, letters):
    state = play(case, facility, letters)
    assert state["scores"] == {"reasoning": 25, "safety": 35, "resources": 20, "referral": 20}
    assert state["completed_at"] and state["transfer_prepared"]
    assert not state["critical_flags"]
    assert state["treatments_administered"] == ["TX01"]
    stock = {r["id"]: r["quantity"] for r in state["facility"]["resources"]}
    assert stock["ceftriaxone_1g"] == (2 if facility == "F_I2" else 18)
    assert stock["azithromycin_500mg"] == (3 if facility == "F_I2" else 9)
    assert ("chest_xray" in state["tests"]) == (facility == "F_I4" and letters[2] == "A")
    assert case["patient"]["risk_reference"]["curb65_total"] is None
    if state["tests"]:
        assert state["tests"]["cbc_urea"]["result"] is None


def test_every_path_preserves_safety_and_accounting(case):
    """All 1458 paths: corrections finish; no score/stock/physiology invention."""
    for facility, letters in product(["F_I2", "F_I4"], product("ABC", repeat=6)):
        state = play(case, facility, letters)
        assert len(state["choices"]) == 6 and state["completed_at"]
        assert state["treatments_administered"] == ["TX01"]
        assert 0 <= sum(state["scores"].values()) <= 100
        expected_critical = any(letters[i] == "C" for i in (0, 3, 4, 5))
        assert bool(state["critical_flags"]) == expected_critical
        assert state["avoidable_delay_min"] == (60 if letters[2] == "C" else 0)
        assert state["transfer_prepared"]
        if expected_critical:
            assert "crítica" in outcome(state)


def test_double_confirmation_and_correction_are_idempotent(case):
    state = confirm_inventory(new_attempt(case, "F_I2"))
    for i in range(1, 5):
        state = confirm_decision(state, case, f"D{i}", f"D{i}_A")
    state = confirm_decision(state, case, "D5", "D5_B")
    assert state["treatments_administered"] == []
    assert confirm_decision(state, case, "D5", "D5_B") == state
    state = acknowledge_correction(state, case, "D5")
    assert acknowledge_correction(state, case, "D5") == state
    assert confirm_decision(state, case, "D5", "D5_B") == state
    assert state["treatments_administered"] == ["TX01"]
    assert next(r for r in state["facility"]["resources"] if r["id"] == "ceftriaxone_1g")["quantity"] == 2
    with pytest.raises(RuleViolation):
        confirm_decision(state, case, "D5", "D5_A")


@pytest.mark.parametrize("field,value", [("authorized_in_scenario", False), ("available", False),
                                          ("staff_present", False), ("supplies_present", False), ("quantity", 1)])
def test_treatment_block_is_transactional(case, field, value):
    state = confirm_inventory(new_attempt(case, "F_I2"))
    for i in range(1, 5):
        state = confirm_decision(state, case, f"D{i}", f"D{i}_A")
    next(r for r in state["facility"]["resources"] if r["id"] == "ceftriaxone_1g")[field] = value
    before = deepcopy(state)
    with pytest.raises(RuleViolation):
        confirm_decision(state, case, "D5", "D5_A")
    assert state == before


def test_order_inventory_and_correction_gates(case):
    state = new_attempt(case, "F_I2")
    with pytest.raises(RuleViolation):
        confirm_decision(state, case, "D1", "D1_A")
    state = confirm_inventory(state)
    with pytest.raises(RuleViolation):
        confirm_decision(state, case, "D2", "D2_A")
    state = confirm_decision(state, case, "D1", "D1_C")
    with pytest.raises(RuleViolation):
        confirm_decision(state, case, "D2", "D2_A")
    with pytest.raises(RuleViolation):
        confirm_decision(state, case, "D1", "D4_A")


def test_history_completed_without_recovering_points(case):
    state = play(case, letters="ABAAAA")
    assert len(state["history_ids"]) == 7
    assert state["history_revealed_by_correction"]
    assert state["scores"]["reasoning"] == 20


def test_reset_and_export_privacy(case):
    state = play(case, letters="CCCCCC")
    state["justification"] = "DO_NOT_EXPORT"
    state["api_key"] = "DO_NOT_EXPORT"
    exported = export_attempt(state, case)
    assert "DO_NOT_EXPORT" not in json.dumps(exported)
    assert exported["medical_review"]["status"] == "pending"
    assert exported["risk_reference"]["severe_cap_classification"] == "incomplete"
    reset = new_attempt(case, "F_I2")
    assert reset["attempt_id"] != state["attempt_id"]
    assert not reset["events"] and not reset["critical_flags"]
    assert reset["step"] == 0 and reset["scores"]["safety"] == 0


def test_incomplete_transfer_remains_visible(case):
    state = play(case, letters="AAAAAB")
    assert state["transfer_initially_incomplete"]
    assert "inicialmente incompleta" in outcome(state)


def test_missing_transport_oxygen_blocks(case):
    state = confirm_inventory(new_attempt(case, "F_I2"))
    for i in range(1, 6):
        state = confirm_decision(state, case, f"D{i}", f"D{i}_A")
    state["facility"]["transport"]["oxygen_autonomy_min"] = 10
    with pytest.raises(RuleViolation):
        confirm_decision(state, case, "D6", "D6_A")

