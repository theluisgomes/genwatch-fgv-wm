import { DashboardVisualizations } from "@/components/charts";
import { GenerationCard, InsightCard, SectionHeader } from "@/components/ui";
import { getAnalyticsOverview, getGenerations, getInsights } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [generations, insights, analytics] = await Promise.all([
    getGenerations(),
    getInsights(6),
    getAnalyticsOverview(),
  ]);

  return (
    <div>
      <SectionHeader
        eyebrow="MVP · Inteligência Geracional"
        title="O que cada geração pensa sobre aprender no Brasil de hoje"
        description="Sistema de inteligência que captura sinais digitais públicos, processa com lente comportamental e entrega direção estratégica para comunicação, produto e posicionamento institucional da FGV."
      />

      <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-white/5">
        {[
          ["4+", "Gerações monitoradas simultaneamente"],
          ["84%", "dos compartilhamentos em Dark Social (stub no MVP)"],
          ["50k+", "entrevistas TGI Kantar para validação (stub no MVP)"],
        ].map(([value, label]) => (
          <div key={label} className="px-0 py-8 md:px-8 border-r border-white/5 last:border-r-0">
            <p className="font-display text-5xl text-accent mb-2">{value}</p>
            <p className="text-xs text-muted max-w-xs">{label}</p>
          </div>
        ))}
      </section>

      <section className="mb-14">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-2xl">Gerações</h3>
          <p className="text-xs text-muted">5 gerações · 5 Brasis · 3 camadas</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {generations.map((generation) => (
            <GenerationCard key={generation.id} generation={generation} />
          ))}
        </div>
      </section>

      <DashboardVisualizations analytics={analytics} />

      <section>
        <h3 className="font-display text-2xl mb-6">Insights recentes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              narrative={insight.narrative}
              layer={insight.layer}
              trigger={insight.emotional_trigger}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
