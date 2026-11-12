"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { NewUserModal } from "@/components/NewUserModal";
import { AddSquadPlayerModal } from "@/components/AddSquadPlayerModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
  DashboardOverviewDTO,
  Position,
  SquadPlayerResponseDTO,
} from "@/types/api";
import {
  formatCurrencyEUR,
  getInjuryRiskStyles,
  POSITION_METADATA,
} from "@/utils/formatters";

const PositionDistributionChart = dynamic(
  () => import("@/components/charts/PositionDistributionChart"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3.5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 rounded-lg bg-slate-800/70" />
        ))}
        <div className="h-28 rounded-xl bg-slate-800/50 mt-3" />
      </div>
    ),
  }
);

const PAGE_SIZE = 6;

export default function DashboardPage() {
  const { isDirector, isAuthenticated, isLoading: authLoading } = useAuth();

  const [overview, setOverview] = useState<DashboardOverviewDTO | null>(null);
  const [squad, setSquad] = useState<SquadPlayerResponseDTO[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Director Config Form State
  const [budgetCapInput, setBudgetCapInput] = useState<string>("");
  const [priorityNeedInput, setPriorityNeedInput] = useState<Position>("MF");
  const [isUpdatingConfig, setIsUpdatingConfig] = useState<boolean>(false);

  // Table & Modals State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setErrorMessage(null);
    setIsLoadingData(true);
    try {
      const [overviewRes, squadRes] = await Promise.all([
        api.dashboard.getOverview(),
        api.dashboard.getSquad(),
      ]);
      setOverview(overviewRes);
      setSquad(squadRes);
      setBudgetCapInput(String(overviewRes.transferBudgetCap ?? 0));
      setPriorityNeedInput(overviewRes.priorityTacticalNeed ?? "MF");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os dados do Dashboard Executivo."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadDashboardData();
    }
  }, [authLoading, isAuthenticated, loadDashboardData]);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirector || isUpdatingConfig) return;

    const numericBudget = Number(budgetCapInput);
    if (Number.isNaN(numericBudget) || numericBudget < 0) {
      setErrorMessage("O teto de transferências deve ser um valor maior ou igual a zero.");
      return;
    }

    try {
      setIsUpdatingConfig(true);
      setErrorMessage(null);
      const updated = await api.dashboard.updateConfig({
        transferBudgetCap: numericBudget,
        priorityTacticalNeed: priorityNeedInput,
      });
      setOverview(updated);
      setBudgetCapInput(String(updated.transferBudgetCap));
      setPriorityNeedInput(updated.priorityTacticalNeed);
      showToast("Configuração orçamentária e posição prioritária atualizadas com sucesso.");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao atualizar configuração orçamentária."
      );
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleRemovePlayer = async (player: SquadPlayerResponseDTO) => {
    if (!isDirector || deletingPlayerId !== null) return;

    try {
      setDeletingPlayerId(player.id);
      setErrorMessage(null);
      await api.dashboard.removeSquadPlayer(player.id);

      const updatedOverview = await api.dashboard.getOverview();
      setOverview(updatedOverview);
      setSquad((prev) => prev.filter((p) => p.id !== player.id));
      showToast(`Atleta "${player.name}" removido do elenco.`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao remover atleta do elenco."
      );
    } finally {
      setDeletingPlayerId(null);
    }
  };

  const handlePlayerAdded = useCallback(
    async (newPlayer: SquadPlayerResponseDTO) => {
      setSquad((prev) => [newPlayer, ...prev]);
      setCurrentPage(1);
      showToast(`Atleta "${newPlayer.name}" adicionado ao elenco.`);
      try {
        const updatedOverview = await api.dashboard.getOverview();
        setOverview(updatedOverview);
      } catch {
        // Overview fallback if needed
      }
    },
    [showToast]
  );

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(squad.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSquad = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return squad.slice(start, start + PAGE_SIZE);
  }, [squad, safePage]);

  const priorityMeta =
    POSITION_METADATA[overview?.priorityTacticalNeed || "MF"] || POSITION_METADATA.MF;

  const dist = overview?.distributionByPosition || { GK: 0, DF: 0, MF: 0, FW: 0 };

  return (
    <AppShell
      headerLeft={
        <div>
          <p className="text-sm font-bold text-white">FootDecision SAD</p>
          <p className="text-xs text-slate-400">Gestão do clube / Dashboard Executivo</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Page Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono font-semibold tracking-[0.18em] text-emerald-400 uppercase">
              DIREÇÃO EXECUTIVA / ELENCO & ORÇAMENTO
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Executivo
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Controle financeiro e equilíbrio tático para a próxima decisão.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end">
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={isLoadingData}
              className="px-3 py-1.5 rounded-lg bg-[#0D1724] border border-slate-800 hover:border-slate-700 text-xs text-slate-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recarregar dados"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
              <span>Sincronizar</span>
            </button>
            <div className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 inline-flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Época 2026/27</span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs underline hover:text-white"
            >
              Fechar
            </button>
          </div>
        )}

        {toastMessage && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 4 KPI Cards (CLS Zero with fixed height skeleton fallback) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoadingData && !overview ? (
            <>
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-[132px] rounded-2xl bg-[#0D1522] border border-slate-800/80 p-5 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-3.5 w-40 rounded bg-slate-800" />
                  <div className="h-8 w-48 rounded bg-slate-800" />
                  <div className="h-3 w-32 rounded bg-slate-800/70" />
                </div>
              ))}
            </>
          ) : (
            <>
              {/* KPI 1: Folha Salarial */}
              <div className="h-[132px] rounded-2xl bg-[#0D1522] border border-slate-800/80 p-5 flex flex-col justify-between">
                <p className="text-xs font-medium text-slate-400">Folha Salarial Mensal Total</p>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                  {formatCurrencyEUR(overview?.totalPayroll)}
                </p>
                <p className="text-xs text-slate-500">
                  / mês · {overview?.totalSquadCount ?? 0} contratos ativos
                </p>
              </div>

              {/* KPI 2: Teto de Orçamento */}
              <div className="h-[132px] rounded-2xl bg-[#0D1522] border border-slate-800/80 p-5 flex flex-col justify-between">
                <p className="text-xs font-medium text-slate-400">
                  Teto de Orçamento de Transferências
                </p>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {formatCurrencyEUR(overview?.transferBudgetCap)}
                </p>
                <p className="text-xs text-slate-500">Limite aprovado pela direção</p>
              </div>

              {/* KPI 3: Total de Atletas */}
              <div className="h-[132px] rounded-2xl bg-[#0D1522] border border-slate-800/80 p-5 flex flex-col justify-between">
                <p className="text-xs font-medium text-slate-400">Total de Atletas no Elenco</p>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                  {overview?.totalSquadCount ?? 0}
                </p>
                <p className="text-xs font-mono text-slate-400">
                  {dist.GK ?? 0} GK / {dist.DF ?? 0} DF / {dist.MF ?? 0} MF / {dist.FW ?? 0} FW
                </p>
              </div>

              {/* KPI 4: Carência Tática Prioritária */}
              <div className="h-[132px] rounded-2xl bg-[#0D1522] border border-amber-500/40 p-5 flex flex-col justify-between">
                <p className="text-xs font-medium text-slate-300">Carência Tática Prioritária</p>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-lg font-mono font-extrabold text-amber-400">
                    {priorityMeta.code}
                  </span>
                  <span className="text-xs font-semibold text-amber-400">Prioridade alta</span>
                </div>
                <p className="text-xs text-amber-400/90 truncate">{priorityMeta.shortDescription}</p>
              </div>
            </>
          )}
        </div>

        {/* Middle Row: Distribution Chart + Club Budget Config (RBAC gated) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Distribution by Position */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0D1522] border border-slate-800/80 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Distribuição do elenco por posição
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 mb-5">
                Cobertura atual por setor · {overview?.totalSquadCount ?? 0} atletas
              </p>

              <PositionDistributionChart
                distribution={dist}
                totalSquadCount={overview?.totalSquadCount ?? 0}
              />
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/70">
              <p className="text-xs text-amber-400">
                {priorityMeta.code}: prioridade de perfil, não de volume no setor.
              </p>
            </div>
          </div>

          {/* Club Budget Configuration (ROLE_DIRECTOR Exclusive Action) */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0B1720] border border-emerald-500/25 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Configuração Orçamentária do Clube
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Parâmetros que orientam o planejamento de contratações.
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase shrink-0">
                  SÓ DIRETOR
                </span>
              </div>

              {isDirector ? (
                <form onSubmit={handleUpdateConfig} className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Teto de transferências (€)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step="100000"
                          required
                          value={budgetCapInput}
                          onChange={(e) => setBudgetCapInput(e.target.value)}
                          className="w-full rounded-xl bg-[#081018] border border-slate-800 focus:border-emerald-500 focus:outline-none px-4 pr-14 py-3 text-sm font-mono text-white transition-colors"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                          EUR
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Posição prioritária
                      </label>
                      <select
                        value={priorityNeedInput}
                        onChange={(e) => setPriorityNeedInput(e.target.value as Position)}
                        className="w-full rounded-xl bg-[#081018] border border-slate-800 focus:border-emerald-500 focus:outline-none px-4 py-3 text-sm text-white transition-colors"
                      >
                        <option value="GK">GK · Goleiro</option>
                        <option value="DF">DF · Defensor</option>
                        <option value="MF">MF · Meio-campo</option>
                        <option value="FW">FW · Atacante</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={isUpdatingConfig}
                      className="px-5 py-2.5 rounded-xl bg-[#00C875] hover:bg-emerald-400 disabled:opacity-50 text-xs font-bold text-slate-950 transition-colors shadow-lg shadow-emerald-500/15 cursor-pointer"
                    >
                      {isUpdatingConfig ? "Atualizando..." : "Atualizar orçamento"}
                    </button>
                    <span className="text-xs text-slate-400">Atualizado em 12 nov. 2026</span>
                  </div>
                </form>
              ) : (
                <div className="mt-6 rounded-xl bg-[#081018]/90 border border-slate-800 p-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-400 text-xs font-semibold">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span>Modo Somente Leitura (Perfil Analista · ROLE_ANALYST)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A edição de teto orçamentário, alteração da posição prioritária, gestão de
                    contratos do elenco e o cadastro de novos membros são operações exclusivas do{" "}
                    <strong className="text-slate-200">Diretor Executivo (ROLE_DIRECTOR)</strong>.
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <Link
                      href="/simulation"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                    >
                      Ir para o Simulador What-If →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {isDirector && (
              <div className="pt-5 mt-5 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0D1F22] hover:bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
                >
                  + Cadastrar Membro da Comissão (Novo Usuário)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Squad Table Section */}
        <div className="rounded-2xl bg-[#0D1522] border border-slate-800/80 overflow-hidden">
          <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Gestão do Elenco Atual</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Contratos, salários e disponibilidade clínica em uma única visão.
              </p>
            </div>

            {isDirector && (
              <button
                type="button"
                onClick={() => setIsAddPlayerModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#00C875] hover:bg-emerald-400 text-xs font-bold text-slate-950 inline-flex items-center gap-2 shadow-lg shadow-emerald-500/15 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Adicionar Atleta ao Elenco</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-mono uppercase text-slate-400 bg-[#0A111C]">
                  <th className="py-3.5 px-6">NOME</th>
                  <th className="py-3.5 px-4 text-center">POSIÇÃO</th>
                  <th className="py-3.5 px-4 text-center">IDADE</th>
                  <th className="py-3.5 px-4">SALÁRIO MENSAL €</th>
                  <th className="py-3.5 px-4">RISCO MÉDICO</th>
                  {isDirector && <th className="py-3.5 px-6 text-right">AÇÃO</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {isLoadingData && squad.length === 0 ? (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                      <tr key={row} className="animate-pulse">
                        <td className="py-4 px-6">
                          <div className="h-4 w-36 rounded bg-slate-800" />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-4 w-8 mx-auto rounded bg-slate-800" />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-4 w-8 mx-auto rounded bg-slate-800" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 w-24 rounded bg-slate-800" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-6 w-20 rounded-md bg-slate-800" />
                        </td>
                        {isDirector && (
                          <td className="py-4 px-6 text-right">
                            <div className="h-7 w-16 ml-auto rounded-md bg-slate-800" />
                          </td>
                        )}
                      </tr>
                    ))}
                  </>
                ) : paginatedSquad.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isDirector ? 6 : 5}
                      className="py-10 px-6 text-center text-sm text-slate-400"
                    >
                      Nenhum atleta registado no elenco atualmente.
                    </td>
                  </tr>
                ) : (
                  paginatedSquad.map((player) => {
                    const posMeta = POSITION_METADATA[player.position] || POSITION_METADATA.MF;
                    const riskStyle = getInjuryRiskStyles(player.injuryRisk);
                    const isDeleting = deletingPlayerId === player.id;

                    return (
                      <tr
                        key={player.id}
                        className="hover:bg-slate-800/25 transition-colors"
                      >
                        <td className="py-3.5 px-6 font-medium text-white">
                          {player.name}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-mono text-xs font-bold ${posMeta.badgeText}`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                          {player.age}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-100">
                          {formatCurrencyEUR(player.salary)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${riskStyle.dot}`} />
                            {player.injuryRisk}
                          </span>
                        </td>
                        {isDirector && (
                          <td className="py-3.5 px-6 text-right">
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleRemovePlayer(player)}
                              className="px-4 py-1.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-medium text-rose-400 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              {isDeleting ? "..." : "Excluir"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-[#0A111C] border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <span>
              Exibindo{" "}
              {squad.length === 0
                ? "0"
                : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                    safePage * PAGE_SIZE,
                    squad.length
                  )}`}{" "}
              de {squad.length} atletas
            </span>

            <span>
              Folha salarial total: {formatCurrencyEUR(overview?.totalPayroll)} / mês
            </span>

            <div className="flex items-center gap-2">
              <span>
                Página {safePage} de {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footnote */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
          <span>FootDecision SAD · Sistema de Apoio à Decisão</span>
          <span>
            {isDirector
              ? "Acesso executivo completo · ROLE_DIRECTOR"
              : "Acesso analítico de consulta · ROLE_ANALYST"}
          </span>
        </div>
      </div>

      {/* Modals (rendered only for ROLE_DIRECTOR) */}
      {isDirector && (
        <>
          <NewUserModal
            isOpen={isNewUserModalOpen}
            onClose={() => setIsNewUserModalOpen(false)}
            onSuccess={(msg) => showToast(msg)}
          />
          <AddSquadPlayerModal
            isOpen={isAddPlayerModalOpen}
            priorityPosition={overview?.priorityTacticalNeed || "MF"}
            onClose={() => setIsAddPlayerModalOpen(false)}
            onPlayerAdded={handlePlayerAdded}
          />
        </>
      )}
    </AppShell>
  );
}
