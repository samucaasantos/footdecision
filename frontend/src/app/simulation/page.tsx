"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Filter,
  SlidersHorizontal,
  Cpu,
  Shield,
  HeartPulse,
  ArrowRight,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { NumericInput } from "@/components/NumericInput";
import { MarketPlayersTable } from "@/components/MarketPlayersTable";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  DASHBOARD_STATE_STORAGE_KEY,
  LAST_DOSSIER_ID_STORAGE_KEY,
  SIMULATION_STATE_STORAGE_KEY,
} from "@/services/api";
import {
  ClusterId,
  PlayerRecommendationDTO,
  Position,
  SimulationResponseDTO,
} from "@/types/api";
import {
  formatCurrencyEUR,
  getClustersForPosition,
  getDefaultClusterForPosition,
  getInjuryRiskStyles,
} from "@/utils/formatters";
import { MAX_MONETARY_LIMIT } from "@/utils/marketPlayersCatalog";

const POSITIONS: Position[] = ["GK", "DF", "MF", "FW"];

const RISK_TOLERANCE_OPTIONS: Array<{ value: 1.0 | 2.0 | 3.0; label: string; badge: string }> = [
  { value: 1.0, label: "1.0 · Apenas Baixo Risco", badge: "Risco Baixo" },
  { value: 2.0, label: "2.0 · Até Risco Moderado", badge: "Até Moderado" },
  { value: 3.0, label: "3.0 · Todos (Inclui Alto)", badge: "Até Alto" },
];

interface PersistedSimulationState {
  targetPosition: Position;
  targetClusterId: ClusterId;
  maxTransferBudget: string;
  maxMonthlySalary: string;
  maxTolerableRisk: 1.0 | 2.0 | 3.0;
  weightTacticalPct: number;
  weightEconomicPct: number;
  weightRiskPct: number;
  result: SimulationResponseDTO | null;
}

