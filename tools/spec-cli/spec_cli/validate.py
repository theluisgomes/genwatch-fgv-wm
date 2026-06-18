from __future__ import annotations

from typing import Any

from spec_cli.loader import ROOT, load_all_specs, load_sources


def validate_specs() -> list[str]:
    errors: list[str] = []
    specs = load_all_specs()
    generations = specs["generations"]["generations"]
    regions = specs["regions"]["regions"]
    layers = specs["layers"]["layers"]

    generation_ids = {item["id"] for item in generations}
    region_ids = {item["id"] for item in regions}
    layer_ids = {item["id"] for item in layers}

    if len(generation_ids) != 5:
        errors.append("Expected exactly 5 generations")

    if len(region_ids) != 5:
        errors.append("Expected exactly 5 regions")

    if len(layer_ids) != 3:
        errors.append("Expected exactly 3 layers")

    for generation in generations:
        for source_id in generation.get("signal_sources", []):
            known = {source["id"] for source in load_sources()}
            if source_id not in known:
                errors.append(
                    f"Generation {generation['id']} references unknown source {source_id}"
                )

    entities = specs["schema"].get("entities", {})
    if "raw_signals" not in entities or "insights" not in entities:
        errors.append("schema.yaml must define raw_signals and insights entities")

    for resource in specs["api"]["api"]["resources"]:
        if "path" not in resource or "method" not in resource:
            errors.append("API resource missing path or method")

    for phase_id in range(1, 5):
        phase_path = ROOT / "specs" / "phases" / f"phase_{phase_id}.yaml"
        if not phase_path.exists():
            errors.append(f"Missing phase spec: phase_{phase_id}.yaml")

    colors = specs["design_tokens"]["design_tokens"]["colors"]
    if colors.get("background") != "#0e1520" or colors.get("accent") != "#3ecfaa":
        errors.append("design_tokens colors do not match one-pager palette")

    return errors


def validate_or_raise() -> None:
    errors = validate_specs()
    if errors:
        raise SystemExit("Spec validation failed:\n- " + "\n- ".join(errors))
