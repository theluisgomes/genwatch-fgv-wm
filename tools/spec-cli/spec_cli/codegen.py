from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jinja2 import Template

from spec_cli.loader import ROOT, load_all_specs, load_sources

GENERATED = ROOT / "generated"


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def generate_pydantic_models(specs: dict[str, Any]) -> None:
    entities = specs["schema"]["entities"]
    lines = [
        '"""Generated from specs/data/schema.yaml. Do not edit."""',
        "from __future__ import annotations",
        "",
        "from datetime import datetime",
        "from typing import Any, Literal",
        "from uuid import UUID",
        "",
        "from pydantic import BaseModel, Field",
        "",
    ]

    type_map = {
        "uuid": "UUID",
        "string": "str",
        "text": "str",
        "integer": "int",
        "float": "float",
        "boolean": "bool",
        "timestamptz": "datetime",
        "jsonb": "dict[str, Any]",
        "uuid_array": "list[UUID]",
    }

    for entity_name, entity in entities.items():
        class_name = "".join(part.title() for part in entity_name.split("_"))
        lines.append(f"class {class_name}(BaseModel):")
        for field_name, field in entity["fields"].items():
            py_type = type_map.get(field["type"], "Any")
            if field.get("type") == "enum":
                values = " | ".join(f'"{value}"' for value in field["values"])
                py_type = values
            if field.get("nullable") or not field.get("required"):
                py_type = f"{py_type} | None"
                default = " = None"
            elif "default" in field:
                default = f" = {json.dumps(field['default'])}"
            else:
                default = ""
            lines.append(f"    {field_name}: {py_type}{default}")
        lines.append("")

    _write(GENERATED / "python" / "models.py", "\n".join(lines) + "\n")


def generate_typescript_types(specs: dict[str, Any]) -> None:
    generations = specs["generations"]["generations"]
    regions = specs["regions"]["regions"]
    layers = specs["layers"]["layers"]

    gen_ids = " | ".join(f'"{g["id"]}"' for g in generations)
    region_ids = " | ".join(f'"{r["id"]}"' for r in regions)
    layer_ids = " | ".join(f'"{l["id"]}"' for l in layers)

    content = f"""// Generated from specs/. Do not edit.

export type GenerationId = {gen_ids};
export type RegionId = {region_ids};
export type LayerId = {layer_ids};

export interface GenerationSummary {{
  id: GenerationId;
  label: string;
  cohort: string;
  theme: string;
  color: string;
  education_context: string;
  strategic_questions: string[];
  delivery_outputs: string[];
}}

export interface Insight {{
  id: string;
  generation_id: GenerationId;
  region_id?: RegionId | null;
  layer: LayerId;
  title: string;
  narrative: string;
  emotional_trigger?: string | null;
  confidence: number;
  tgi_projection?: string | null;
  created_at: string;
}}

export interface RawSignal {{
  id: string;
  source_id: string;
  platform: string;
  text: string;
  url?: string | null;
  collected_at: string;
  generation_id?: GenerationId | null;
  region_id?: RegionId | null;
}}

export interface GenerationDashboard {{
  generation: GenerationSummary;
  signal_count: number;
  insight_count: number;
  top_insights: Insight[];
  recent_signals: RawSignal[];
}}

export interface LayerDetail {{
  layer: LayerId;
  generation_id: GenerationId;
  items: Array<Insight | RawSignal>;
}}

export interface IngestionRun {{
  id: string;
  source_id: string;
  status: "pending" | "running" | "success" | "failed";
  record_count: number;
  error_message?: string | null;
  started_at: string;
  finished_at?: string | null;
}}

export interface DesignTokens {{
  colors: Record<string, string | Record<string, string>>;
  fonts: {{ sans: string; display: string }};
}}
"""
    _write(GENERATED / "typescript" / "types.ts", content)