export default function SimulationPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Search Parameters State
  const [targetPosition, setTargetPosition] = useState<Position>("MF");
  const [targetClusterId, setTargetClusterId] = useState<ClusterId>(1);
  const [maxTransferBudget, setMaxTransferBudget] = useState<string>("35000000");
  const [maxMonthlySalary, setMaxMonthlySalary] = useState<string>("250000");
  const [maxTolerableRisk, setMaxTolerableRisk] = useState<1.0 | 2.0 | 3.0>(2.0);
  const [clubBudgetCap, setClubBudgetCap] = useState<number>(0);

  // WSM Weights (0-100% in UI -> 0.00-1.00 in Request)
  const [weightTacticalPct, setWeightTacticalPct] = useState<number>(50);
  const [weightEconomicPct, setWeightEconomicPct] = useState<number>(30);
  const [weightRiskPct, setWeightRiskPct] = useState<number>(20);

  // Simulation Output State
  const [result, setResult] = useState<SimulationResponseDTO | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hydratedFromStorage, setHydratedFromStorage] = useState<boolean>(false);
  const [hadSavedResult, setHadSavedResult] = useState<boolean>(false);

  // Restore saved simulation state & club budget cap on mount
  useEffect(() => {
    try {
      const dashRaw = localStorage.getItem(DASHBOARD_STATE_STORAGE_KEY);
      if (dashRaw) {
        const dashParsed = JSON.parse(dashRaw) as { budgetCapInput?: string };
        const capNum = Number(dashParsed.budgetCapInput);
        if (!Number.isNaN(capNum) && capNum > 0) {
          setClubBudgetCap(capNum);
        }
      }

      const savedRaw = localStorage.getItem(SIMULATION_STATE_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as Partial<PersistedSimulationState>;
        if (parsed.targetPosition) setTargetPosition(parsed.targetPosition);
        if (parsed.targetClusterId) setTargetClusterId(parsed.targetClusterId);
        if (parsed.maxTransferBudget !== undefined)
          setMaxTransferBudget(parsed.maxTransferBudget);
        if (parsed.maxMonthlySalary !== undefined)
          setMaxMonthlySalary(parsed.maxMonthlySalary);
        if (parsed.maxTolerableRisk) setMaxTolerableRisk(parsed.maxTolerableRisk);
        if (parsed.weightTacticalPct !== undefined)
          setWeightTacticalPct(parsed.weightTacticalPct);
        if (parsed.weightEconomicPct !== undefined)
          setWeightEconomicPct(parsed.weightEconomicPct);
        if (parsed.weightRiskPct !== undefined) setWeightRiskPct(parsed.weightRiskPct);
        if (parsed.result && parsed.result.recommendations.length >= 5) {
          setResult(parsed.result);
          setHadSavedResult(true);
        }
      }
    } catch {
      // ignore storage errors
    } finally {
      setHydratedFromStorage(true);
    }
  }, []);

  // Also fetch latest overview from backend to know if a club budget cap was configured
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      api.dashboard
        .getOverview()
        .then((ov) => {
          if (ov.transferBudgetCap && ov.transferBudgetCap > 0) {
            setClubBudgetCap(ov.transferBudgetCap);
          }
        })
        .catch(() => {
          // ignore if offline
        });
    }
  }, [authLoading, isAuthenticated]);

  // Save simulation state whenever any field or result changes
  useEffect(() => {
    if (!hydratedFromStorage) return;
    try {
      const stateToSave: PersistedSimulationState = {
        targetPosition,
        targetClusterId,
        maxTransferBudget,
        maxMonthlySalary,
        maxTolerableRisk,
        weightTacticalPct,
        weightEconomicPct,
        weightRiskPct,
        result,
      };
      localStorage.setItem(SIMULATION_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // ignore storage errors
    }
  }, [
    hydratedFromStorage,
    targetPosition,
    targetClusterId,
    maxTransferBudget,
    maxMonthlySalary,
    maxTolerableRisk,
    weightTacticalPct,
    weightEconomicPct,
    weightRiskPct,
    result,
  ]);

  const availableClusters = useMemo(
    () => getClustersForPosition(targetPosition),
    [targetPosition]
  );

  const selectedClusterInfo = useMemo(
    () =>
      availableClusters.find((c) => c.id === targetClusterId) || availableClusters[0],
    [availableClusters, targetClusterId]
  );

  const effectiveMaxLimit = clubBudgetCap > 0 ? clubBudgetCap : MAX_MONETARY_LIMIT;

  // Mandatory UX rule: when switching between outfield (DF/MF/FW) and GK, automatically update targetClusterId
  const handleSelectPosition = useCallback((newPosition: Position) => {
    setTargetPosition((prevPos) => {
      const wasGK = prevPos === "GK";
      const isNowGK = newPosition === "GK";
      if (wasGK !== isNowGK) {
        setTargetClusterId(getDefaultClusterForPosition(newPosition));
      } else {
        setTargetClusterId((currentCluster) => {
          const validIds = getClustersForPosition(newPosition).map((c) => c.id);
          return validIds.includes(currentCluster)
            ? currentCluster
            : getDefaultClusterForPosition(newPosition);
        });
      }
      return newPosition;
    });
  }, []);

  const handleReset = useCallback(() => {
    setTargetPosition("MF");
    setTargetClusterId(1);
    setMaxTransferBudget(
      clubBudgetCap > 0 ? String(clubBudgetCap) : "35000000"
    );
    setMaxMonthlySalary(
      clubBudgetCap > 0 ? String(Math.min(250000, clubBudgetCap)) : "250000"
    );
    setMaxTolerableRisk(2.0);
    setWeightTacticalPct(50);
    setWeightEconomicPct(30);
    setWeightRiskPct(20);
    setErrorMessage(null);
  }, [clubBudgetCap]);

  const executeSimulation = useCallback(
    async (customParams?: {
      pos: Position;
      cluster: ClusterId;
      budget: number;
      salary: number;
      risk: 1.0 | 2.0 | 3.0;
      wTac: number;
      wEco: number;
      wRisk: number;
    }) => {
      if (isRunning) return;
      setErrorMessage(null);

      const pos = customParams?.pos ?? targetPosition;
      const validIds = getClustersForPosition(pos).map((c) => c.id);
      const rawCluster = customParams?.cluster ?? targetClusterId;
      const safeCluster = validIds.includes(rawCluster)
        ? rawCluster
        : getDefaultClusterForPosition(pos);

      const numericBudget = customParams?.budget ?? Number(maxTransferBudget);
      const numericSalary = customParams?.salary ?? Number(maxMonthlySalary);
      const riskVal = customParams?.risk ?? maxTolerableRisk;

      if (
        String(maxTransferBudget).trim() === "" ||
        Number.isNaN(numericBudget) ||
        numericBudget < 0 ||
        numericBudget > effectiveMaxLimit
      ) {
        setErrorMessage(
          clubBudgetCap > 0
            ? `O Budget Máximo deve estar no intervalo de € 0 a ${formatCurrencyEUR(
                effectiveMaxLimit
              )} (teto de orçamento definido no Dashboard).`
            : `O Budget Máximo deve estar no intervalo de € 0 a ${formatCurrencyEUR(
                effectiveMaxLimit
              )}.`
        );
        return;
      }

      if (
        String(maxMonthlySalary).trim() === "" ||
        Number.isNaN(numericSalary) ||
        numericSalary < 0 ||
        numericSalary > effectiveMaxLimit
      ) {
        setErrorMessage(
          clubBudgetCap > 0
            ? `O Salário Mensal Máximo deve estar no intervalo de € 0 a ${formatCurrencyEUR(
                effectiveMaxLimit
              )} (teto de orçamento definido no Dashboard).`
            : `O Salário Mensal Máximo deve estar no intervalo de € 0 a ${formatCurrencyEUR(
                effectiveMaxLimit
              )}.`
        );
        return;
      }

      const wTac = Number(((customParams?.wTac ?? weightTacticalPct) / 100).toFixed(2));
      const wEco = Number(((customParams?.wEco ?? weightEconomicPct) / 100).toFixed(2));
      const wRisk = Number(((customParams?.wRisk ?? weightRiskPct) / 100).toFixed(2));

      if (wTac + wEco + wRisk <= 0) {
        setErrorMessage("A soma dos pesos WSM deve ser maior que zero (defina ao menos um peso > 0%).");
        return;
      }

      const payloadBudget = numericBudget === 0 ? 0.01 : numericBudget;
      const payloadSalary = numericSalary === 0 ? 0.01 : numericSalary;

      try {
        setIsRunning(true);
        const res = await api.simulations.run({
          targetPosition: pos,
          targetClusterId: safeCluster,
          maxTransferBudget: payloadBudget,
          maxMonthlySalary: payloadSalary,
          maxTolerableRisk: riskVal,
          weightTactical: wTac,
          weightEconomic: wEco,
          weightRisk: wRisk,
        });

        let finalRecommendations: PlayerRecommendationDTO[] = [...res.recommendations];

        // Ensure Top 5 always displays 5 featured athletes even when strict filters approve < 5
        if (finalRecommendations.length < 5) {
          try {
            const fallbackRes = await api.simulations.run({
              targetPosition: pos,
              targetClusterId: safeCluster,
              maxTransferBudget: 500000000,
              maxMonthlySalary: 10000000,
              maxTolerableRisk: 3.0,
              weightTactical: wTac,
              weightEconomic: wEco,
              weightRisk: wRisk,
            });

            const existingIds = new Set(finalRecommendations.map((r) => r.playerId));
            for (const candidate of fallbackRes.recommendations) {
              if (finalRecommendations.length >= 5) break;
              if (!existingIds.has(candidate.playerId)) {
                finalRecommendations.push(candidate);
                existingIds.add(candidate.playerId);
              }
            }
          } catch {
            // keep primary recommendations if fallback call fails
          }
        }

        setResult({
          recommendations: finalRecommendations,
          totalEvaluated: res.totalEvaluated,
          totalApprovedFilters: res.totalApprovedFilters,
        });
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Falha ao executar simulação multicritério."
        );
      } finally {
        setIsRunning(false);
      }
    },
    [
      isRunning,
      targetPosition,
      targetClusterId,
      maxTransferBudget,
      maxMonthlySalary,
      maxTolerableRisk,
      weightTacticalPct,
      weightEconomicPct,
      weightRiskPct,
      effectiveMaxLimit,
      clubBudgetCap,
    ]
  );

  // Run initial simulation automatically ONLY if there was no saved 5-player result in localStorage
  useEffect(() => {
    if (
      hydratedFromStorage &&
      !hadSavedResult &&
      !authLoading &&
      isAuthenticated &&
      !result &&
      !isRunning
    ) {
      executeSimulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydratedFromStorage, hadSavedResult, authLoading, isAuthenticated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSimulation();
  };

  const rememberDossierAthlete = (playerId: number) => {
    try {
      localStorage.setItem(LAST_DOSSIER_ID_STORAGE_KEY, String(playerId));
    } catch {
      // ignore
    }
  };

  const top5Ids = useMemo(
    () => result?.recommendations.map((r) => r.playerId) ?? [],
    [result]
  );

  return (
    <AppShell
      headerLeft={
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-emerald-400" />
          <h1 className="text-base sm:text-lg font-bold text-white">
            Simulador Multicritério{" "}
            <span className="font-normal text-slate-400">/ What-If Engine</span>
          </h1>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Search & WSM Parameters */}
          <form
            noValidate
            onSubmit={handleSubmit}
            className="lg:col-span-5 xl:col-span-4 rounded-2xl bg-[#0D1522] border border-slate-800/80 p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                <Filter className="h-3.5 w-3.5 text-emerald-400" />
                <span>PARÂMETROS DE BUSCA</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Resetar
              </button>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* POSIÇÃO TÁTICA */}
            <div>
              <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2.5">
                POSIÇÃO TÁTICA
              </label>
              <div className="grid grid-cols-4 gap-2">
                {POSITIONS.map((pos) => {
                  const active = targetPosition === pos;
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => handleSelectPosition(pos)}
                      className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        active
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500 shadow-sm"
                          : "bg-[#091019] text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLUSTER DE PERFIL (IA) */}
            <div>
              <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2.5">
                CLUSTER DE PERFIL (IA · K-MEANS)
              </label>

              {/* 3 Pill Selector matching Figma */}
              <div className="grid grid-cols-3 gap-2">
                {availableClusters.map((cluster) => {
                  const active = targetClusterId === cluster.id;
                  return (
                    <button
                      key={cluster.id}
                      type="button"
                      onClick={() => setTargetClusterId(cluster.id)}
                      className={`py-2.5 px-2 rounded-full text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                        active
                          ? "bg-cyan-500/15 text-cyan-300 border-cyan-400 shadow-sm"
                          : "bg-[#091019] text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {cluster.shortTitle}
                    </button>
                  );
                })}
              </div>

              {/* Full Official Cluster Select & Description */}
              <div className="mt-3">
                <div className="relative">
                  <select
                    value={targetClusterId}
                    onChange={(e) => setTargetClusterId(Number(e.target.value) as ClusterId)}
                    aria-label="Selecionar Cluster Tático"
                    className="appearance-none w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none pl-3.5 pr-10 py-2.5 text-xs text-slate-200 cursor-pointer"
                  >
                    {availableClusters.map((cluster) => (
                      <option key={cluster.id} value={cluster.id}>
                        {cluster.fullLabel}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none h-4 w-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {selectedClusterInfo && (
                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                    {selectedClusterInfo.description}
                  </p>
                )}
              </div>
            </div>

            {/* BUDGET MÁX. & SALÁRIO MÁX. */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
                    BUDGET MÁX. (€)
                  </label>
                  <NumericInput
                    value={maxTransferBudget}
                    onChange={setMaxTransferBudget}
                    min={0}
                    max={effectiveMaxLimit}
                    step={500000}
                    prefix="€"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
                    SALÁRIO MÁX. (€)
                  </label>
                  <NumericInput
                    value={maxMonthlySalary}
                    onChange={setMaxMonthlySalary}
                    min={0}
                    max={effectiveMaxLimit}
                    step={10000}
                    prefix="€"
                    required
                  />
                </div>
              </div>
              {clubBudgetCap > 0 && (
                <p className="text-[11px] font-mono text-slate-400">
                  Limite do orçamento do clube no Dashboard:{" "}
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrencyEUR(clubBudgetCap)}
                  </span>
                </p>
              )}
            </div>

            {/* RISCO MÉDICO MÁXIMO TOLERÁVEL */}
            <div>
              <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
                RISCO MÉDICO MÁXIMO TOLERÁVEL
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RISK_TOLERANCE_OPTIONS.map((opt) => {
                  const selected = maxTolerableRisk === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMaxTolerableRisk(opt.value)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                        selected
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/50"
                          : "bg-[#091019] text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {opt.badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PESOS WSM (0-100%) */}
            <div className="pt-2 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                <span>PESOS WSM (0-100%)</span>
              </div>

              {/* Peso Similaridade Tática */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300">Peso Similaridade Tática</span>
                  <span className="font-mono font-bold text-emerald-400">{weightTacticalPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weightTacticalPct}
                  onChange={(e) => setWeightTacticalPct(Number(e.target.value))}
                  className="w-full wsm-slider"
                />
              </div>

              {/* Peso Oportunidade Econômica */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300">Peso Oportunidade Econômica</span>
                  <span className="font-mono font-bold text-emerald-400">{weightEconomicPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weightEconomicPct}
                  onChange={(e) => setWeightEconomicPct(Number(e.target.value))}
                  className="w-full wsm-slider"
                />
              </div>

              {/* Peso Baixo Risco Médico */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300">Peso Baixo Risco Médico</span>
                  <span className="font-mono font-bold text-emerald-400">{weightRiskPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weightRiskPct}
                  onChange={(e) => setWeightRiskPct(Number(e.target.value))}
                  className="w-full wsm-slider"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isRunning}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00C875] hover:bg-emerald-400 disabled:opacity-55 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Cpu className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
                <span>
                  {isRunning
                    ? "PROCESSANDO SIMULAÇÃO..."
                    : "EXECUTAR SIMULAÇÃO MULTICRITÉRIO"}
                </span>
              </button>
              <p className="mt-2.5 text-center text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase">
                PROCESSAMENTO VIA MOTOR WSM & K-MEANS
              </p>
            </div>
          </form>

          {/* Right Panel: Simulation Results */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Top Metrics Summary Bar */}
            <div className="rounded-2xl bg-[#0D1522] border border-slate-800/80 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-8 sm:gap-12">
                <div>
                  <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    ATLETAS AVALIADOS
                  </p>
                  <p className="mt-1 text-2xl font-mono font-extrabold text-white">
                    {result ? result.totalEvaluated : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    APROVADOS
                  </p>
                  <p className="mt-1 text-2xl font-mono font-extrabold text-cyan-400">
                    {result ? result.totalApprovedFilters : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                    TOP RANKING
                  </p>
                  <p className="mt-1 text-2xl font-mono font-extrabold text-emerald-400">
                    {result
                      ? String(result.recommendations.length).padStart(2, "0")
                      : "00"}
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                  RANKING PONDERADO
                </p>
                <p className="text-xs font-mono text-slate-300 mt-0.5">
                  Posição: {targetPosition} · Cluster {targetClusterId}
                </p>
              </div>
            </div>

            {/* Recommendations Ranking List */}
            {isRunning && !result ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-[#0D1522] border border-slate-800/80 p-6 animate-pulse flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-800" />
                        <div className="space-y-2">
                          <div className="h-5 w-44 rounded bg-slate-800" />
                          <div className="h-3.5 w-32 rounded bg-slate-800/70" />
                        </div>
                      </div>
                      <div className="h-8 w-24 rounded bg-slate-800" />
                    </div>
                    <div className="h-14 w-full rounded-xl bg-slate-800/60" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {result?.recommendations.map((rec, idx) => {
                  const rank = idx + 1;
                  const isFirst = rank === 1;
                  const scorePct = (rec.finalScore * 100).toFixed(1);
                  const tacPct = (rec.tacticalSimilarity * 100).toFixed(0);
                  const ecoPct = (rec.economicOpportunity * 100).toFixed(0);
                  const riskStyle = getInjuryRiskStyles(rec.injuryRisk);

                  return (
                    <div
                      key={rec.playerId}
                      className={`rounded-2xl bg-[#0D1522] border transition-all p-5 sm:p-6 ${
                        isFirst
                          ? "border-emerald-500/45 shadow-lg shadow-emerald-950/30"
                          : "border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Avatar Placeholder + Name + Club + Value */}
                        <div className="flex items-center gap-4">
                          <PlayerAvatar
                            name={rec.name}
                            position={targetPosition}
                            size="lg"
                            rank={rank}
                          />
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <Link
                                href={`/players/${rec.playerId}`}
                                onClick={() => rememberDossierAthlete(rec.playerId)}
                                className="text-lg font-bold text-white hover:text-emerald-400 transition-colors"
                              >
                                {rec.name}
                              </Link>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-slate-500" />
                                {rec.currentClub}
                              </span>
                              <span className="font-mono text-slate-300">
                                Valor: {formatCurrencyEUR(rec.marketValue)}
                              </span>
                              <span className="font-mono text-slate-400">
                                Salário: {formatCurrencyEUR(rec.salary)}/mês
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Multicriteria Score */}
                        <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 border-slate-800/70 pt-3 sm:pt-0">
                          <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                            SCORE MULTICRITÉRIO
                          </p>
                          <p
                            className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight ${
                              isFirst ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {scorePct}%
                          </p>
                        </div>
                      </div>

                      {/* Pills Row */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono font-semibold text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          ADERÊNCIA TÁTICA: {tacPct}%
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-mono font-semibold text-cyan-300">
                          OPORTUNIDADE ECON.: {ecoPct}% ({rec.technicalReport.economicCostBenefit.toUpperCase()})
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono font-semibold ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}
                        >
                          <HeartPulse className="h-3 w-3" />
                          RISCO MÉDICO: {rec.injuryRisk.toUpperCase()}
                        </span>
                      </div>

                      {/* Deterministic Technical Report Box — Shown for ALL recommended athletes */}
                      {rec.technicalReport && (
                        <div className="mt-4 rounded-xl bg-[#091019] border border-slate-800/90 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                              Diagnóstico Tático
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                              {rec.technicalReport.tacticalDiagnosis}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
                              Custo-Benefício & Impacto Salarial
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                              <strong className="text-white">
                                {rec.technicalReport.economicCostBenefit}.
                              </strong>{" "}
                              {rec.technicalReport.payrollImpact}
                            </p>
                          </div>

                          <div className="md:col-span-2 pt-2 border-t border-slate-800/70 flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-slate-400">
                              <strong className="text-slate-200">Prontuário Médico:</strong>{" "}
                              {rec.technicalReport.medicalReliability}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-4">
                        <Link
                          href={`/players/${rec.playerId}`}
                          onClick={() => rememberDossierAthlete(rec.playerId)}
                          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <span>Abrir Dossiê & Radar Tático</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Paginated Market Players Table (All Athletes outside the Top 5) */}
        <MarketPlayersTable
          excludeIds={top5Ids}
          title="Demais Atletas Avaliados na Base de Mercado (Fora do Top 5)"
          subtitle="Lista paginada com todos os demais jogadores da base de scouting, incluindo posição, salário, valor de mercado, risco médico e acesso direto ao dossiê."
        />
      </div>
    </AppShell>
  );
}
