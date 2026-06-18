from __future__ import annotations

from pathlib import Path

import typer
from rich.console import Console

from spec_cli.codegen import GENERATED, generate_all
from spec_cli.loader import ROOT, load_all_specs, load_sources
from spec_cli.phase_check import check_phase
from spec_cli.validate import validate_or_raise, validate_specs

TEXT_SUFFIXES = {".py", ".ts", ".js", ".sql", ".json", ".j2", ".md", ".yaml", ".yml"}


def _is_text_artifact(path: Path) -> bool:
    return path.suffix in TEXT_SUFFIXES

app = typer.Typer(help="GenWatch spec-driven development CLI")
console = Console()


@app.command()
def validate() -> None:
    """Validate YAML specs and cross-references."""
    errors = validate_specs()
    if errors:
        console.print("[red]Spec validation failed[/red]")
        for error in errors:
            console.print(f"  - {error}")
        raise typer.Exit(code=1)
    console.print("[green]All specs valid[/green]")


@app.command("codegen")
def codegen(check: bool = typer.Option(False, "--check")) -> None:
    """Generate artifacts from specs into generated/."""
    validate_or_raise()
    before: dict[str, str] = {}
    if check and GENERATED.exists():
        for path in GENERATED.rglob("*"):
            if path.is_file() and _is_text_artifact(path):
                before[str(path.relative_to(ROOT))] = path.read_text(encoding="utf-8")

    paths = generate_all()
    console.print(f"[green]Generated {len(paths)} artifacts[/green]")
    for path in paths:
        if path.is_file():
            console.print(f"  {path.relative_to(ROOT)}")

    if check:
        changed = []
        for rel, old in before.items():
            new = (ROOT / rel).read_text(encoding="utf-8")
            if new != old:
                changed.append(rel)
        for path in GENERATED.rglob("*"):
            if path.is_file() and _is_text_artifact(path):
                rel = str(path.relative_to(ROOT))
                if rel not in before:
                    changed.append(rel)
        if changed:
            console.print("[red]Generated artifacts drift detected:[/red]")
            for item in changed:
                console.print(f"  - {item}")
            raise typer.Exit(code=1)
        console.print("[green]No codegen drift[/green]")


@app.command()
def seed() -> None:
    """Print summary of available seed fixtures."""
    seeds = ROOT / "data" / "seeds"
    if not seeds.exists():
        console.print("[yellow]No seeds directory yet[/yellow]")
        return
    for path in sorted(seeds.glob("*.json")):
        console.print(f"  {path.name}")


@app.command()
def check() -> None:
    """Run lightweight contract checks against specs."""
    validate_or_raise()
    specs = load_all_specs()
    sources = load_sources()
    live_sources = [s for s in sources if s.get("type") == "live"]
    stub_sources = [s for s in sources if s.get("type") == "stub"]

    if len(live_sources) < 2:
        raise typer.Exit("Expected at least 2 live sources")
    if len(stub_sources) < 3:
        raise typer.Exit("Expected at least 3 stub sources")

    generations = specs["generations"]["generations"]
    for generation in generations:
        if len(generation.get("delivery_outputs", [])) < 3:
            raise typer.Exit(
                f"Generation {generation['id']} must have at least 3 delivery outputs"
            )

    console.print("[green]Contract checks passed[/green]")


@app.command()
def summary() -> None:
    """Print spec summary."""
    specs = load_all_specs()
    product = specs["product"]["product"]
    generations = specs["generations"]["generations"]
    sources = load_sources()
    console.print(f"[bold]{product['name']}[/bold] v{product['version']}")
    console.print(f"Generations: {len(generations)}")
    console.print(f"Sources: {len(sources)} ({sum(1 for s in sources if s['type']=='live')} live)")


@app.command("phase-check")
def phase_check_cmd(phase: int = typer.Option(..., "--phase")) -> None:
    """Validate acceptance criteria for a roadmap phase."""
    validate_or_raise()
    errors = check_phase(phase)
    if errors:
        console.print(f"[red]Phase {phase} gate failed[/red]")
        for error in errors:
            console.print(f"  - {error}")
        raise typer.Exit(code=1)
    console.print(f"[green]Phase {phase} gate passed[/green]")


@app.command()
def diff() -> None:
    """List spec files tracked for review."""
    for path in sorted((ROOT / "specs").rglob("*.yaml")):
        console.print(path.relative_to(ROOT))


if __name__ == "__main__":
    app()