def generate_openapi(specs: dict[str, Any]) -> None:
    api = specs["api"]["api"]
    paths: dict[str, Any] = {}
    for resource in api["resources"]:
        path = resource["path"].replace("{generation_id}", "{generation_id}").replace(
            "{layer}", "{layer}"
        ).replace("{source_id}", "{source_id}")
        openapi_path = f"/api/v1{path}" if not path.startswith("/api") else path
        method = resource["method"].lower()
        paths.setdefault(openapi_path, {})[method] = {
            "summary": f"{method.upper()} {openapi_path}",
            "responses": {"200": {"description": "OK"}},
        }

    document = {
        "openapi": "3.1.0",
        "info": {
            "title": specs["product"]["product"]["name"],
            "version": specs["product"]["product"]["version"],
        },
        "paths": paths,
    }
    _write(
        GENERATED / "openapi" / "openapi.json",
        json.dumps(document, indent=2, ensure_ascii=False) + "\n",
    )


def generate_sql(specs: dict[str, Any]) -> None:
    entities = specs["schema"]["entities"]
    sql_type_map = {
        "uuid": "UUID",
        "string": "TEXT",
        "text": "TEXT",
        "integer": "INTEGER",
        "float": "DOUBLE PRECISION",
        "boolean": "BOOLEAN",
        "timestamptz": "TIMESTAMPTZ",
        "jsonb": "JSONB",
        "uuid_array": "UUID[]",
    }

    lines = ["-- Generated from specs/data/schema.yaml", ""]
    for entity_name, entity in entities.items():
        lines.append(f"CREATE TABLE IF NOT EXISTS {entity_name} (")
        field_lines = []
        for field_name, field in entity["fields"].items():
            if field.get("type") == "enum":
                sql_type = "TEXT"
            else:
                sql_type = sql_type_map.get(field["type"], "TEXT")
            nullable = " NOT NULL" if field.get("required") or field.get("primary") else ""
            if field.get("primary"):
                field_lines.append(f"  {field_name} {sql_type} PRIMARY KEY")
            else:
                field_lines.append(f"  {field_name} {sql_type}{nullable}")
        lines.append(",\n".join(field_lines))
        lines.append(");")
        lines.append("")

    _write(GENERATED / "sql" / "001_schema.sql", "\n".join(lines) + "\n")


def generate_tailwind_config(specs: dict[str, Any]) -> None:
    tokens = specs["design_tokens"]["design_tokens"]
    colors = tokens["colors"]
    content = f"""// Generated from specs/ui/design_tokens.yaml
module.exports = {{
  theme: {{
    extend: {{
      colors: {{
        background: "{colors['background']}",
        foreground: "{colors['foreground']}",
        muted: "{colors['muted']}",
        accent: "{colors['accent']}",
        generation: {json.dumps(colors['generations'], indent=8)},
      }},
      fontFamily: {{
        sans: ["Inter", "sans-serif"],
        display: ['"Google Sans Variable"', '"Google Sans"', "sans-serif"],
      }},
    }},
  }},
}};
"""
    _write(GENERATED / "typescript" / "tailwind.extend.js", content)


def generate_prompts(specs: dict[str, Any]) -> None:
    prompts = specs["intelligence"]["intelligence"]["prompts"]
    for name, prompt in prompts.items():
        template = Template(
            f"SYSTEM:\n{prompt['system']}\n\nUSER:\n{prompt['user_template']}\n"
        )
        _write(GENERATED / "prompts" / f"{name}.j2", template.render())


def generate_domain_constants(specs: dict[str, Any]) -> None:
    generations = specs["generations"]["generations"]
    regions = specs["regions"]["regions"]
    layers = specs["layers"]["layers"]
    sources = load_sources()

    _write(
        GENERATED / "python" / "domain.py",
        "GENERATIONS = "
        + json.dumps(generations, indent=2, ensure_ascii=False)
        + "\n\nREGIONS = "
        + json.dumps(regions, indent=2, ensure_ascii=False)
        + "\n\nLAYERS = "
        + json.dumps(layers, indent=2, ensure_ascii=False)
        + "\n\nSOURCES = "
        + json.dumps(sources, indent=2, ensure_ascii=False)
        + "\n",
    )


def generate_all() -> list[Path]:
    specs = load_all_specs()
    generate_pydantic_models(specs)
    generate_typescript_types(specs)
    generate_openapi(specs)
    generate_sql(specs)
    generate_tailwind_config(specs)
    generate_prompts(specs)
    generate_domain_constants(specs)
    return sorted(GENERATED.rglob("*"))
