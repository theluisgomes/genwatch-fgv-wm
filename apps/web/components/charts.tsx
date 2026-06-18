"use client";

import React from "react";
import type { AnalyticsOverview } from "@/lib/api";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GENERATION_SERIES = [
  { id: "alfa", label: "Gen Alfa", color: "#c4b5fd" },
  { id: "z", label: "Gen Z", color: "#3ecfaa" },
  { id: "millennial", label: "Millennials", color: "#fcd34d" },
  { id: "x", label: "Gen X", color: "#f9a8d4" },
  { id: "boomer", label: "Boomers", color: "#fca5a5" },
] as const;

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

export function SignalTrendChart({ data }: { data: AnalyticsOverview["signal_trend"] }) {
  return (
    <ChartCard
      title="Volume de sinais · 8 semanas"
      subtitle="Evolução da captação por geração ao longo do ciclo MVP"
      className="col-span-full"
    >
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {GENERATION_SERIES.map(({ id, color }) => (
              <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6a7888" }} />
          {GENERATION_SERIES.map(({ id, label, color }) => (
            <Area
              key={id}
              type="monotone"
              dataKey={id}
              name={label}
              stroke={color}
              fill={`url(#grad-${id})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GenerationRadarChart({
  data,
  dimensions,
}: {
  data: AnalyticsOverview["generation_radar"];
  dimensions: string[];
}) {
  const radarData = dimensions.map((dimension) => {
    const row: Record<string, string | number> = { dimension };
    for (const item of data) {
      row[item.generation] = item[dimension as keyof typeof item] as number;
    }
    return row;
  });

  return (
    <ChartCard
      title="Lente comportamental · Radar geracional"
      subtitle="Comparativo multidimensional — todas as gerações sobrepostas"
    >
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: "#6a7888", fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#4a5a6a", fontSize: 9 }} />
          <Tooltip {...chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6a7888" }} />
          {data.map((item) => (
            <Radar
              key={item.generation}
              name={item.generation}
              dataKey={item.generation}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.12}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function EmotionalTriggersChart({ data }: { data: AnalyticsOverview["emotional_triggers"] }) {
  return (
    <ChartCard
      title="Gatilhos emocionais"
      subtitle="Distribuição dos estados que ativam decisões de educação"
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.trigger} fill={entry.color} stroke="rgba(14,21,32,0.8)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip {...chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6a7888" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RegionalDistributionChart({
  data,
}: {
  data: AnalyticsOverview["regional_distribution"];
}) {
  return (
    <ChartCard title="5 Brasis · Distribuição regional" subtitle="Sinais captados por região">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="region"
            width={90}
            tick={{ fill: "#6a7888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip {...chartTooltipStyle} />
          <Bar dataKey="signals" name="Sinais" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.region_id} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SourceMixChart({ data }: { data: AnalyticsOverview["source_mix"] }) {
  return (
    <ChartCard title="Mix de fontes" subtitle="Participação relativa na captação de sinais">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6a7888", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltipStyle} />
          <Bar dataKey="value" name="Peso relativo" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.source} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const PIPELINE_LAYERS = [
  { key: "capture" as const, name: "Captação", color: "#818cf8", unit: "sinais" },
  { key: "intelligence" as const, name: "Inteligência", color: "#3ecfaa", unit: "insights" },
  { key: "delivery" as const, name: "Entregas", color: "#fcd34d", unit: "insights" },
];

export function PipelineChart({ data }: { data: AnalyticsOverview["layer_pipeline"] }) {
  return (
    <ChartCard
      title="Pipeline · Captação → Inteligência → Entregas"
      subtitle="Cada camada com escala própria — volumes de captação e produção de insights"
      className="col-span-full"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PIPELINE_LAYERS.map((layer) => {
          const maxValue = Math.max(...data.map((row) => row[layer.key]), 1);
          const yMax = Math.ceil(maxValue * 1.15);

          return (
            <div key={layer.key}>
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium" style={{ color: layer.color }}>
                  {layer.name}
                </p>
                <p className="text-[10px] text-muted uppercase tracking-wider">{layer.unit}</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="generation"
                    tick={{ fill: "#6a7888", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    domain={[0, yMax]}
                    tick={{ fill: "#6a7888", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(value) => [
                      Number(value ?? 0).toLocaleString("pt-BR"),
                      layer.name,
                    ]}
                  />
                  <Bar dataKey={layer.key} name={layer.name} fill={layer.color} radius={[4, 4, 0, 0]}>
                    {data.map((entry) => (
                      <Cell key={entry.generation} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

export function GenerationPulseChart({ data }: { data: AnalyticsOverview["generation_pulse"] }) {
  const pulseData = data.map((item) => ({
    ...item,
    confidencePct: Math.round(item.confidence * 100),
  }));

  return (
    <ChartCard
      title="Pulso geracional"
      subtitle="Volume de sinais e confiança média dos insights"
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={pulseData}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#6a7888", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: "#6a7888", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip {...chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#6a7888" }} />
          <Bar yAxisId="left" dataKey="signals" name="Sinais" radius={[4, 4, 0, 0]}>
            {pulseData.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Bar>
          <Bar
            yAxisId="right"
            dataKey="confidencePct"
            name="Confiança %"
            fill="#3ecfaa"
            opacity={0.45}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DashboardVisualizations({ analytics }: { analytics: AnalyticsOverview }) {
  return (
    <section className="mb-14">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Data visualization</p>
          <h3 className="font-display text-2xl">Inteligência em tempo real</h3>
        </div>
        <div className="flex gap-6 md:text-right">
          <div>
            <p className="font-display text-3xl text-accent">
              {analytics.totals.signals.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted">sinais processados</p>
          </div>
          <div>
            <p className="font-display text-3xl text-accent">{analytics.totals.insights}</p>
            <p className="text-xs text-muted">insights ativos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SignalTrendChart data={analytics.signal_trend} />
        <GenerationRadarChart
          data={analytics.generation_radar}
          dimensions={analytics.radar_dimensions}
        />
        <EmotionalTriggersChart data={analytics.emotional_triggers} />
        <RegionalDistributionChart data={analytics.regional_distribution} />
        <SourceMixChart data={analytics.source_mix} />
        <GenerationPulseChart data={analytics.generation_pulse} />
        <PipelineChart data={analytics.layer_pipeline} />
      </div>
    </section>
  );
}
