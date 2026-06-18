from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools" / "spec-cli"))
sys.path.insert(0, str(ROOT / "workers"))

from ingestion.runner import build_adapters  # noqa: E402
from spec_cli.phase_check import check_phase  # noqa: E402


def test_all_adapters_registered() -> None:
    adapters = build_adapters()
    assert len(adapters) >= 7


def test_phase_1_gate() -> None:
    assert check_phase(1) == []


def test_phase_4_report_spec() -> None:
    errors = check_phase(4)
    assert not any("inaugural" in error for error in errors)
