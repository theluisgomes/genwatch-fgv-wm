from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

ROOT = Path(__file__).resolve().parents[2]
API_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "generated" / "python"))
sys.path.insert(0, str(ROOT / "tools" / "spec-cli"))
sys.path.insert(0, str(ROOT / "workers"))
sys.path.insert(0, str(API_DIR))

from auth import optional_auth, require_admin  # noqa: E402
from domain import GENERATIONS, LAYERS, REGIONS, SOURCES  # noqa: E402
from intelligence.pipeline import run_pipeline  # noqa: E402
from reports.generator import generate_inaugural_pdf  # noqa: E402

_cors_origins = os.getenv(
    "GENWATCH_CORS_ORIGINS",
    "http://localhost:3000",
).split(",")
_cors_origins = [origin.strip() for origin in _cors_origins if origin.strip()]

app = FastAPI(title="GenWatch API", version="0.1.0-mvp")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_seed_signals() -> list[dict[str, Any]]:
    signals: list[dict[str, Any]] = []
    for fixture in ["dark_social.json", "fgv_internal.json"]:
        path = ROOT / "data" / "seeds" / fixture
        if not path.exists():
            continue
        for item in json.loads(path.read_text(encoding="utf-8")):
            signals.append(
                {
                    "id": str(uuid4()),
                    "source_id": item["source_id"],
                    "platform": item["platform"],
                    "text": item["text"],
                    "url": None,
                    "collected_at": datetime.now(timezone.utc).isoformat(),
                    "generation_id": item.get("generation_hint"),
                    "region_id": item.get("region_hint"),
                }
            )
    return signals


def _load_seed_insights() -> list[dict[str, Any]]:
    insights: list[dict[str, Any]] = []
    now = datetime.now(timezone.utc).isoformat()
    for generation in GENERATIONS:
        for index, focus in enumerate(generation["intelligence_focus"]):
            insights.append(
                {
                    "id": str(uuid4()),
                    "generation_id": generation["id"],
                    "region_id": REGIONS[index % len(REGIONS)]["id"],
                    "layer": "intelligence",
                    "title": focus,
                    "narrative": (
                        f"Sinal recorrente entre {generation['label']}: {focus.lower()}. "
                        "A lente comportamental indica tensão entre aspiração educacional "
                        "e percepção de risco no contexto FGV."
                    ),
                    "emotional_trigger": ["ansiedade", "aspiracao", "medo"][index % 3],
                    "confidence": 0.72,
                    "tgi_projection": "Projeção TGI (stub): amostra nacional em validação",
                    "created_at": now,
                }
            )
        for output in generation["delivery_outputs"][:1]:
            insights.append(
                {
                    "id": str(uuid4()),
                    "generation_id": generation["id"],
                    "region_id": None,
                    "layer": "delivery",
                    "title": output,
                    "narrative": (
                        f"Direcionamento recomendado para {generation['label']}: {output}. "
                        "Baseado em sinais públicos e escuta etnográfica digital."
                    ),
                    "emotional_trigger": None,
                    "confidence": 0.66,
                    "tgi_projection": None,
                    "created_at": now,
                }
            )
    return insights


SEED_SIGNALS = _load_seed_signals()
SEED_INSIGHTS = _load_seed_insights()


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok", "product": "GenWatch"}


@app.get("/api/v1/generations")
def list_generations() -> list[dict[str, Any]]:
    return [
        {
            "id": g["id"],
            "label": g["label"],
            "cohort": g["cohort"],
            "theme": g["theme"],
            "color": g["color"],
            "education_context": g["education_context"],
            "strategic_questions": g["strategic_questions"],
            "delivery_outputs": g["delivery_outputs"],
        }
        for g in GENERATIONS
    ]


@app.get("/api/v1/generations/{generation_id}/summary")
def generation_summary(
    generation_id: str,
    region_id: str | None = None,
) -> dict[str, Any]:
    generation = next((g for g in GENERATIONS if g["id"] == generation_id), None)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")

    signals = [
        s
        for s in SEED_SIGNALS
        if s["generation_id"] == generation_id
        and (region_id is None or s["region_id"] == region_id)
    ]
    insights = [
        i
        for i in SEED_INSIGHTS
        if i["generation_id"] == generation_id
        and (region_id is None or i["region_id"] == region_id or i["region_id"] is None)
    ]
    return {
        "generation": {
            "id": generation["id"],
            "label": generation["label"],
            "cohort": generation["cohort"],
            "theme": generation["theme"],
            "color": generation["color"],
            "education_context": generation["education_context"],
            "strategic_questions": generation["strategic_questions"],
            "delivery_outputs": generation["delivery_outputs"],
        },
        "signal_count": len(signals),
        "insight_count": len(insights),
        "top_insights": insights[:3],
        "recent_signals": signals[:5],
    }


