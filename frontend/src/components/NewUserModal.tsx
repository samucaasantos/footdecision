"use client";

import React, { useState } from "react";
import { UserPlus, X, AtSign, Lock, Eye, EyeOff, Crown, LineChart, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { UserRole } from "@/types/api";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export function NewUserModal({ isOpen, onClose, onSuccess }: NewUserModalProps) {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("ROLE_ANALYST");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedFullname = fullname.trim();
    const trimmedUsername = username.trim();

    if (!trimmedFullname) {
      setErrorMessage("Informe o nome completo do membro da comissão.");
      return;
    }
    if (!trimmedUsername) {
      setErrorMessage("Informe o nome de usuário (username).");
      return;
    }
    if (password.length < 6 || password.length > 72) {
      setErrorMessage("A senha deve possuir entre 6 e 72 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.auth.register({
        username: trimmedUsername,
        password,
        fullname: trimmedFullname,
        role,
      });

      const msg = `Usuário "${created.fullname}" (@${created.username}) cadastrado com perfil ${created.role}.`;
      setSuccessMessage(msg);
      onSuccess?.(msg);

      setTimeout(() => {
        setFullname("");
        setUsername("");
        setPassword("");
        setRole("ROLE_ANALYST");
        setSuccessMessage(null);
        onClose();
      }, 900);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao cadastrar usuário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-new-user-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0D1622] border border-emerald-500/25 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
                COMISSÃO TÉCNICA / NOVO ACESSO
              </p>
              <h2 id="modal-new-user-title" className="mt-1 text-xl font-bold text-white">
                Cadastrar Membro da Comissão
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Crie as credenciais de um novo usuário da plataforma.
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

          {successMessage && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Ex: Carolina Mendes Rocha"
                className="w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <AtSign className="h-4 w-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="c.mendes"
                  className="w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none pl-10 pr-3.5 py-3 text-sm font-mono text-slate-100 placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none pl-10 pr-10 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Perfil de acesso (Role)
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1.5 rounded-xl bg-[#091019] border border-slate-800">
              <button
                type="button"
                onClick={() => setRole("ROLE_DIRECTOR")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  role === "ROLE_DIRECTOR"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/50 shadow"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>ROLE_DIRECTOR</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("ROLE_ANALYST")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  role === "ROLE_ANALYST"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/50 shadow"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                <span>ROLE_ANALYST</span>
              </button>
            </div>

            <p className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              {role === "ROLE_ANALYST"
                ? "Analistas acessam o Dossiê e o Simulador, sem editar orçamento."
                : "Diretores possuem controle total sobre teto orçamentário, elenco e acessos."}
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
                {isSubmitting ? "Cadastrando..." : "Cadastrar Membro"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
