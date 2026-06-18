from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[3]
SPECS = ROOT / "specs"


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"Expected mapping in {path}")
    return data


def load_all_specs() -> dict[str, Any]:
    return {
        "product": load_yaml(SPECS / "product.yaml"),
        "generations": load_yaml(SPECS / "domain" / "generations.yaml"),
        "regions": load_yaml(SPECS / "domain" / "regions.yaml"),
        "layers": load_yaml(SPECS / "domain" / "layers.yaml"),
        "methodology": load_yaml(SPECS / "domain" / "methodology.yaml"),
        "schema": load_yaml(SPECS / "data" / "schema.yaml"),
        "api": load_yaml(SPECS / "api" / "resources.yaml"),
        "design_tokens": load_yaml(SPECS / "ui" / "design_tokens.yaml"),
        "screens": load_yaml(SPECS / "ui" / "screens.yaml"),
        "ingestion": load_yaml(SPECS / "pipeline" / "ingestion.yaml"),
        "classification": load_yaml(SPECS / "pipeline" / "classification.yaml"),
        "intelligence": load_yaml(SPECS / "pipeline" / "intelligence.yaml"),
        "phase_1": load_yaml(SPECS / "phases" / "phase_1.yaml"),
    }


def load_sources() -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []
    for path in sorted((SPECS / "sources").rglob("*.yaml")):
        if path.name.startswith("_"):
            continue
        doc = load_yaml(path)
        source = doc.get("source")
        if source:
            sources.append(source)
    return sources
