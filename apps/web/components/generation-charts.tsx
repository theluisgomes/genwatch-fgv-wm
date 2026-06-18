"use client";

import React from "react";
import type { GenerationAnalytics } from "@/lib/api";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
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

export function GenerationVisualizations({
  analytics,
}: {
  analytics: GenerationAnalytics;
}) {
  const color = analytics.color;

  return (
    <section className="mb-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Data visualization · {analytics.label}</p>
          <h3 className="font-display text-2xl">Análise geracional detalhada</h3>
        </div>
        <div className="flex gap-6 md:text-right">
          <div>
            <p className="font-display text-3xl" style={{ color }}>
              {analytics.totals.signals.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted">sinais</p>
          </div>
          <div>
            <p className="font-display text-3xl" style={{ color }}>
              {Math.round(analytics.totals.confidence * 100)}%
            </p>
            <p className="text-xs text-muted">confiança média</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="Tendência de sinais"
          subtitle="Volume semanal de captação nesta geração"
          className="col-span-full"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={analytics.signal_trend}>
              <defs>
                <linearGradient id="gen-signal-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Area
                type="monotone"
                dataKey="signals"
                name="Sinais"
                stroke={color}
                fill="url(#gen-signal-grad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gatilhos emocionais" subtitle="Estados emocionais dominantes">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={analytics.emotional_triggers}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={3}
              >
                {analytics.emotional_triggers.map((entry) => (
                  <Cell key={entry.trigger} fill={entry.color} stroke="rgba(14,21,32,0.8)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#6a7888" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição regional" subtitle="Sinais por região do Brasil">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.regional_signals} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="region"
                width={88}
                tick={{ fill: "#6a7888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="signals" name="Sinais" radius={[0, 4, 4, 0]}>
                {analytics.regional_signals.map((entry) => (
                  <Cell key={entry.region_id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mix de fontes" subtitle="Fontes de captação desta geração">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.source_mix}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6a7888", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="value" name="Peso" radius={[4, 4, 0, 0]}>
                {analytics.source_mix.map((entry) => (
                  <Cell key={entry.source} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Evolução de confiança" subtitle="Confiança dos insights ao longo do ciclo">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.confidence_trend}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Line
                type="monotone"
                dataKey="confidence"
                name="Confiança %"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Focos de inteligência" subtitle="Intensidade temática da lente comportamental">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.intelligence_focus} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="topic"
                width={120}
                tick={{ fill: "#6a7888", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="intensity" name="Intensidade" radius={[0, 4, 4, 0]}>
                {analytics.intelligence_focus.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pipeline · Captação → Entregas"
          subtitle="Fluxo das três camadas para esta geração"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.layer_funnel}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="value" name="Volume" radius={[4, 4, 0, 0]}>
                {analytics.layer_funnel.map((entry) => (
                  <Cell key={entry.stage} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Benchmark geracional"
          subtitle="Comparativo de volume de sinais com outras gerações"
          className="col-span-full"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.benchmark}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="generation" tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6a7888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="signals" name="Sinais" radius={[4, 4, 0, 0]}>
                {analytics.benchmark.map((entry) => (
                  <Cell key={entry.generation} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
