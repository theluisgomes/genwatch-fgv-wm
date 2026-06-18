"use client";

import React from "react";
import type { RegionalAnalytics } from "@/lib/api";
import { BrazilMap } from "@/components/brazil-map";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartTooltipStyle = {
  contentStyle: {
    background: "#0e1520",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#eeeae0" },
  itemStyle: { color: "#3ecfaa" },
};

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card ${className}`}>
      <div className="mb-5">
        <p className="eyebrow mb-1">Visualização</p>
        <h3 className="font-display text-xl">{title}</h3>
        {subtitle ? <p className="text-xs text-muted mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function RegionDetailPanel({ region }: { region: RegionalAnalytics["regions"][number] }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-2">{region.region}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-display text-3xl" style={{ color: region.color }}>
              {region.total_signals.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted">sinais captados</p>
          </div>
          <div>
            <p className="font-display text-3xl text-accent">{region.total_insights}</p>
            <p className="text-xs text-muted">insights ativos</p>
          </div>
        </div>
      </div>

      <div className="rounded border border-white/5 p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-2">Geração dominante</p>
        <p className="font-display text-2xl" style={{ color: region.dominant_generation.color }}>
          {region.dominant_generation.label}
        </p>
        <p className="text-sm text-muted mt-1">
          {region.dominant_generation.share}% do volume regional de sinais
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-3">Mix geracional</p>
        <div className="space-y-2">
          {region.generations.map((generation) => (
            <div key={generation.generation_id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span style={{ color: generation.color }}>{generation.label}</span>
                <span className="text-muted">
                  {generation.share}% · {generation.signals.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${generation.share}%`,
                    backgroundColor: generation.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenerationByRegionChart({
  matrix,
  generationSeries,
}: {
  matrix: RegionalAnalytics["matrix"];
  generationSeries: RegionalAnalytics["generation_series"];
}) {
  return (
    <ChartCard
      title="Distribuição de gerações por região"
      subtitle="Volume de sinais captados em cada combinação região × geração"
      className="col-span-full"
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={matrix}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="region"
            tick={{ fill: "#6a7888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6a7888" }} />
          {generationSeries.map((generation) => (
            <Bar
              key={generation.id}
              dataKey={generation.id}
              name={generation.label}
              stackId="region"
              fill={generation.color}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function DominantGenerationChart({ regions }: { regions: RegionalAnalytics["regions"] }) {
  const data = regions.map((region) => ({
    region: region.region,
    share: region.dominant_generation.share,
    label: region.dominant_generation.label,
    color: region.dominant_generation.color,
  }));

  return (
    <ChartCard
      title="Participação da geração líder"
      subtitle="Percentual de sinais da geração dominante em cada região"
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="region"
            width={90}
            tick={{ fill: "#6a7888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            {...chartTooltipStyle}
            formatter={(value, _name, item) => [
              `${value ?? 0}% · ${(item?.payload as { label?: string })?.label ?? ""}`,
              "Participação",
            ]}
          />
          <Bar dataKey="share" name="Participação %" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.region} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function RegionalIntensityChart({ regions }: { regions: RegionalAnalytics["regions"] }) {
  return (
    <ChartCard title="Intensidade regional" subtitle="Comparativo de sinais e insights por região">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={regions}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="region"
            tick={{ fill: "#6a7888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6a7888" }} />
          <Bar dataKey="total_signals" name="Sinais" radius={[4, 4, 0, 0]}>
            {regions.map((region) => (
              <Cell key={region.region_id} fill={region.color} />
            ))}
          </Bar>
          <Bar dataKey="total_insights" name="Insights" fill="#818cf8" opacity={0.7} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RegionVisualizations({ analytics }: { analytics: RegionalAnalytics }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(analytics.regions[0]?.region_id ?? null);
  const selectedRegion =
    analytics.regions.find((region) => region.region_id === selectedId) ?? analytics.regions[0];

  return (
    <section className="mb-14">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Data visualization</p>
          <h3 className="font-display text-2xl">Mapa e distribuição regional</h3>
        </div>
        <div className="flex gap-6 md:text-right">
          <div>
            <p className="font-display text-3xl text-accent">
              {analytics.totals.signals.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted">sinais por região</p>
          </div>
          <div>
            <p className="font-display text-3xl text-accent">{analytics.totals.insights}</p>
            <p className="text-xs text-muted">insights regionais</p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <ChartCard
          title="Mapa do Brasil"
          subtitle="Clique em uma região para ver o detalhamento geracional"
          className="xl:col-span-3"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="min-h-[320px]">
              <BrazilMap
                regions={analytics.regions}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
            {selectedRegion ? <RegionDetailPanel region={selectedRegion} /> : null}
          </div>
        </ChartCard>

        <div className="xl:col-span-2">
          <DominantGenerationChart regions={analytics.regions} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GenerationByRegionChart
          matrix={analytics.matrix}
          generationSeries={analytics.generation_series}
        />
        <RegionalIntensityChart regions={analytics.regions} />
      </div>
    </section>
  );
}
