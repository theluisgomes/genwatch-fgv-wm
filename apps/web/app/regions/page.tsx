import { RegionVisualizations } from "@/components/region-charts";
import { InsightCard, SectionHeader } from "@/components/ui";
import { getGenerations, getInsights, getRegionalAnalytics } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RegionsPage() {
  const [generations, insights, analytics] = await Promise.all([
    getGenerations(),
    getInsights(30),
    getRegionalAnalytics(),
  ]);

  return (
    <div>
      <SectionHeader
        eyebrow="5 Brasis"
        title="Lente regional"
        description="Mapa do Brasil, distribuição geracional por região e insights contextualizados."
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        {analytics.regions.map((region) => (
          <div key={region.region_id} className="card">
            <p className="eyebrow mb-2">{region.region}</p>
            <p className="font-display text-3xl" style={{ color: region.color }}>
              {region.total_signals.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted mt-1">sinais</p>
            <p className="text-[10px] text-muted mt-3">
              Líder:{" "}
              <span style={{ color: region.dominant_generation.color }}>
                {region.dominant_generation.label}
              </span>
            </p>
          </div>
        ))}
      </div>

      <RegionVisualizations analytics={analytics} />

      {analytics.regions.map((region) => {
        const regionInsights = insights.filter(
          (insight) => insight.region_id === region.region_id || insight.region_id === null,
        );
        return (
          <section key={region.region_id} className="mb-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h3 className="font-display text-2xl">{region.region}</h3>
              <p className="text-xs text-muted">
                {region.dominant_generation.label} · {region.dominant_generation.share}% dos sinais
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {regionInsights.slice(0, 4).map((insight) => {
                const generation = generations.find((g) => g.id === insight.generation_id);
                return (
                  <InsightCard
                    key={`${region.region_id}-${insight.id}`}
                    title={`${generation?.label ?? insight.generation_id}: ${insight.title}`}
                    narrative={insight.narrative}
                    layer={insight.layer}
                    trigger={insight.emotional_trigger}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      <Link href="/" className="text-xs text-muted hover:text-accent">
        ← Voltar
      </Link>
    </div>
  );
}
