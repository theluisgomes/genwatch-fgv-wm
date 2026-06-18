from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[2]


def _load_classification() -> dict[str, Any]:
    path = ROOT / "specs" / "pipeline" / "classification.yaml"
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def classify_generation(text: str) -> str | None:
    config = _load_classification()
    lowered = text.lower()
    best_id: str | None = None
    best_score = 0
    for generation_id, rules in config["classification"]["generation_rules"].items():
        score = sum(1 for keyword in rules["keywords"] if keyword in lowered)
        if score > best_score:
            best_score = score
            best_id = generation_id
    return best_id


def classify_region(text: str) -> str | None:
    config = _load_classification()
    lowered = text.lower()
    best_id: str | None = None
    best_score = 0
    for region_id, rules in config["classification"]["region_rules"].items():
        score = sum(1 for keyword in rules["keywords"] if keyword in lowered)
        if score > best_score:
            best_score = score
            best_id = region_id
    return best_id