@app.get("/api/v1/generations/{generation_id}/layers/{layer}")
def generation_layer(
    generation_id: str,
    layer: str,
    region_id: str | None = None,
    limit: int = Query(default=20, le=100),
) -> dict[str, Any]:
    if layer not in {item["id"] for item in LAYERS}:
        raise HTTPException(status_code=404, detail="Layer not found")

    if layer == "capture":
        items = [
            s
            for s in SEED_SIGNALS
            if s["generation_id"] == generation_id
            and (region_id is None or s["region_id"] == region_id)
        ]
    else:
        items = [
            i
            for i in SEED_INSIGHTS
            if i["generation_id"] == generation_id
            and i["layer"] == layer
            and (region_id is None or i["region_id"] == region_id or i["region_id"] is None)
        ]

    return {
        "layer": layer,
        "generation_id": generation_id,
        "items": items[:limit],
    }


@app.get("/api/v1/insights")
def list_insights(
    generation_id: str | None = None,
    region_id: str | None = None,
    layer: str | None = None,
    limit: int = Query(default=50, le=200),
) -> list[dict[str, Any]]:
    items = SEED_INSIGHTS
    if generation_id:
        items = [i for i in items if i["generation_id"] == generation_id]
    if region_id:
        items = [i for i in items if i["region_id"] == region_id or i["region_id"] is None]
    if layer:
        items = [i for i in items if i["layer"] == layer]
    return items[:limit]


@app.get("/api/v1/signals")
def list_signals(
    generation_id: str | None = None,
    source_id: str | None = None,
    limit: int = Query(default=50, le=200),
) -> list[dict[str, Any]]:
    items = SEED_SIGNALS
    if generation_id:
        items = [s for s in items if s["generation_id"] == generation_id]
    if source_id:
        items = [s for s in items if s["source_id"] == source_id]
    return items[:limit]


@app.get("/api/v1/ingestion/runs")
def list_ingestion_runs(_: None = Depends(require_admin)) -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    return [
        {
            "id": str(uuid4()),
            "source_id": source["id"],
            "status": "success" if source["type"] == "stub" else "pending",
            "record_count": 3 if source["type"] == "stub" else 0,
            "error_message": None,
            "started_at": now,
            "finished_at": now if source["type"] == "stub" else None,
        }
        for source in SOURCES
    ]


@app.post("/api/v1/ingestion/run/{source_id}")
def trigger_ingestion(source_id: str, _: None = Depends(require_admin)) -> dict[str, Any]:
    source = next((s for s in SOURCES if s["id"] == source_id), None)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": str(uuid4()),
        "source_id": source_id,
        "status": "success",
        "record_count": 3,
        "error_message": None,
        "started_at": now,
        "finished_at": now,
    }


GENERATION_VOLUME = {
    "alfa": 420,
    "z": 1280,
    "millennial": 940,
    "x": 610,
    "boomer": 380,
}

TRIGGER_COLORS = {
    "ansiedade": "#f9a8d4",
    "aspiracao": "#3ecfaa",
    "medo": "#fca5a5",
    "pertencimento": "#c4b5fd",
    "proposito": "#fcd34d",
}

REGION_COLORS = {
    "norte": "#6ee7b7",
    "nordeste": "#fcd34d",
    "centro_oeste": "#fdba74",
    "sudeste": "#3ecfaa",
    "sul": "#a5b4fc",
}


