"""Verify original ZIP deliverables and the executable case without changing them."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from engine import load_case

for line in (ROOT / "spec/SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
    expected, filename = line.split(maxsplit=1)
    actual = hashlib.sha256((ROOT / "spec" / filename).read_bytes()).hexdigest()
    assert actual == expected, f"Source package changed: {filename}"
for name in ("case_nac_adult_v0_1.json", "case.schema.json"):
    assert (ROOT / "data" / name).read_bytes() == (ROOT / "spec" / name).read_bytes()
case = load_case()
assert case["fictional"] is True and case["medical_review"]["status"] == "pending"
print(json.dumps({"package_hashes": "11 passed", "schema": "Draft 2020-12 passed",
                  "case": case["case_id"], "review": case["medical_review"]["status"]}))

