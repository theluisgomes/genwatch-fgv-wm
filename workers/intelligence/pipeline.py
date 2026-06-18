from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import yaml

from intelligence.classifier import classify_generation, classify_region

ROOT = Path(__file__).resolve().parents[2]

POSITIVE = {"bom", "ótimo", "excelente", "aspiração", "oportunidade", "crescimento"}
NEGATIVE = {"medo", "ansiedade", "preocupação", "caro", "difícil", "crise", "irrelevante"}
TOPIC_KEYWORDS = {
    "vestibular": "Vestibular e ENEM",
    "mba": "MBA e pós-graduação",
    "faculdade": "Valor da faculdade",
    "educação": "Educação e aprendizado",
    "carreira": "Carreira e mercado",
    "ia": "Inteligência artificial",
    "fgv": "Prestígio institucional FGV",
}


@dataclass
class ProcessedSignal:
    raw_signal_id: str
    sentiment: str
    topics: list[str]
    emotional_trigger: str | None
    cultural_shift: bool
    narrative: str
    actionable_recommendation: str
    generation_id: str | None
    region_id: str | None
    tgi_projection: str | None
    processed_at: str


@dataclass
class GeneratedInsight:
    id: str
    generation_id: str
    region_id: str | None
    layer: str
    title: str
    narrative: str
    emotional_trigger: str | None
    confidence: float
    tgi_projection: str | None
    created_at: str


def _load_intelligence_spec() -> dict[str, Any]:
    path = ROOT / "specs" / "pipeline" / "intelligence.yaml"
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def analyze_sentiment(text: str) -> str:
    lowered = text.lower()
    pos = sum(1 for word in POSITIVE if word in lowered)
    neg = sum(1 for word in NEGATIVE if word in lowered)
    if neg > pos:
        return "negative"
    if pos > neg:
        return "positive"
    return "neutral"


def extract_topics(text: str, max_topics: int = 5) -> list[str]:
    lowered = text.lower()
    topics = [label for key, label in TOPIC_KEYWORDS.items() if key in lowered]
    if not topics:
        topics = ["Educação e aprendizado"]
    return topics[:max_topics]


def _load_tgi_projection(generation_id: str, region_id: str | None) -> str:
    path = ROOT / "data" / "seeds" / "tgi_weights.json"
    weights = json.loads(path.read_text(encoding="utf-8"))
    for item in weights:
        if item["generation_id"] == generation_id:
            if region_id is None or item["region_id"] == region_id:
                return item["projected_value"]
    return "Projeção TGI (stub): amostra nacional em validação"


def behavioral_lens(
    text: str,
    generation_id: str | None,
    topics: list[str],
    sentiment: str,
    generation_label: str = "Geração",
    generation_theme: str = "Educação",
) -> dict[str, Any]:
    trigger_map = {
        "negative": "ansiedade",
        "positive": "aspiracao",
        "neutral": "pertencimento",
    }
    emotional_trigger = trigger_map.get(sentiment, "proposito")
    cultural_shift = any(word in text.lower() for word in ["mudou", "diferente", "antes", "hoje", "2025"])
    narrative = (
        f"A lente comportamental identifica em {generation_label} uma leitura de {topics[0].lower()} "
        f"com tom {sentiment}. O tema '{generation_theme}' aparece como eixo central do sinal."
    )
    recommendation = (
        f"Comunicar com {generation_label} enfatizando {topics[0].lower()} "
        f"e respondendo ao gatilho de {emotional_trigger}."
    )
    return {
        "emotional_trigger": emotional_trigger,
        "cultural_shift": cultural_shift,
        "narrative": narrative,
        "actionable_recommendation": recommendation,
    }


def process_signal(signal: dict[str, Any], generation_lookup: dict[str, dict[str, Any]]) -> ProcessedSignal:
    spec = _load_intelligence_spec()
    max_topics = 5
    for step in spec["intelligence"]["steps"]:
        if step["id"] == "topic_extract":
            max_topics = step.get("max_topics", 5)

    text = signal["text"]
    generation_id = signal.get("generation_id") or classify_generation(text)
    region_id = signal.get("region_id") or classify_region(text)
    generation = generation_lookup.get(generation_id or "", {})
    sentiment = analyze_sentiment(text)
    topics = extract_topics(text, max_topics=max_topics)
    lens = behavioral_lens(
        text=text,
        generation_id=generation_id,
        topics=topics,
        sentiment=sentiment,
        generation_label=generation.get("label", "Geração"),
        generation_theme=generation.get("theme", "Educação"),
    )
    tgi_projection = _load_tgi_projection(generation_id or "z", region_id)

    return ProcessedSignal(
        raw_signal_id=signal["id"],
        sentiment=sentiment,
        topics=topics,
        emotional_trigger=lens["emotional_trigger"],
        cultural_shift=lens["cultural_shift"],
        narrative=lens["narrative"],
        actionable_recommendation=lens["actionable_recommendation"],
        generation_id=generation_id,
        region_id=region_id,
        tgi_projection=tgi_projection,
        processed_at=datetime.now(timezone.utc).isoformat(),
    )


def insight_from_processed(processed: ProcessedSignal, title: str, layer: str = "intelligence") -> GeneratedInsight:
    now = datetime.now(timezone.utc).isoformat()
    return GeneratedInsight(
        id=str(uuid4()),
        generation_id=processed.generation_id or "z",
        region_id=processed.region_id,
        layer=layer,
        title=title,
        narrative=processed.narrative,
        emotional_trigger=processed.emotional_trigger,
        confidence=0.74 if processed.sentiment != "neutral" else 0.62,
        tgi_projection=processed.tgi_projection,
        created_at=now,
    )


def run_pipeline(signals: list[dict[str, Any]], generations: list[dict[str, Any]]) -> dict[str, Any]:
    lookup = {g["id"]: g for g in generations}
    processed = [process_signal(signal, lookup) for signal in signals]
    insights: list[GeneratedInsight] = []
    for item in processed:
        insights.append(
            insight_from_processed(item, title=item.topics[0], layer="intelligence")
        )
        insights.append(
            GeneratedInsight(
                id=str(uuid4()),
                generation_id=item.generation_id or "z",
                region_id=item.region_id,
                layer="delivery",
                title="Recomendação acionável",
                narrative=item.actionable_recommendation,
                emotional_trigger=item.emotional_trigger,
                confidence=0.68,
                tgi_projection=item.tgi_projection,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
        )
    return {
        "processed_count": len(processed),
        "insight_count": len(insights),
        "processed_signals": [item.__dict__ for item in processed],
        "insights": [item.__dict__ for item in insights],
    }
