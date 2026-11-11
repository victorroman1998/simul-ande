"""Opt-in real session-03 check; never run in offline CI."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from sources_api import fetch_guideline_metadata

result = fetch_guideline_metadata()
print(json.dumps(result, ensure_ascii=False, indent=2))
if result["status"] != "verified_online":
    raise SystemExit(1)
path = ROOT / "docs/evidence/pubmed_live.json"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

