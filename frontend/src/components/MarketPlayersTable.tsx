"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, ArrowRight } from "lucide-react";
import { Position } from "@/types/api";
import { LAST_DOSSIER_ID_STORAGE_KEY } from "@/services/api";
import {
  formatCurrencyEUR,
  getInjuryRiskStyles,
  POSITION_METADATA,
} from "@/utils/formatters";
import { MARKET_PLAYERS_CATALOG } from "@/utils/marketPlayersCatalog";

interface MarketPlayersTableProps {
  excludeIds?: number[];
  defaultPositionFilter?: Position | "ALL";
  title?: string;
  subtitle?: string;
}

const PAGE_SIZE = 6;

export function MarketPlayersTable({
  excludeIds = [],
  defaultPositionFilter = "ALL",
  title = "Demais Atletas da Base de Mercado",
  subtitle = "Explore todos os atletas avaliados fora do Top 5, verifique o risco médico e acesse o dossiê individual.",
}: MarketPlayersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">(defaultPositionFilter);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlayers = useMemo(() => {
    const excludeSet = new Set(excludeIds);
    const q = searchQuery.trim().toLowerCase();

    return MARKET_PLAYERS_CATALOG.filter((player) => {
      if (excludeSet.has(player.id)) return false;
      if (positionFilter !== "ALL" && player.position !== positionFilter) return false;
      if (q) {
        const matchesName = player.name.toLowerCase().includes(q);
        const matchesClub = player.currentClub.toLowerCase().includes(q);
        if (!matchesName && !matchesClub) return false;
      }
      return true;
    });
  }, [excludeIds, positionFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedPlayers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPlayers.slice(start, start + PAGE_SIZE);
  }, [filteredPlayers, safePage]);

  const handleSelectAthlete = (id: number) => {
    try {
      localStorage.setItem(LAST_DOSSIER_ID_STORAGE_KEY, String(id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl bg-[#0D1522] border border-slate-800/80 overflow-hidden print:hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Position filter pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#091019] border border-slate-800">
            {(["ALL", "GK", "DF", "MF", "FW"] as const).map((pos) => {
              const active = positionFilter === pos;
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => {
                    setPositionFilter(pos);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  {pos === "ALL" ? "TODOS" : pos}
                </button>
              );
            })}
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar nome ou clube..."
              className="w-48 sm:w-56 rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-mono uppercase text-slate-400 bg-[#0A111C]">
              <th className="py-3.5 px-6">NOME</th>
              <th className="py-3.5 px-4">CLUBE</th>
              <th className="py-3.5 px-4 text-center">POSIÇÃO</th>
              <th className="py-3.5 px-4 text-center">IDADE</th>
              <th className="py-3.5 px-4">VALOR DE MERCADO</th>
              <th className="py-3.5 px-4">SALÁRIO MENSAL €</th>
              <th className="py-3.5 px-4">RISCO MÉDICO</th>
              <th className="py-3.5 px-6 text-right">DOSSIÊ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {paginatedPlayers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 px-6 text-center text-sm text-slate-400">
                  Nenhum atleta encontrado para o filtro selecionado.
                </td>
              </tr>
            ) : (
              paginatedPlayers.map((player) => {
                const posMeta = POSITION_METADATA[player.position] || POSITION_METADATA.MF;
                const riskStyle = getInjuryRiskStyles(player.injuryRisk);

                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-800/25 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-medium text-white">
                      {player.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {player.currentClub}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono text-xs font-bold ${posMeta.badgeText}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {player.age}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-400 font-semibold">
                      {formatCurrencyEUR(player.marketValue)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-100">
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
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/players/${player.id}`}
                        onClick={() => handleSelectAthlete(player.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors"
                      >
                        <span>Ver Dossiê</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 bg-[#0A111C] border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <span>
          Exibindo{" "}
          {filteredPlayers.length === 0
            ? "0"
            : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                safePage * PAGE_SIZE,
                filteredPlayers.length
              )}`}{" "}
          de {filteredPlayers.length} atletas disponíveis
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
  );
}
