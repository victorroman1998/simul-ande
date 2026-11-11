from pathlib import Path
import sys
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from engine import load_case


@pytest.fixture
def case():
    return load_case()

