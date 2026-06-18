import { InsightCard, SectionHeader } from "@/components/ui";
import { getAnalyticsOverview, getGenerations, getInsights } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

const REGIONS = [
  { id: "norte", label: "Norte" },
  { id: "nordeste", label: "Nordeste" },
  { id: "centro_oeste", label: "Centro-Oeste" },
  { id: "sudeste", label: "Sudeste" },
  { id: "sul", label: "Sul" },
];

export default async function RegionsPage() {
  const [generations, insights, analytics] = await Promise.all([
    getGenerations(),
    getInsights(30),
    getAnalyticsOverview(),
  ]);

  return (
    <div>
      <SectionHeader
        eyebrow="5 Brasis"
        title="Lente regional"
        description="Distribuição de sinais e insights por região do Brasil."
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        {analytics.regional_distribution.map((region) => (
          <div key={region.region_id} className="card">
            <p className="eyebrow mb-2">{region.region}</p>
            <p className="font-display text-3xl" style={{ color: region.color }}>
              {region.signals}
            </p>
            <p className="text-xs text-muted mt-1">sinais</p>
          </div>
        ))}
      </div>

      {REGIONS.map((region) => {
        const regionInsights = insights.filter(
          (insight) => insight.region_id === region.id || insight.region_id === null,
        );
        return (
          <section key={region.id} className="mb-10">
            <h3 className="font-display text-2xl mb-4">{region.label}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {regionInsights.slice(0, 4).map((insight) => {
                const generation = generations.find((g) => g.id === insight.generation_id);
                return (
                  <InsightCard
                    key={`${region.id}-${insight.id}`}
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
