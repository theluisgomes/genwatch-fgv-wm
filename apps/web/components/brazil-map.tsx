"use client";

import type { RegionalAnalytics } from "@/lib/api";

const MAP_REGIONS = [
  {
    id: "norte",
    label: "Norte",
    path: "M118 42 L168 28 L218 48 L248 78 L238 118 L208 148 L168 158 L128 138 L98 98 Z",
    labelX: 168,
    labelY: 98,
  },
  {
    id: "nordeste",
    label: "Nordeste",
    path: "M248 78 L318 68 L358 98 L372 148 L358 198 L318 228 L278 218 L248 188 L238 148 Z",
    labelX: 308,
    labelY: 158,
  },
  {
    id: "centro_oeste",
    label: "Centro-Oeste",
    path: "M98 98 L128 138 L168 158 L178 208 L158 258 L118 278 L78 248 L68 188 L78 138 Z",
    labelX: 128,
    labelY: 218,
  },
  {
    id: "sudeste",
    label: "Sudeste",
    path: "M208 148 L238 148 L248 188 L278 218 L268 268 L228 298 L188 278 L178 228 L188 178 Z",
    labelX: 228,
    labelY: 238,
  },
  {
    id: "sul",
    label: "Sul",
    path: "M188 278 L228 298 L238 348 L218 398 L178 418 L148 388 L158 338 L168 298 Z",
    labelX: 198,
    labelY: 358,
  },
] as const;

function blendColor(base: string, intensity: number) {
  const alpha = 0.25 + (intensity / 100) * 0.65;
  return `${base}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

export function BrazilMap({
  regions,
  selectedId,
  onSelect,
}: {
  regions: RegionalAnalytics["regions"];
  selectedId: string | null;
  onSelect: (regionId: string) => void;
}) {
  const regionById = Object.fromEntries(regions.map((region) => [region.region_id, region]));

  return (
    <div className="relative">
      <svg viewBox="0 0 420 460" className="h-full w-full" role="img" aria-label="Mapa do Brasil por região">
        <rect x="0" y="0" width="420" height="460" fill="rgba(255,255,255,0.02)" rx="8" />
        {MAP_REGIONS.map((shape) => {
          const region = regionById[shape.id];
          const isSelected = selectedId === shape.id;
          const fill = region ? blendColor(region.color, region.intensity) : "rgba(255,255,255,0.05)";

          return (
            <g key={shape.id}>
              <path
                d={shape.path}
                fill={fill}
                stroke={isSelected ? region?.color ?? "#3ecfaa" : "rgba(255,255,255,0.18)"}
                strokeWidth={isSelected ? 2.5 : 1.2}
                className="cursor-pointer transition-all duration-200 hover:brightness-125"
                onClick={() => onSelect(shape.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(shape.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${shape.label}: ${region?.total_signals.toLocaleString("pt-BR") ?? 0} sinais`}
              />
              <text
                x={shape.labelX}
                y={shape.labelY}
                textAnchor="middle"
                className="pointer-events-none fill-foreground text-[11px] font-medium"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {shape.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 left-3 rounded border border-white/10 bg-background/90 px-3 py-2 text-[10px] text-muted backdrop-blur">
        Intensidade = volume de sinais por região
      </div>
    </div>
  );
}
