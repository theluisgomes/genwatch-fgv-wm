from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "workers"))

from intelligence.classifier import classify_generation, classify_region  # noqa: E402
from intelligence.pipeline import (  # noqa: E402
    analyze_sentiment,
    extract_topics,
    process_signal,
    run_pipeline,
)


def test_classify_generation_gen_z() -> None:
    assert classify_generation("Estou preocupado com o vestibular e ENEM") == "z"


def test_classify_region_sudeste() -> None:
    assert classify_region("Estudantes de São Paulo comentam sobre faculdade") == "sudeste"


def test_sentiment_negative() -> None:
    assert analyze_sentiment("Tenho medo e ansiedade com o vestibular") == "negative"


def test_extract_topics() -> None:
    topics = extract_topics("MBA executivo e carreira na FGV")
    assert any("MBA" in topic for topic in topics)


def test_process_signal_returns_narrative() -> None:
    processed = process_signal(
        {"id": "1", "text": "Medo do vestibular em São Paulo", "generation_id": "z"},
        {"z": {"label": "Gen Z", "theme": "Vestibular"}},
    )
    assert processed.narrative
    assert processed.emotional_trigger


def test_run_pipeline_generates_insights() -> None:
    result = run_pipeline(
        [{"id": "1", "text": "Ansiedade com ENEM e faculdade", "generation_id": "z"}],
        [{"id": "z", "label": "Gen Z", "theme": "Vestibular"}],
    )
    assert result["processed_count"] == 1
    assert result["insight_count"] >= 2