def _analytics_overview() -> dict[str, Any]:
    generation_pulse = []
    confidence_by_generation = []
    layer_pipeline = []

    for generation in GENERATIONS:
        gid = generation["id"]
        gen_insights = [i for i in SEED_INSIGHTS if i["generation_id"] == gid]
        gen_signals = [s for s in SEED_SIGNALS if s["generation_id"] == gid]
        signal_total = GENERATION_VOLUME.get(gid, 300) + len(gen_signals) * 12
        insight_total = len(gen_insights)
        avg_confidence = (
            round(sum(i["confidence"] for i in gen_insights) / len(gen_insights), 2)
            if gen_insights
            else 0.5
        )
        intelligence_count = sum(1 for i in gen_insights if i["layer"] == "intelligence")
        delivery_count = sum(1 for i in gen_insights if i["layer"] == "delivery")

        generation_pulse.append(
            {
                "id": gid,
                "label": generation["label"],
                "color": generation["color"],
                "signals": signal_total,
                "insights": insight_total,
                "confidence": avg_confidence,
                "theme": generation["theme"],
            }
        )
        confidence_by_generation.append(
            {
                "generation": generation["label"],
                "confidence": round(avg_confidence * 100),
                "color": generation["color"],
            }
        )
        layer_pipeline.append(
            {
                "generation": generation["label"],
                "color": generation["color"],
                "capture": signal_total,
                "intelligence": intelligence_count,
                "delivery": delivery_count,
            }
        )

    trigger_counts: dict[str, int] = {}
    for insight in SEED_INSIGHTS:
        trigger = insight.get("emotional_trigger")
        if trigger:
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
    for trigger in ["ansiedade", "aspiracao", "medo", "pertencimento", "proposito"]:
        trigger_counts.setdefault(trigger, 0)
    emotional_triggers = [
        {
            "trigger": key,
            "label": key.capitalize(),
            "count": value,
            "color": TRIGGER_COLORS.get(key, "#3ecfaa"),
        }
        for key, value in sorted(trigger_counts.items(), key=lambda item: item[1], reverse=True)
        if value > 0 or key in {"ansiedade", "aspiracao", "medo"}
    ]
    for item in emotional_triggers:
        if item["count"] == 0:
            item["count"] = 2

    regional_distribution = []
    for region in REGIONS:
        rid = region["id"]
        region_insights = [
            i for i in SEED_INSIGHTS if i.get("region_id") == rid or i.get("region_id") is None
        ]
        regional_distribution.append(
            {
                "region": region["label"],
                "region_id": rid,
                "insights": max(2, len(region_insights) // 2 + 2),
                "signals": sum(GENERATION_VOLUME.values()) // 5 + (hash(rid) % 200),
                "color": REGION_COLORS.get(rid, "#3ecfaa"),
            }
        )

    source_mix = []
    for source in SOURCES:
        weight = 12 if source["type"] == "live" else 8
        if source["id"] == "reddit":
            weight = 28
        elif source["id"] == "google_trends":
            weight = 24
        elif source["id"] == "dark_social_stub":
            weight = 32
        source_mix.append(
            {
                "source": source["id"],
                "label": source["id"].replace("_", " ").title(),
                "type": source["type"],
                "value": weight,
                "color": "#818cf8" if source["type"] == "stub" else "#3ecfaa",
            }
        )

    weeks = [f"Sem {index}" for index in range(1, 9)]
    signal_trend = []
    for index, week in enumerate(weeks):
        row: dict[str, Any] = {"week": week}
        multiplier = 0.55 + (index * 0.08)
        for generation in GENERATIONS:
            gid = generation["id"]
            base = GENERATION_VOLUME.get(gid, 300) / 8
            row[gid] = int(base * multiplier + (index * 15) + (hash(gid) % 40))
        signal_trend.append(row)

    radar_dimensions = ["Sinais", "Insights", "Confiança", "Urgência", "Cobertura"]
    generation_radar = []
    urgency_map = {"z": 92, "millennial": 78, "x": 85, "alfa": 70, "boomer": 55}
    for item in generation_pulse:
        generation_radar.append(
            {
                "generation": item["label"],
                "color": item["color"],
                "Sinais": min(100, int(item["signals"] / 15)),
                "Insights": min(100, item["insights"] * 12),
                "Confiança": int(item["confidence"] * 100),
                "Urgência": urgency_map.get(item["id"], 65),
                "Cobertura": min(100, 55 + (hash(item["id"]) % 35)),
            }
        )

    return {
        "generation_pulse": generation_pulse,
        "signal_trend": signal_trend,
        "emotional_triggers": emotional_triggers,
        "regional_distribution": regional_distribution,
        "source_mix": source_mix,
        "layer_pipeline": layer_pipeline,
        "confidence_by_generation": confidence_by_generation,
        "generation_radar": generation_radar,
        "radar_dimensions": radar_dimensions,
        "totals": {
            "signals": sum(item["signals"] for item in generation_pulse),
            "insights": sum(item["insights"] for item in generation_pulse),
            "generations": len(GENERATIONS),
            "regions": len(REGIONS),
        },
    }


@app.get("/api/v1/analytics/overview")
def analytics_overview() -> dict[str, Any]:
    return _analytics_overview()


def _analytics_generation(generation_id: str) -> dict[str, Any]:
    generation = next((g for g in GENERATIONS if g["id"] == generation_id), None)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")

    gid = generation["id"]
    gen_insights = [i for i in SEED_INSIGHTS if i["generation_id"] == gid]
    gen_signals = [s for s in SEED_SIGNALS if s["generation_id"] == gid]
    signal_total = GENERATION_VOLUME.get(gid, 300) + len(gen_signals) * 12
    intelligence_count = sum(1 for i in gen_insights if i["layer"] == "intelligence")
    delivery_count = sum(1 for i in gen_insights if i["layer"] == "delivery")

    weeks = [f"Sem {index}" for index in range(1, 9)]
    base = GENERATION_VOLUME.get(gid, 300) / 8
    signal_trend = []
    confidence_trend = []
    avg_confidence = (
        round(sum(i["confidence"] for i in gen_insights) / len(gen_insights), 2)
        if gen_insights
        else 0.5
    )
    for index, week in enumerate(weeks):
        multiplier = 0.55 + (index * 0.08)
        signal_trend.append(
            {
                "week": week,
                "signals": int(base * multiplier + (index * 15) + (hash(gid) % 40)),
            }
        )
        confidence_trend.append(
            {
                "week": week,
                "confidence": min(95, int(avg_confidence * 100) - 8 + index * 2),
            }
        )

    trigger_counts: dict[str, int] = {}
    for insight in gen_insights:
        trigger = insight.get("emotional_trigger")
        if trigger:
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
    if not trigger_counts:
        trigger_counts = {"ansiedade": 3, "aspiracao": 2, "medo": 1}
    emotional_triggers = [
        {
            "trigger": key,
            "label": key.capitalize(),
            "count": value,
            "color": TRIGGER_COLORS.get(key, generation["color"]),
        }
        for key, value in sorted(trigger_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    regional_signals = []
    for region in REGIONS:
        rid = region["id"]
        regional_signals.append(
            {
                "region": region["label"],
                "region_id": rid,
                "signals": int(signal_total / 5 + (hash(f"{gid}-{rid}") % 80)),
                "insights": max(1, len([i for i in gen_insights if i.get("region_id") == rid]) + 1),
                "color": REGION_COLORS.get(rid, "#3ecfaa"),
            }
        )

    source_ids = generation.get("signal_sources", [])
    source_mix = []
    for source in SOURCES:
        if source["id"] not in source_ids:
            continue
        weight = 20 + (hash(f"{gid}-{source['id']}") % 25)
        if source["type"] == "stub":
            weight += 8
        source_mix.append(
            {
                "source": source["id"],
                "label": source["id"].replace("_", " ").replace(" stub", "").title(),
                "type": source["type"],
                "value": weight,
                "color": "#818cf8" if source["type"] == "stub" else generation["color"],
            }
        )

    layer_funnel = [
        {"stage": "Captação", "value": signal_total, "color": "#818cf8"},
        {"stage": "Inteligência", "value": intelligence_count * 45, "color": "#3ecfaa"},
        {"stage": "Entregas", "value": delivery_count * 60, "color": "#fcd34d"},
    ]

    intelligence_focus = [
        {
            "topic": focus[:42] + ("…" if len(focus) > 42 else ""),
            "intensity": 55 + (index * 12) + (hash(f"{gid}-{index}") % 20),
            "color": generation["color"],
        }
        for index, focus in enumerate(generation.get("intelligence_focus", []))
    ]

    delivery_outputs = [
        {"output": output[:40] + ("…" if len(output) > 40 else ""), "priority": 90 - index * 15}
        for index, output in enumerate(generation.get("delivery_outputs", []))
    ]

    benchmark = []
    overview = _analytics_overview()
    for pulse in overview["generation_pulse"]:
        benchmark.append(
            {
                "generation": pulse["label"],
                "signals": pulse["signals"],
                "is_current": pulse["id"] == gid,
                "color": pulse["color"] if pulse["id"] == gid else "rgba(255,255,255,0.15)",
            }
        )

    return {
        "generation_id": gid,
        "label": generation["label"],
        "color": generation["color"],
        "theme": generation["theme"],
        "signal_trend": signal_trend,
        "confidence_trend": confidence_trend,
        "emotional_triggers": emotional_triggers,
        "regional_signals": regional_signals,
        "source_mix": source_mix,
        "layer_funnel": layer_funnel,
        "intelligence_focus": intelligence_focus,
        "delivery_outputs": delivery_outputs,
        "benchmark": benchmark,
        "totals": {
            "signals": signal_total,
            "insights": len(gen_insights),
            "confidence": avg_confidence,
        },
    }


@app.get("/api/v1/analytics/generations/{generation_id}")
def analytics_generation(generation_id: str) -> dict[str, Any]:
    return _analytics_generation(generation_id)


@app.post("/api/v1/pipeline/run")
def pipeline_run(_: str = Depends(optional_auth)) -> dict[str, Any]:
    global SEED_INSIGHTS
    result = run_pipeline(SEED_SIGNALS, GENERATIONS)
    SEED_INSIGHTS = result["insights"]
    return {
        "processed_count": result["processed_count"],
        "insight_count": result["insight_count"],
    }


@app.get("/api/v1/reports/inaugural")
def inaugural_report(_: str = Depends(optional_auth)) -> Response:
    pdf_bytes = generate_inaugural_pdf(SEED_INSIGHTS, GENERATIONS)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="genwatch-inaugural.pdf"'},
    )
