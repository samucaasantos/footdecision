"use client";

import React, { useState } from "react";
import { ShieldPlus, X, User, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { InjuryRisk, Position, SquadPlayerResponseDTO } from "@/types/api";
import { formatCurrencyEUR } from "@/utils/formatters";

interface AddSquadPlayerModalProps {
  isOpen: boolean;
  priorityPosition?: Position;
  onClose: () => void;
  onPlayerAdded: (player: SquadPlayerResponseDTO) => void;
}

const POSITIONS: Position[] = ["GK", "DF", "MF", "FW"];
const RISKS: InjuryRisk[] = ["Baixo", "Moderado", "Alto"];

export function AddSquadPlayerModal({
  isOpen,
  priorityPosition = "MF",
  onClose,
  onPlayerAdded,
}: AddSquadPlayerModalProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>(priorityPosition);
  const [age, setAge] = useState<string>("24");
  const [salary, setSalary] = useState<string>("110000");
  const [injuryRisk, setInjuryRisk] = useState<InjuryRisk>("Baixo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedSalary = Number(salary) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    const trimmedName = name.trim();
    const numericAge = Number(age);
    const numericSalary = Number(salary);

    if (!trimmedName) {
      setErrorMessage("Informe o nome completo do atleta.");
      return;
    }
    if (!Number.isInteger(numericAge) || numericAge < 15 || numericAge > 59) {
      setErrorMessage("A idade do atleta deve ser um número inteiro entre 15 e 59 anos.");
      return;
    }
    if (Number.isNaN(numericSalary) || numericSalary < 0) {
      setErrorMessage("O salário mensal deve ser um valor válido maior ou igual a zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.dashboard.addSquadPlayer({
        name: trimmedName,
        position,
        age: numericAge,
        salary: numericSalary,
        injuryRisk,
      });

      onPlayerAdded(created);
      setName("");
      setAge("24");
      setSalary("110000");
      setInjuryRisk("Baixo");
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao adicionar atleta ao elenco.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-player-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0D1622] border border-emerald-500/25 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
                ELENCO / NOVO CONTRATO
              </p>
              <h2 id="modal-add-player-title" className="mt-1 text-xl font-bold text-white">
                Adicionar Atleta ao Elenco
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Registe um novo atleta e os respetivos parâmetros contratuais.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-slate-800 bg-slate-900/70 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Nome do Atleta
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Diogo Pereira Lima"
                className="w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Posição */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Posição
            </label>
            <div className="grid grid-cols-4 gap-2 p-1.5 rounded-xl bg-[#091019] border border-slate-800">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    position === pos
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/50 shadow"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              {priorityPosition} é a posição prioritária definida pela direção.
            </p>
          </div>

          {/* Idade e Salário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Idade
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={15}
                  max={59}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none px-4 pr-16 py-3 text-sm font-mono text-slate-100 transition-colors"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
                  ANOS
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Salário Mensal (€)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  €
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  step="500"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none pl-8 pr-14 py-3 text-sm font-mono text-slate-100 transition-colors"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
                  EUR
                </span>
              </div>
            </div>
          </div>

          {/* Risco Médico */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Risco Médico
            </label>
            <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-xl bg-[#091019] border border-slate-800">
              {RISKS.map((risk) => {
                const selected = injuryRisk === risk;
                const dotColor =
                  risk === "Baixo"
                    ? "bg-emerald-400"
                    : risk === "Moderado"
                      ? "bg-amber-400"
                      : "bg-rose-400";
                return (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => setInjuryRisk(risk)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selected
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50 shadow"
                        : "text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                    <span>{risk}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              Impacto estimado na folha: +{formatCurrencyEUR(parsedSalary)} / mês.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              Ação registrada · ROLE_DIRECTOR
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/70 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-bold text-slate-950 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {isSubmitting ? "Adicionando..." : "Adicionar ao Elenco"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
