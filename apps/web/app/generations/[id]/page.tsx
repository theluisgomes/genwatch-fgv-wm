import { GenerationVisualizations } from "@/components/generation-charts";
import { InsightCard, SectionHeader } from "@/components/ui";
import { getGenerationAnalytics, getGenerationLayer, getGenerationSummary } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const LAYERS = [
  { id: "capture", label: "Camada 01 · Captação de Sinais" },
  { id: "intelligence", label: "Camada 02 · Inteligência" },
  { id: "delivery", label: "Camada 03 · Entregas" },
] as const;

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let summary;
  let analytics;
  try {
    [summary, analytics] = await Promise.all([
      getGenerationSummary(id),
      getGenerationAnalytics(id),
    ]);
  } catch {
    notFound();
  }

  const layers = await Promise.all(
    LAYERS.map(async (layer) => ({
      ...layer,
      data: await getGenerationLayer(id, layer.id),
    })),
  );

  const { generation } = summary;

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-xs text-muted hover:text-accent">
          ← Voltar
        </Link>
      </div>

      <SectionHeader
        eyebrow={generation.cohort}
        title={generation.label}
        description={`${generation.theme} · ${generation.education_context}`}
      />

      <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="eyebrow mb-2">Sinais</p>
          <p className="font-display text-4xl text-accent">{summary.signal_count}</p>
        </div>
        <div className="card">
          <p className="eyebrow mb-2">Insights</p>
          <p className="font-display text-4xl text-accent">{summary.insight_count}</p>
        </div>
        <div className="card">
          <p className="eyebrow mb-2">Perguntas estratégicas</p>
          <ul className="text-sm text-muted space-y-2">
            {generation.strategic_questions.map((question) => (
              <li key={question}>• {question}</li>
            ))}
          </ul>
        </div>
      </div>

      <GenerationVisualizations analytics={analytics} />

      {layers.map((layer) => (
        <section key={layer.id} className="mb-10">
          <h3 className="font-display text-2xl mb-4">{layer.label}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {layer.data.items.length === 0 ? (
              <div className="card text-sm text-muted">
                Nenhum item nesta camada ainda. Conectores em ativação.
              </div>
            ) : (
              layer.data.items.map((item) => {
                if ("narrative" in item) {
                  return (
                    <InsightCard
                      key={item.id}
                      title={item.title}
                      narrative={item.narrative}
                      layer={item.layer}
                      trigger={item.emotional_trigger}
                    />
                  );
                }
                return (
                  <article key={item.id} className="card">
                    <div className="mb-2 flex gap-2">
                      <span className="pill">{item.source_id}</span>
                      <span className="pill">{item.platform}</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{item.text}</p>
                  </article>
                );
              })
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
