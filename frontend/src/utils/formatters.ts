import { ClusterId, InjuryRisk, Position } from "@/types/api";

const euroFormatterInteger = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const euroFormatterDecimal = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatterPtBr = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

export function formatCurrencyEUR(value: number | undefined | null, showDecimals = false): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "€ 0";
  }
  return showDecimals ? euroFormatterDecimal.format(value) : euroFormatterInteger.format(value);
}

export function formatNumberPtBr(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }
  return numberFormatterPtBr.format(value);
}

export function getInitials(name: string): string {
  if (!name) return "FD";
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const POSITION_METADATA: Record<
  Position,
  {
    code: Position;
    label: string;
    pluralLabel: string;
    roleTitle: string;
    shortDescription: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    barColor: string;
    hex: string;
  }
> = {
  GK: {
    code: "GK",
    label: "Goleiro",
    pluralLabel: "Goleiros",
    roleTitle: "GK (Goleiro)",
    shortDescription: "Segurança sob as traves · reposição e controle de área",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/30",
    barColor: "bg-cyan-400",
    hex: "#22d3ee",
  },
  DF: {
    code: "DF",
    label: "Defensor",
    pluralLabel: "Defensores",
    roleTitle: "DF (Defensor)",
    shortDescription: "Solidez defensiva · saída limpa e duelos territoriais",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-400",
    badgeBorder: "border-sky-500/30",
    barColor: "bg-sky-400",
    hex: "#38bdf8",
  },
  MF: {
    code: "MF",
    label: "Meio-campo",
    pluralLabel: "Meio-campistas",
    roleTitle: "MF (Meio-Campista)",
    shortDescription: "Médio de transição e controle · perfil prioritário",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/30",
    barColor: "bg-amber-400",
    hex: "#fbbf24",
  },
  FW: {
    code: "FW",
    label: "Atacante",
    pluralLabel: "Atacantes",
    roleTitle: "FW (Atacante)",
    shortDescription: "Profundidade ofensiva · pressão e conversão em gols",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    barColor: "bg-emerald-400",
    hex: "#10b981",
  },
};

export interface ClusterOption {
  id: ClusterId;
  shortTitle: string;
  fullLabel: string;
  description: string;
}

export const OUTFIELD_CLUSTERS: ClusterOption[] = [
  {
    id: 1,
    shortTitle: "CLUSTER 1",
    fullLabel: "Cluster 1 — Construtor / Marcador (Alto Desarme e Passe Progressivo)",
    description: "Foco em recuperação de posse, contenção defensiva e progressão vertical segura.",
  },
  {
    id: 2,
    shortTitle: "CLUSTER 2",
    fullLabel: "Cluster 2 — Suporte Tático / Equilibrado",
    description: "Equilíbrio entre fases do jogo, ocupação de espaços e circulação consistente.",
  },
  {
    id: 3,
    shortTitle: "CLUSTER 3",
    fullLabel: "Cluster 3 — Criador / Ofensivo de Elite (Playmaker / Alta Criação)",
    description: "Alto volume de criação de chutes (SCA), passes-chave, conduções e ameaça direta (xG/xA).",
  },
];

export const GK_CLUSTERS: ClusterOption[] = [
  {
    id: 4,
    shortTitle: "CLUSTER 4",
    fullLabel: "Cluster 4 — Goleiro de Alto Volume de Jogo",
    description: "Exigido constantemente com alto volume de finalizações no alvo e intervenção ativa.",
  },
  {
    id: 5,
    shortTitle: "CLUSTER 5",
    fullLabel: "Cluster 5 — Goleiro Titular Seguro (Alta % de Defesas e Clean Sheets)",
    description: "Consistência de elite em jogos sem sofrer gols e baixa média de gols sofridos.",
  },
  {
    id: 6,
    shortTitle: "CLUSTER 6",
    fullLabel: "Cluster 6 — Especialista em Pênaltis e Alta Eficiência",
    description: "Taxa superior de defesa de penalidades máximas e intervenções decisivas.",
  },
];

export function getClustersForPosition(position: Position): ClusterOption[] {
  return position === "GK" ? GK_CLUSTERS : OUTFIELD_CLUSTERS;
}

export function getDefaultClusterForPosition(position: Position): ClusterId {
  return position === "GK" ? 4 : 1;
}

export interface MetricTranslation {
  label: string;
  radarLabel: string;
  subtitle: string;
  unit?: string;
  invertBetter?: boolean;
  decimals: number;
}

export const METRIC_TRANSLATIONS: Record<string, MetricTranslation> = {
  progressivePassesP90: {
    label: "Passes Progressivos",
    radarLabel: "Passes Prog. p90",
    subtitle: "Exploração Vertical",
    decimals: 2,
  },
  tacklesP90: {
    label: "Desarmes",
    radarLabel: "Desarmes p90",
    subtitle: "Interpelação Defensiva",
    decimals: 2,
  },
  scaP90: {
    label: "Criação de Chute (SCA)",
    radarLabel: "SCA p90",
    subtitle: "Volume Ofensivo",
    decimals: 2,
  },
  progressiveCarriesP90: {
    label: "Conduções Progressivas",
    radarLabel: "Conduções p90",
    subtitle: "Ball Carrying",
    decimals: 2,
  },
  expectedGoalsP90: {
    label: "Gols Esperados (xG)",
    radarLabel: "xG p90",
    subtitle: "Ameaça Direta",
    decimals: 2,
  },
  expectedAssistsP90: {
    label: "Assistências Esperadas (xA)",
    radarLabel: "xA p90",
    subtitle: "Criação Final",
    decimals: 2,
  },
  goalsConcededP90: {
    label: "Gols Sofridos (p90)",
    radarLabel: "Gols Sofridos p90",
    subtitle: "Solidez de Meta (Menor = Melhor)",
    invertBetter: true,
    decimals: 2,
  },
  savePercentage: {
    label: "Taxa de Defesas (%)",
    radarLabel: "% Defesas",
    subtitle: "Eficiência de Intervenção",
    unit: "%",
    decimals: 1,
  },
  cleanSheetPercentage: {
    label: "Clean Sheets (%)",
    radarLabel: "% Clean Sheets",
    subtitle: "Jogos sem Sofrer Gols",
    unit: "%",
    decimals: 1,
  },
  shotsOnTargetAgainstP90: {
    label: "Chutes no Alvo Contra",
    radarLabel: "Chutes Contra p90",
    subtitle: "Volume de Exigência p90",
    decimals: 2,
  },
  penaltiesSavedP90: {
    label: "Pênaltis Defendidos",
    radarLabel: "Pênaltis Def. p90",
    subtitle: "Eficiência em Penalidades",
    decimals: 2,
  },
};

export function getMetricInfo(metricName: string): MetricTranslation {
  return (
    METRIC_TRANSLATIONS[metricName] ?? {
      label: metricName,
      radarLabel: metricName,
      subtitle: "Indicador Técnico p90",
      decimals: 2,
    }
  );
}

export function getInjuryRiskStyles(risk: InjuryRisk) {
  switch (risk) {
    case "Baixo":
      return {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        dot: "bg-emerald-400",
      };
    case "Moderado":
      return {
        bg: "bg-amber-500/15",
        text: "text-amber-400",
        border: "border-amber-500/30",
        dot: "bg-amber-400",
      };
    case "Alto":
      return {
        bg: "bg-rose-500/15",
        text: "text-rose-400",
        border: "border-rose-500/30",
        dot: "bg-rose-400",
      };
  }
}
