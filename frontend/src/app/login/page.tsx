"use client";

import React, { useState } from "react";
import { User, Lock, ArrowRight, Shield, BookOpen, Headphones, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SoccerBallIcon } from "@/components/SoccerBallIcon";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    if (!username.trim() || !password) {
      setErrorMessage("Preencha o utilizador e a palavra-passe para autenticar.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({
        username: username.trim(),
        password,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Falha ao autenticar no sistema. Verifique suas credenciais."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (targetUser: string, targetPass: string) => {
    setErrorMessage(null);
    setUsername(targetUser);
    setPassword(targetPass);
  };

  return (
    <div className="relative min-h-screen bg-[#060B11] text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Subtle tactical pitch geometry background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
        <div className="w-[82vw] max-w-[1150px] h-[68vh] max-h-[680px] border border-slate-800/70 relative flex items-center justify-center">
          <div className="h-full w-px bg-slate-800/70" />
          <div className="absolute h-44 w-44 rounded-full border border-slate-800/60" />
          <div className="absolute left-0 h-64 w-28 border-r border-y border-slate-800/70" />
          <div className="absolute right-0 h-64 w-28 border-l border-y border-slate-800/70" />
        </div>
      </div>

      {/* Corner HUD Brackets */}
      <div className="pointer-events-none absolute top-6 left-6 w-10 h-10 border-t border-l border-emerald-500/30" />
      <div className="pointer-events-none absolute top-6 right-6 w-10 h-10 border-t border-r border-emerald-500/30" />
      <div className="pointer-events-none absolute bottom-6 left-6 w-10 h-10 border-b border-l border-emerald-500/30" />
      <div className="pointer-events-none absolute bottom-6 right-6 w-10 h-10 border-b border-r border-emerald-500/30" />

      {/* Radial Emerald Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/5 blur-[130px] rounded-full" />

      <div className="relative z-10 w-full max-w-[430px] flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25">
              <SoccerBallIcon className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-emerald-400">Foot</span>
              <span className="text-white">Decision</span>
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
              v1.0.0
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono tracking-[0.25em] text-emerald-400/80 uppercase leading-relaxed">
            SISTEMA DE APOIO À DECISÃO E SCOUTING
            <br />
            ALGORÍTMICO
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full rounded-2xl bg-[#0D1520]/95 border border-slate-800/90 shadow-2xl p-7 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="username-input"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                Utilizador
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="username-input"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: analista_pro"
                  className="w-full rounded-xl bg-[#080E16] border border-slate-800/90 focus:border-emerald-500 focus:outline-none pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-medium text-slate-300"
                >
                  Palavra-passe
                </label>
                <span className="text-[11px] text-emerald-400/90 hover:text-emerald-300 cursor-pointer">
                  Esqueceu a senha?
                </span>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-[#080E16] border border-slate-800/90 focus:border-emerald-500 focus:outline-none pl-10 pr-10 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                  aria-label="Alternar visibilidade da senha"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40"
              />
              <label htmlFor="remember-me" className="text-xs text-slate-300 select-none">
                Manter sessão iniciada
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#00C875] hover:bg-emerald-400 disabled:opacity-55 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>{isSubmitting ? "Autenticando..." : "Autenticar no Sistema"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick-Fill Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0D1520] px-3 text-[10px] font-mono tracking-[0.16em] text-slate-400 uppercase whitespace-nowrap">
              ACESSO RÁPIDO PARA DEMONSTRAÇÃO
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Quick-Fill Seed Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleQuickFill("lucca_martinelli", "assrendnehn123")}
              className="w-full rounded-xl bg-[#111B28] hover:bg-[#162232] border border-slate-800 hover:border-emerald-500/40 px-4 py-3 flex items-center justify-between transition-all group cursor-pointer"
            >
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                Acesso Diretor Executivo
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-400">
                DIRETOR
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("rodrigo_faria", "qwx34@%3@aafgh")}
              className="w-full rounded-xl bg-[#111B28] hover:bg-[#162232] border border-slate-800 hover:border-emerald-500/40 px-4 py-3 flex items-center justify-between transition-all group cursor-pointer"
            >
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                Acesso Analista de Scouting
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-semibold text-emerald-400">
                ANALISTA
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-7 text-center space-y-3">
          <p className="text-xs text-slate-500">
            © 2026 FootDecision SAD · v1.0.0 (Ciclo Evolutivo Contínuo)
          </p>
          <div className="flex items-center justify-center gap-5 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> SEGURANÇA
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" /> MANUAL
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Headphones className="h-3 w-3" /> SUPORTE
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
