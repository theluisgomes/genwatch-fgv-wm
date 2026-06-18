export type MacroRegionId = "norte" | "nordeste" | "centro_oeste" | "sudeste" | "sul";

export interface MacroRegionMeta {
  id: MacroRegionId;
  label: string;
  color: string;
  emoji: string;
  states: Array<{ abbr: string; name: string }>;
}

export const MACRO_REGIONS: MacroRegionMeta[] = [
  {
    id: "norte",
    label: "Norte",
    color: "#6ee7b7",
    emoji: "🟢",
    states: [
      { abbr: "AC", name: "Acre" },
      { abbr: "AP", name: "Amapá" },
      { abbr: "AM", name: "Amazonas" },
      { abbr: "PA", name: "Pará" },
      { abbr: "RO", name: "Rondônia" },
      { abbr: "RR", name: "Roraima" },
      { abbr: "TO", name: "Tocantins" },
    ],
  },
  {
    id: "nordeste",
    label: "Nordeste",
    color: "#fcd34d",
    emoji: "🟠",
    states: [
      { abbr: "AL", name: "Alagoas" },
      { abbr: "BA", name: "Bahia" },
      { abbr: "CE", name: "Ceará" },
      { abbr: "MA", name: "Maranhão" },
      { abbr: "PB", name: "Paraíba" },
      { abbr: "PE", name: "Pernambuco" },
      { abbr: "PI", name: "Piauí" },
      { abbr: "RN", name: "Rio Grande do Norte" },
      { abbr: "SE", name: "Sergipe" },
    ],
  },
  {
    id: "centro_oeste",
    label: "Centro-Oeste",
    color: "#fdba74",
    emoji: "🟡",
    states: [
      { abbr: "GO", name: "Goiás" },
      { abbr: "MT", name: "Mato Grosso" },
      { abbr: "MS", name: "Mato Grosso do Sul" },
      { abbr: "DF", name: "Distrito Federal" },
    ],
  },
  {
    id: "sudeste",
    label: "Sudeste",
    color: "#3ecfaa",
    emoji: "🔵",
    states: [
      { abbr: "ES", name: "Espírito Santo" },
      { abbr: "MG", name: "Minas Gerais" },
      { abbr: "RJ", name: "Rio de Janeiro" },
      { abbr: "SP", name: "São Paulo" },
    ],
  },
  {
    id: "sul",
    label: "Sul",
    color: "#fca5a5",
    emoji: "🔴",
    states: [
      { abbr: "PR", name: "Paraná" },
      { abbr: "RS", name: "Rio Grande do Sul" },
      { abbr: "SC", name: "Santa Catarina" },
    ],
  },
];

export const MACRO_REGION_BY_ID = Object.fromEntries(
  MACRO_REGIONS.map((region) => [region.id, region]),
) as Record<MacroRegionId, MacroRegionMeta>;
