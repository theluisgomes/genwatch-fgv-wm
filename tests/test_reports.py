from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "workers"))

from reports.generator import generate_inaugural_pdf  # noqa: E402


def test_generate_inaugural_pdf() -> None:
    insights = [
        {
            "generation_id": "z",
            "title": "Ansiedade vestibular",
            "narrative": "Sinal recorrente entre jovens.",
            "emotional_trigger": "ansiedade",
            "tgi_projection": "2.4 milhões de jovens",
        }
    ]
    generations = [{"id": "z", "label": "Gen Z", "theme": "Vestibular", "cohort": "1997–2009"}]
    pdf = generate_inaugural_pdf(insights, generations)
    assert pdf.startswith(b"%PDF")
    assert len(pdf) > 500
