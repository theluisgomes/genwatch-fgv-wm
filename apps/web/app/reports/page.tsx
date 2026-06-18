import { InsightCard, SectionHeader } from "@/components/ui";
import { apiPath } from "@/lib/config";
import { getGenerations, getInsights } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [generations, insights] = await Promise.all([
    getGenerations(),
    getInsights(50),
  ]);

  return (
    <div>
      <SectionHeader
        eyebrow="Relatórios"
        title="Insights acionáveis para a FGV"
        description="Exporte o relatório inaugural com narrativas interpretadas por geração."
      />

      <div className="card mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-xl mb-2">Relatório inaugural</h3>
          <p className="text-sm text-muted">
            PDF gerado a partir dos insights ativos no pipeline de inteligência.
          </p>
        </div>
        <a
          href={apiPath("/api/v1/reports/inaugural")}
          className="rounded border border-accent/40 px-4 py-2 text-sm text-accent hover:bg-accent/10"
        >
          Baixar PDF
        </a>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-2xl">Insights por geração</h3>
        <p className="text-xs text-muted">{insights.length} insights</p>
      </div>

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

      <div className="mt-8">
        <Link href="/" className="text-xs text-muted hover:text-accent">
          ← Voltar para visão geral
        </Link>
      </div>
    </div>
  );
}
