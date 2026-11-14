"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FlaskConical,
  IdCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LAST_DOSSIER_ID_STORAGE_KEY } from "@/services/api";
import { getInitials } from "@/utils/formatters";
import { SoccerBallIcon } from "@/components/SoccerBallIcon";

interface AppShellProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function AppShell({ children, headerLeft, headerRight }: AppShellProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastDossierId, setLastDossierId] = useState<string>("13");

  useEffect(() => {
    try {
      const savedId = localStorage.getItem(LAST_DOSSIER_ID_STORAGE_KEY);
      if (savedId && !Number.isNaN(Number(savedId))) {
        setLastDossierId(savedId);
      }
    } catch {
      // ignore storage errors
    }
  }, [pathname]);

  const navItems = [
    {
      label: "Dashboard Executivo",
      href: "/dashboard",
      icon: LayoutGrid,
      active: pathname === "/dashboard",
    },
    {
      label: "Simulador What-If",
      href: "/simulation",
      icon: FlaskConical,
      active: pathname.startsWith("/simulation"),
    },
    {
      label: "Dossiê de Atletas",
      href: `/players/${lastDossierId}`,
      icon: IdCard,
      active: pathname.startsWith("/players"),
    },
  ];

  const initials = getInitials(user?.displayName || user?.username || "FD");

  return (
    <div className="min-h-screen print:min-h-0 bg-[#070D14] text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0A111A] print:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
            <SoccerBallIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-emerald-400 font-bold text-base">Foot</span>
            <span className="text-white font-bold text-base">Decision</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
          aria-label="Alternar menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#090F17] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 print:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Logo */}
          <Link href="/dashboard" className="block group">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <SoccerBallIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-extrabold tracking-tight leading-none">
                    <span className="text-emerald-400">Foot</span>
                    <span className="text-white">Decision</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400">
                    v1.0
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-1.5 text-[10px] font-mono tracking-[0.18em] text-slate-400 uppercase">
              SAD / INTELLIGENCE PLATFORM
            </p>
          </Link>

          {/* Workspace Box */}
          <div className="rounded-xl bg-[#0F1724] border border-slate-800/90 p-3.5">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              WORKSPACE
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">Clube · Demonstração</p>
          </div>

          {/* Operations Center */}
          <div>
            <p className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-2.5">
              CENTRO DE OPERAÇÕES
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      item.active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Transfer Window Info */}
          <div className="px-2 pt-4 border-t border-slate-800/70">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              JANELA DE TRANSFERÊNCIAS
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">Planejamento Ativo</p>
            <p className="text-xs text-slate-500 mt-0.5">Gestão estratégica do elenco</p>
          </div>
        </div>

        {/* Bottom Status, Version & User Footer */}
        <div className="p-4 space-y-3.5 border-t border-slate-800/80 bg-[#080D15]">
          <div className="rounded-xl bg-[#0D1622] border border-slate-800/80 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-300">Base sincronizada</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">v1.0.0</span>
            </div>
            <p className="mt-1 text-[10px] font-mono text-slate-500">
              Release 1.0 · Ciclo evolutivo v1.x
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-[10px] font-mono tracking-wider text-emerald-400/90">
                  Sessão Autenticada
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Encerrar sessão"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 px-6 border-b border-slate-800/80 bg-[#090F17]/90 backdrop-blur flex items-center justify-between gap-4 print:hidden">
          <div className="min-w-0">
            {headerLeft ?? (
              <div>
                <p className="text-sm font-semibold text-slate-100">FootDecision SAD</p>
                <p className="text-xs text-slate-400">Gestão do clube / Plataforma Executiva</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {headerRight}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-200">
                {user?.displayName || user?.username}
              </span>
            </div>
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-5 sm:p-8 print:p-2 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
