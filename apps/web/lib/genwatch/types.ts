// Generated from specs/. Do not edit.

export type GenerationId = "alfa" | "z" | "millennial" | "x" | "boomer";
export type RegionId = "norte" | "nordeste" | "centro_oeste" | "sudeste" | "sul";
export type LayerId = "capture" | "intelligence" | "delivery";

export interface GenerationSummary {
  id: GenerationId;
  label: string;
  cohort: string;
  theme: string;
  color: string;
  education_context: string;
  strategic_questions: string[];
  delivery_outputs: string[];
}

export interface Insight {
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
}

export interface RawSignal {
  id: string;
  source_id: string;
  platform: string;
  text: string;
  url?: string | null;
  collected_at: string;
  generation_id?: GenerationId | null;
  region_id?: RegionId | null;
}

export interface GenerationDashboard {
  generation: GenerationSummary;
  signal_count: number;
  insight_count: number;
  top_insights: Insight[];
  recent_signals: RawSignal[];
}

export interface LayerDetail {
  layer: LayerId;
  generation_id: GenerationId;
  items: Array<Insight | RawSignal>;
}

export interface IngestionRun {
  id: string;
  source_id: string;
  status: "pending" | "running" | "success" | "failed";
  record_count: number;
  error_message?: string | null;
  started_at: string;
  finished_at?: string | null;
}

export interface DesignTokens {
  colors: Record<string, string | Record<string, string>>;
  fonts: { sans: string; display: string };
}
