"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  Shield,
  Globe,
  TrendingUp,
  TrendingDown,
  ListFilter,
  AlertCircle,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { PlayerReportDTO } from "@/types/api";
import {
  formatCurrencyEUR,
  getInjuryRiskStyles,
  getMetricInfo,
  POSITION_METADATA,
} from "@/utils/formatters";

const TacticalRadarChart = dynamic(
  () => import("@/components/charts/TacticalRadarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[390px] sm:h-[430px] flex items-center justify-center animate-pulse">
        <div className="h-64 w-64 rounded-full border-4 border-slate-800 bg-slate-900/40" />
      </div>
    ),
  }
);

export default function PlayerDossierPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const playerId = Number(params?.id || 13);
  const [report, setReport] = useState<PlayerReportDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quickIdInput, setQuickIdInput] = useState<string>(String(playerId || 13));

  const fetchReport = useCallback(async (targetId: number) => {
    if (!targetId || Number.isNaN(targetId) || targetId <= 0) {
      setErrorMessage("ID de atleta inválido.");
      setIsLoading(false);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const data = await api.players.getReport(targetId);
      setReport(data);
      setQuickIdInput(String(data.id));
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : `Não foi possível carregar o dossiê do atleta #${targetId}.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchReport(playerId);
    }
  }, [authLoading, isAuthenticated, playerId, fetchReport]);

  const comparativeRows = useMemo(() => {
    if (!report?.radarMetrics) return [];

    return report.radarMetrics.map((m) => {
      const info = getMetricInfo(m.metricName);
      const pVal = Number(m.playerValue ?? 0);
      const cVal = Number(m.clusterAverageValue ?? 0);

      let rawDeltaPct = 0;
      if (cVal > 0) {
        rawDeltaPct = ((pVal - cVal) / cVal) * 100;
      }

      // For goalsConcededP90, lower than cluster average is a positive performance gain
      const isPositivePerformance = info.invertBetter
        ? pVal <= cVal
        : pVal >= cVal;

      return {
        metricName: m.metricName,
        label: info.label,
        subtitle: info.subtitle,
        unit: info.unit || "",
        decimals: info.decimals,
        playerValue: pVal,
        clusterValue: cVal,
        deltaPct: rawDeltaPct,
        isPositivePerformance,
      };
    });
  }, [report]);

  // Derived OVR Index & AI Scouting Insight
  const { ovrScore, scoutingInsight, highlightMetrics } = useMemo(() => {
    if (!report || comparativeRows.length === 0) {
      return {
        ovrScore: "85.0",
        scoutingInsight:
          "Perfil tático analisado via motor de clusterização K-Means.",
        highlightMetrics: {
          firstLabel: "ADERÊNCIA AO CLUSTER",
          firstVal: "86.0%",
          secondLabel: "EFICIÊNCIA P90",
          secondVal: "82.4%",
        },
      };
    }

    // Calculate relative performance index
    const ratios = comparativeRows.map((row) => {
      if (row.clusterValue <= 0) return 1.0;
      const info = getMetricInfo(row.metricName);
      return info.invertBetter
        ? row.clusterValue / Math.max(row.playerValue, 0.05)
        : row.playerValue / row.clusterValue;
    });

    const avgRatio = ratios.reduce((acc, r) => acc + r, 0) / ratios.length;
    const computedOvr = Math.min(98.5, Math.max(68.0, 78.0 + (avgRatio - 1) * 22));

    // Find best metric relative to cluster
    const sortedByAdvantage = [...comparativeRows].sort(
      (a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct)
    );
    const bestMetric =
      comparativeRows.find((r) => r.isPositivePerformance) || sortedByAdvantage[0];

    const deltaAbs = Math.abs(bestMetric?.deltaPct || 0).toFixed(1);
    const posMeta = POSITION_METADATA[report.position] || POSITION_METADATA.MF;

    const insight = `"${report.name} apresenta performance em ${
      bestMetric?.label || "métricas-chave"
    } ${deltaAbs}% ${
      bestMetric?.isPositivePerformance ? "superior" : "distinta em relação"
    } à média do seu cluster tático (${posMeta.label}), combinando risco médico ${report.injuryRisk.toLowerCase()} e avaliação de mercado em ${formatCurrencyEUR(
      report.marketValue
    )}."`;

    const positiveCount = comparativeRows.filter((r) => r.isPositivePerformance).length;
    const dominancePct = ((positiveCount / comparativeRows.length) * 100).toFixed(1);

    return {
      ovrScore: computedOvr.toFixed(1),
      scoutingInsight: insight,
      highlightMetrics: {
        firstLabel: "DOMÍNIO DE EIXOS",
        firstVal: `${dominancePct}%`,
        secondLabel: "ÍNDICE TÁTICO",
        secondVal: `${computedOvr.toFixed(1)}`,
      },
    };
  }, [report, comparativeRows]);

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(quickIdInput);
    if (!Number.isNaN(parsed) && parsed > 0) {
      router.push(`/players/${parsed}`);
    }
  };

  const posMeta = POSITION_METADATA[report?.position || "MF"] || POSITION_METADATA.MF;
  const riskStyle = getInjuryRiskStyles(report?.injuryRisk || "Baixo");

  return (
    <AppShell
      headerLeft={
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Link
            href="/simulation"
            className="h-8 w-8 rounded-lg bg-[#0D1622] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            title="Voltar para o Simulador"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <Link href="/simulation" className="hover:text-slate-200 transition-colors">
              Scouting Hub
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span className="hidden sm:inline">{posMeta.label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 hidden sm:inline shrink-0" />
            <span className="font-semibold text-emerald-400 truncate">
              {report ? `${report.name} (${report.currentClub})` : `Atleta #${playerId}`}
            </span>
          </div>
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2.5">
          {/* Quick Athlete ID Switcher */}
          <form onSubmit={handleQuickJump} className="hidden xl:flex items-center gap-1.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={1}
                value={quickIdInput}
                onChange={(e) => setQuickIdInput(e.target.value)}
                placeholder="ID Atleta"
                className="w-24 rounded-lg bg-[#0D1622] border border-slate-800 focus:border-emerald-500 focus:outline-none pl-8 pr-2 py-1.5 text-xs font-mono text-slate-200"
                title="Consultar outro ID de Atleta"
              />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 cursor-pointer"
            >
              Ir
            </button>
          </form>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#111C2B] hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileDown className="h-4 w-4 text-rose-400" />
            <span>Exportar Relatório PDF</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-rose-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/simulation"
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-white"
              >
                Selecionar Atleta no Simulador →
              </Link>
            </div>
          </div>
        )}

        {/* Hero Athlete Dossier Banner */}
        {isLoading && !report ? (
          <div className="h-48 rounded-2xl bg-[#0D1522] border border-slate-800/80 p-6 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-2xl bg-slate-800" />
              <div className="space-y-3">
                <div className="h-8 w-56 rounded bg-slate-800" />
                <div className="h-4 w-40 rounded bg-slate-800/70" />
                <div className="flex gap-3">
                  <div className="h-14 w-28 rounded-xl bg-slate-800/60" />
                  <div className="h-14 w-36 rounded-xl bg-slate-800/60" />
                  <div className="h-14 w-36 rounded-xl bg-slate-800/60" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          report && (
            <div className="rounded-2xl bg-[#0D1522] border border-slate-800/80 p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Pure CSS/SVG Avatar Placeholder (No external images) */}
                <PlayerAvatar
                  name={report.name}
                  position={report.position}
                  size="xl"
                  showShieldBadge
                />

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {report.name}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                        ELITE PROFILE
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-300">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                        <Shield className="h-3.5 w-3.5" />
                        {report.currentClub}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="inline-flex items-center gap-1.5 text-slate-300">
                        <Globe className="h-3.5 w-3.5 text-sky-400" />
                        Base Europeia
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="font-semibold text-white">{posMeta.roleTitle}</span>
                    </div>
                  </div>

                  {/* 4 Key Stat Pills */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-[#091019] border border-slate-800/90 px-4 py-2.5 min-w-[96px]">
                      <p className="text-[10px] font-mono uppercase text-slate-400">IDADE</p>
                      <p className="mt-0.5 text-base font-mono font-bold text-white">
                        {report.age}{" "}
                        <span className="text-xs font-normal text-slate-400">Anos</span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#091019] border border-slate-800/90 px-4 py-2.5 min-w-[145px]">
                      <p className="text-[10px] font-mono uppercase text-slate-400">
                        VALOR DE MERCADO
                      </p>
                      <p className="mt-0.5 text-base font-mono font-extrabold text-emerald-400">
                        {formatCurrencyEUR(report.marketValue)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#091019] border border-slate-800/90 px-4 py-2.5 min-w-[145px]">
                      <p className="text-[10px] font-mono uppercase text-slate-400">
                        SALÁRIO BASE
                      </p>
                      <p className="mt-0.5 text-base font-mono font-bold text-cyan-400">
                        {formatCurrencyEUR(report.salary)}
                        <span className="text-xs font-normal text-slate-400">/mês</span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#091019] border border-slate-800/90 px-4 py-2.5 min-w-[120px]">
                      <p className="text-[10px] font-mono uppercase text-slate-400">
                        RISCO MÉDICO
                      </p>
                      <p className="mt-0.5 text-sm font-mono font-bold text-white flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${riskStyle.dot}`} />
                        {report.injuryRisk.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Circular OVR Score Gauge */}
              <div className="flex flex-col items-center justify-center self-start lg:self-center shrink-0">
                <div className="h-24 w-24 rounded-full border-4 border-emerald-500/40 bg-[#091019] flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">
                    OVR SCORE
                  </span>
                  <span className="text-2xl font-mono font-extrabold text-emerald-400">
                    {ovrScore}
                  </span>
                </div>
                <span className="mt-2 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  PERCENTIL TOP 5%
                </span>
              </div>
            </div>
          )
        )}

        {/* Main 2-Column Content: Tactical Radar + Comparative Metrics */}
        {report && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Radar de Perfil Tático */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0D1522] border border-slate-800/80 p-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/70 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>Radar de Perfil Tático</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Performance relativa comparada ao Cluster:{" "}
                    <span className="text-cyan-400 font-semibold">
                      {posMeta.pluralLabel} · {report.position === "GK" ? "5 Eixos" : "6 Eixos"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1.5 text-slate-200">
                    <span className="h-3 w-3 rounded-sm bg-emerald-400 inline-block" />
                    ATLETA
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <span className="h-3 w-3 rounded-sm border border-dashed border-slate-400 inline-block" />
                    MÉDIA CLUSTER
                  </span>
                </div>
              </div>

              <div className="my-auto py-4">
                <TacticalRadarChart
                  metrics={report.radarMetrics}
                  position={report.position}
                  playerName={report.name}
                />
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>
                  Eixos plotados: {report.radarMetrics.length} (
                  {report.position === "GK" ? "Métricas de Goleiro" : "Métricas de Linha"})
                </span>
                <span>Escala normalizada p/90min</span>
              </div>
            </div>

            {/* Right Column: Comparative Metrics & AI Insight */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-[#0D1522] border border-slate-800/80 p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-white uppercase">
                  <ListFilter className="h-4 w-4 text-cyan-400" />
                  <span>MÉTRICAS COMPARATIVAS</span>
                </div>

                <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-slate-400 px-3 pt-1">
                  <span className="col-span-6">MÉTRICA (P/ 90MIN)</span>
                  <span className="col-span-2 text-right text-emerald-400">ATLETA</span>
                  <span className="col-span-2 text-right text-cyan-400">BENCHMARK</span>
                  <span className="col-span-2 text-right">Δ</span>
                </div>

                <div className="space-y-2.5">
                  {comparativeRows.map((row) => {
                    const deltaFormatted = `${Math.abs(row.deltaPct).toFixed(1)}%`;
                    return (
                      <div
                        key={row.metricName}
                        className="rounded-xl bg-[#091019] border border-slate-800/90 px-3.5 py-3 grid grid-cols-12 items-center gap-2"
                      >
                        <div className="col-span-6 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{row.label}</p>
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            {row.subtitle}
                          </p>
                        </div>

                        <div className="col-span-2 text-right font-mono text-sm font-bold text-white">
                          {row.playerValue.toFixed(row.decimals)}
                          {row.unit}
                        </div>

                        <div className="col-span-2 text-right font-mono text-xs text-slate-400">
                          {row.clusterValue.toFixed(row.decimals)}
                          {row.unit}
                        </div>

                        <div className="col-span-2 flex items-center justify-end">
                          <span
                            className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold ${
                              row.isPositivePerformance ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {row.deltaPct >= 0 ? (
                              <TrendingUp className="h-3 w-3 shrink-0" />
                            ) : (
                              <TrendingDown className="h-3 w-3 shrink-0" />
                            )}
                            {deltaFormatted}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* IA SCOUTING INSIGHT */}
                <div className="mt-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 p-4 space-y-2">
                  <p className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                    IA SCOUTING INSIGHT
                  </p>
                  <p className="text-xs italic text-slate-300 leading-relaxed">
                    {scoutingInsight}
                  </p>
                </div>
              </div>

              {/* Bottom 2 Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#0D1522] border border-slate-800/80 p-4">
                  <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    {highlightMetrics.firstLabel}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-extrabold text-white">
                      {highlightMetrics.firstVal}
                    </span>
                    <span className="text-xs font-mono text-emerald-400">↑ Acima</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0D1522] border border-slate-800/80 p-4">
                  <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    {highlightMetrics.secondLabel}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-extrabold text-white">
                      {highlightMetrics.secondVal}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">Top Tier</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
