"use client";

import React from "react";
import type { RegionalAnalytics } from "@/lib/api";
import brazilStates from "@/lib/brazil-states.json";
import { MACRO_REGION_BY_ID, MACRO_REGIONS } from "@/lib/brazil-regions";

function blendColor(base: string, intensity: number) {
  const alpha = 0.35 + (intensity / 100) * 0.55;
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
  const [hoveredState, setHoveredState] = React.useState<string | null>(null);
  const regionById = Object.fromEntries(regions.map((region) => [region.region_id, region]));

  const hovered = brazilStates.states.find((state) => state.id === hoveredState);

  return (
    <div className="relative">
      <svg
        viewBox={brazilStates.viewBox}
        className="h-full w-full"
        role="img"
        aria-label="Mapa do Brasil por estado e região"
      >
        <rect x="0" y="0" width="1000" height="912" fill="rgba(255,255,255,0.02)" rx="8" />
        {brazilStates.states.map((state) => {
          const regionMeta = MACRO_REGION_BY_ID[state.regionId as keyof typeof MACRO_REGION_BY_ID];
          const regionData = regionById[state.regionId];
          const isSelected = selectedId === state.regionId;
          const isHovered = hoveredState === state.id;
          const intensity = regionData?.intensity ?? 50;
          const fill = blendColor(regionMeta.color, intensity);

          return (
            <path
              key={state.id}
              d={state.path}
              fill={fill}
              stroke={
                isSelected || isHovered
                  ? regionMeta.color
                  : "rgba(255,255,255,0.25)"
              }
              strokeWidth={isSelected ? 1.8 : isHovered ? 1.4 : 0.6}
              className="cursor-pointer transition-all duration-150 hover:brightness-125"
              onClick={() => onSelect(state.regionId)}
              onMouseEnter={() => setHoveredState(state.id)}
              onMouseLeave={() => setHoveredState(null)}
              onFocus={() => setHoveredState(state.id)}
              onBlur={() => setHoveredState(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(state.regionId);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${state.name} (${state.abbr}) · ${regionMeta.label}`}
            />
          );
        })}
      </svg>

      {hovered ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded border border-white/10 bg-background/95 px-3 py-2 text-xs backdrop-blur">
          <p className="font-medium">{hovered.name}</p>
          <p className="text-muted">
            {hovered.abbr} · {MACRO_REGION_BY_ID[hovered.regionId as keyof typeof MACRO_REGION_BY_ID].label}
          </p>
        </div>
      ) : null}

      <div className="absolute bottom-3 left-3 rounded border border-white/10 bg-background/90 px-3 py-2 text-[10px] text-muted backdrop-blur">
        Mapa por estado · clique para selecionar a região
      </div>

      <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-2 max-w-[280px]">
        {MACRO_REGIONS.map((region) => {
          const data = regionById[region.id];
          const active = selectedId === region.id;
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelect(region.id)}
              className="rounded border px-2 py-1 text-[10px] transition hover:border-white/20"
              style={{
                borderColor: active ? region.color : "rgba(255,255,255,0.1)",
                color: active ? region.color : undefined,
              }}
            >
              {region.emoji} {region.label}
              {data ? ` · ${data.total_signals.toLocaleString("pt-BR")}` : ""}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] text-muted">
        Map data ©{" "}
        <a
          href="https://simplemaps.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-accent"
        >
          Simplemaps.com
        </a>
      </p>
    </div>
  );
}
