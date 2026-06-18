-- Generated from specs/data/schema.yaml

CREATE TABLE IF NOT EXISTS raw_signals (
  id UUID PRIMARY KEY,
  source_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  text TEXT NOT NULL,
  url TEXT,
  collected_at TIMESTAMPTZ NOT NULL,
  generation_id TEXT,
  region_id TEXT,
  content_hash TEXT NOT NULL,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS processed_signals (
  id UUID PRIMARY KEY,
  raw_signal_id UUID NOT NULL,
  sentiment TEXT,
  topics JSONB,
  emotional_trigger TEXT,
  cultural_shift BOOLEAN,
  processed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY,
  generation_id TEXT NOT NULL,
  region_id TEXT,
  layer TEXT NOT NULL,
  title TEXT NOT NULL,
  narrative TEXT NOT NULL,
  emotional_trigger TEXT,
  evidence_ids UUID[],
  confidence DOUBLE PRECISION,
  tgi_projection TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS tgi_weights (
  id UUID PRIMARY KEY,
  generation_id TEXT NOT NULL,
  region_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  projected_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id UUID PRIMARY KEY,
  source_id TEXT NOT NULL,
  status TEXT NOT NULL,
  record_count INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ
);

