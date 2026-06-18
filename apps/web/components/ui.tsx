import type { GenerationSummary } from "@genwatch/types";
import Link from "next/link";

export function GenerationCard({ generation }: { generation: GenerationSummary }) {
  return (
    <Link
      href={`/generations/${generation.id}`}
      className="card block transition hover:border-accent/30"
      style={{ borderTopColor: generation.color, borderTopWidth: 2 }}
    >
      <p className="eyebrow mb-2">{generation.cohort}</p>
      <h3 className="font-display text-2xl mb-2">{generation.label}</h3>
      <p className="text-sm text-muted mb-4">{generation.theme}</p>
      <p className="text-xs text-muted line-clamp-2">
        {generation.strategic_questions[0]}
      </p>
    </Link>
  );
}

export function InsightCard({
  title,
  narrative,
  layer,
  trigger,
}: {
  title: string;
  narrative: string;
  layer?: string;
  trigger?: string | null;
}) {
  return (
    <article className="card">
      <div className="mb-3 flex gap-2">
        {layer ? <span className="pill">{layer}</span> : null}
        {trigger ? <span className="pill text-accent border-accent/30">{trigger}</span> : null}
      </div>
      <h4 className="font-display text-xl mb-2">{title}</h4>
      <p className="text-sm text-muted leading-relaxed">{narrative}</p>
    </article>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display text-4xl mb-3">{title}</h2>
      {description ? <p className="text-sm text-muted max-w-2xl">{description}</p> : null}
    </header>
  );
}
