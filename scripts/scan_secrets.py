"""Scan tracked files and committed blobs. Report paths only, never matching values."""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = [re.compile(rb"AIza[0-9A-Za-z_-]{35}"),
            re.compile(rb"gh[pousr]_[A-Za-z0-9]{30,}"),
            re.compile(rb"sk-(?:proj-)?[A-Za-z0-9_-]{32,}"),
            re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")]


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


paths = git("ls-files", "-z").decode().split("\0")
failures = []
for name in filter(None, paths):
    if name == ".env" or name.endswith("/secrets.toml") or ".venv/" in name:
        failures.append(name)
    file = ROOT / name
    if file.is_file() and any(pattern.search(file.read_bytes()) for pattern in PATTERNS):
        failures.append(name)
objects = git("rev-list", "--objects", "--all").decode().splitlines()
for line in objects:
    sha, _, name = line.partition(" ")
    if git("cat-file", "-t", sha).strip() == b"blob":
        data = git("cat-file", "blob", sha)
        if any(pattern.search(data) for pattern in PATTERNS):
            failures.append("history:" + name)
if failures:
    print("Possible secrets in paths:", sorted(set(failures)))
    raise SystemExit(1)
print(f"No recognized secret patterns in {len(list(filter(None, paths)))} tracked paths or committed blobs.")
