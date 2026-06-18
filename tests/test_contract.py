from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "spec-cli"))
sys.path.insert(0, str(ROOT / "workers"))

from spec_cli.validate import validate_specs  # noqa: E402
from ingestion.adapters import RedditAdapter, StubAdapter  # noqa: E402


def test_specs_validate() -> None:
    assert validate_specs() == []


def test_stub_adapter_reads_fixture() -> None:
    adapter = StubAdapter(
        "dark_social_stub",
        "whatsapp",
        "data/seeds/dark_social.json",
    )
    records = adapter.fetch()
    assert len(records) >= 1
    assert records[0].platform == "whatsapp"


def test_reddit_adapter_placeholder() -> None:
    adapter = RedditAdapter()
    records = adapter.fetch(generation_id="z")
    assert records[0].generation_hint == "z"
