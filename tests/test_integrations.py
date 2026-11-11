import json
import pytest
import requests
from engine import export_attempt
from test_engine import play
from tutor import Settings, complete_tutor
from sources_api import fetch_guideline_metadata


class Response:
    def __init__(self, data): self.data = data
    def raise_for_status(self): pass
    def json(self): return self.data


@pytest.mark.parametrize("mode", ["valid", "wrong_pair", "wrong_focus", "extra_text", "timeout", "malformed"])
def test_tutor_only_renders_catalog_and_never_changes_scores(case, mode):
    state = play(case, letters="CAAAAA")
    before = state["scores"].copy()
    calls = []
    selection = {"focus_decision_id": "D1", "feedback_id": "F01", "question_id": "Q01"}
    if mode == "wrong_pair": selection["feedback_id"] = "F02"
    if mode == "wrong_focus": selection.update(focus_decision_id="D4", feedback_id="F04", question_id="Q04")
    if mode == "extra_text": selection["dose"] = "UNTRUSTED"
    def post(url, **kwargs):
        calls.append(kwargs)
        if mode == "timeout": raise requests.Timeout("do not expose API_KEY_SENTINEL")
        if mode == "malformed": return Response({})
        return Response({"candidates": [{"content": {"parts": [{"text": json.dumps(selection)}]}}],
                         "usageMetadata": {"promptTokenCount": 200, "candidatesTokenCount": 40}})
    settings = Settings(True, "API_KEY_SENTINEL", spend_control_confirmed=True, input_rate=1, output_rate=2)
    result = complete_tutor(state, case, settings, post=post)
    assert (result["mode"] == "provider") == (mode == "valid")
    assert state["scores"] == before
    assert complete_tutor(state, case, settings, post=post) is result
    assert len(calls) == 1
    assert "API_KEY_SENTINEL" not in json.dumps(export_attempt(state, case))
    assert "UNTRUSTED" not in json.dumps(result)
    if mode == "valid": assert result["estimated_cost_usd"] == 0.00028


@pytest.mark.parametrize("enabled,key,control", [(False, "key", True), (True, "", True), (True, "key", False)])
def test_no_call_without_explicit_enable_key_and_spend_control(case, enabled, key, control):
    state = play(case)
    def forbidden(*args, **kwargs): pytest.fail("Network call must be disabled")
    assert complete_tutor(state, case, Settings(enabled, key, spend_control_confirmed=control), post=forbidden)["mode"] == "local_fallback"


def test_metadata_is_real_or_explicitly_unavailable():
    data = {"result": {"31573350": {"title": "Diagnosis and Treatment of Adults with Community-acquired Pneumonia.",
                                   "pubdate": "2019 Oct 1", "fulljournalname": "American journal"}}}
    assert fetch_guideline_metadata(get=lambda *a, **k: Response(data))["status"] == "verified_online"
    assert fetch_guideline_metadata(get=lambda *a, **k: Response({}))["status"] == "unavailable"
    def timeout(*a, **k): raise requests.Timeout()
    assert fetch_guideline_metadata(get=timeout)["status"] == "unavailable"

