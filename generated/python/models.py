"""Generated from specs/data/schema.yaml. Do not edit."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field

class RawSignals(BaseModel):
    id: UUID | None = None
    source_id: str
    platform: str
    text: str
    url: str | None = None
    collected_at: datetime
    generation_id: str | None = None
    region_id: str | None = None
    content_hash: str
    metadata: dict[str, Any] | None = None

class ProcessedSignals(BaseModel):
    id: UUID | None = None
    raw_signal_id: UUID
    sentiment: str | None = None
    topics: dict[str, Any] | None = None
    emotional_trigger: str | None = None
    cultural_shift: bool | None = None
    processed_at: datetime

class Insights(BaseModel):
    id: UUID | None = None
    generation_id: str
    region_id: str | None = None
    layer: "capture" | "intelligence" | "delivery"
    title: str
    narrative: str
    emotional_trigger: str | None = None
    evidence_ids: list[UUID] | None = None
    confidence: float | None = None
    tgi_projection: str | None = None
    created_at: datetime

class TgiWeights(BaseModel):
    id: UUID | None = None
    generation_id: str
    region_id: str
    metric: str
    projected_value: str
    updated_at: datetime

class IngestionRuns(BaseModel):
    id: UUID | None = None
    source_id: str
    status: "pending" | "running" | "success" | "failed"
    record_count: int | None = None
    error_message: str | None = None
    started_at: datetime
    finished_at: datetime | None = None

