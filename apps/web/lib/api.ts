import type { GenerationId } from "@genwatch/types";
import { getApiBase } from "@/lib/config";

export class ApiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(
      "GenWatch API is not reachable. Start it in another terminal: make dev-api",
    );
    this.name = "ApiUnavailableError";
    this.cause = cause;
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${getApiBase()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, { next: { revalidate: 30 } });
  } catch (error) {
    throw new ApiUnavailableError(error);
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status} for ${path}`);
  }
  return response.json() as Promise<T>;
}

export interface AnalyticsOverview {
  generation_pulse: Array<{
    id: GenerationId;
    label: string;
    color: string;
    signals: number;
    insights: number;
    confidence: number;
    theme: string;
  }>;
  signal_trend: Array<{ week: string } & Record<GenerationId, number>>;
  emotional_triggers: Array<{
    trigger: string;
    label: string;
    count: number;
    color: string;
  }>;
  regional_distribution: Array<{
    region: string;
    region_id: string;
    insights: number;
    signals: number;
    color: string;
  }>;
  source_mix: Array<{
    source: string;
    label: string;
    type: string;
    value: number;
    color: string;
  }>;
  layer_pipeline: Array<{
    generation: string;
    color: string;
    capture: number;
    intelligence: number;
    delivery: number;
  }>;
  confidence_by_generation: Array<{
    generation: string;
    confidence: number;
    color: string;
  }>;
  generation_radar: Array<{
    generation: string;
    color: string;
    Sinais: number;
    Insights: number;
    Confiança: number;
    Urgência: number;
    Cobertura: number;
  }>;
  radar_dimensions: string[];
  totals: {
    signals: number;
    insights: number;
    generations: number;
    regions: number;
  };
}

export function getAnalyticsOverview() {
  return fetchJson<AnalyticsOverview>("/api/v1/analytics/overview");
}

export interface GenerationAnalytics {
  generation_id: GenerationId;
  label: string;
  color: string;
  theme: string;
  signal_trend: Array<{ week: string; signals: number }>;
  confidence_trend: Array<{ week: string; confidence: number }>;
  emotional_triggers: Array<{
    trigger: string;
    label: string;
    count: number;
    color: string;
  }>;
  regional_signals: Array<{
    region: string;
    region_id: string;
    signals: number;
    insights: number;
    color: string;
  }>;
  source_mix: Array<{
    source: string;
    label: string;
    type: string;
    value: number;
    color: string;
  }>;
  layer_funnel: Array<{ stage: string; value: number; color: string }>;
  intelligence_focus: Array<{ topic: string; intensity: number; color: string }>;
  delivery_outputs: Array<{ output: string; priority: number }>;
  benchmark: Array<{
    generation: string;
    signals: number;
    is_current: boolean;
    color: string;
  }>;
  totals: {
    signals: number;
    insights: number;
    confidence: number;
  };
}

export function getGenerationAnalytics(id: string) {
  return fetchJson<GenerationAnalytics>(`/api/v1/analytics/generations/${id}`);
}

export function getGenerations() {
  return fetchJson<import("@genwatch/types").GenerationSummary[]>("/api/v1/generations");
}

export function getInsights(limit = 12) {
  return fetchJson<import("@genwatch/types").Insight[]>(`/api/v1/insights?limit=${limit}`);
}

export function getGenerationSummary(id: string) {
  return fetchJson<import("@genwatch/types").GenerationDashboard>(
    `/api/v1/generations/${id}/summary`,
  );
}

export function getGenerationLayer(id: string, layer: string) {
  return fetchJson<import("@genwatch/types").LayerDetail>(
    `/api/v1/generations/${id}/layers/${layer}`,
  );
}
