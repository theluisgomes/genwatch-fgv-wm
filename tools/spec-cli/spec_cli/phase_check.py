from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[3]
SPECS = ROOT / "specs"


def load_phase(phase_id: int) -> dict[str, Any]:
    path = SPECS / "phases" / f"phase_{phase_id}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Missing phase spec: {path}")
    return yaml.safe_load(path.read_text(encoding="utf-8"))


from spec_cli.loader import load_sources


def _spec_path_from_criterion(rel: str) -> str:
    token = rel.split()[0]
    return token


def check_phase(phase_id: int) -> list[str]:
    errors: list[str] = []
    phase = load_phase(phase_id)
    criteria = phase.get("acceptance_criteria", [])

    for raw_criterion in criteria:
        if isinstance(raw_criterion, dict):
            key = next(iter(raw_criterion))
            criterion = f"{key}: {raw_criterion[key]}"
        else:
            criterion = str(raw_criterion)

        if criterion.startswith("spec:"):
            rel = criterion.split(":", 1)[1].strip()

            if rel.startswith("sources include"):
                sources = load_sources()
                live = [s for s in sources if s.get("type") == "live"]
                stub = [s for s in sources if s.get("type") == "stub"]
                if len(live) < 4 or len(stub) < 3:
                    errors.append("Expected 4 live and 3 stub sources")
                continue

            if "defines all 5 screens" in rel:
                screens = yaml.safe_load((SPECS / "ui" / "screens.yaml").read_text(encoding="utf-8"))
                if len(screens.get("screens", [])) < 5:
                    errors.append("ui/screens.yaml must define 5 screens")
                continue

            rel_path = _spec_path_from_criterion(rel)
            candidates = [
                SPECS / rel_path,
                ROOT / rel_path,
                SPECS / "domain" / rel_path,
                SPECS / "pipeline" / rel_path,
                SPECS / "sources" / rel_path,
                SPECS / "ui" / rel_path,
                SPECS / "reports" / rel_path,
                SPECS / "data" / rel_path,
                SPECS / "api" / rel_path,
                ROOT / "generated" / rel_path,
            ]
            if not any(path.exists() for path in candidates):
                errors.append(f"Missing spec artifact for criterion: {criterion}")

        if criterion.startswith("test:"):
            test_name = criterion.split(":", 1)[1].strip()
            if test_name == "pipeline processes signals into insights":
                try:
                    import sys

                    sys.path.insert(0, str(ROOT / "workers"))
                    from intelligence.pipeline import run_pipeline  # noqa: WPS433

                    result = run_pipeline(
                        [{"id": "1", "text": "Medo do vestibular e ENEM em São Paulo", "generation_id": "z"}],
                        [{"id": "z", "label": "Gen Z", "theme": "Vestibular"}],
                    )
                    if result["insight_count"] < 1:
                        errors.append("Pipeline produced no insights")
                except Exception as exc:  # pragma: no cover - surfaced in CLI
                    errors.append(f"Pipeline test failed: {exc}")

            if test_name == "3+ insights per generation available":
                insights_path = ROOT / "apps" / "api" / "main.py"
                if not insights_path.exists():
                    errors.append("API main module missing for insight count test")

            if test_name == "PDF report endpoint returns valid document":
                report_spec = SPECS / "reports" / "inaugural.yaml"
                if not report_spec.exists():
                    errors.append("Missing inaugural report spec")

    schema_path = SPECS / "schemas" / "phase.schema.json"
    if schema_path.exists():
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        if "phase" not in phase or "acceptance_criteria" not in phase:
            errors.append("Phase spec does not match schema shape")

    if not criteria:
        errors.append(f"Phase {phase_id} has no acceptance criteria")

    return errors
