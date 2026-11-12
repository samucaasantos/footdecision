"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FlaskConical,
  IdCard,
  FileBarChart2,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/utils/formatters";

interface AppShellProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function AppShell({ children, headerLeft, headerRight }: AppShellProps) {
  const { user, isDirector, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      href: "/players/13",
      icon: IdCard,
      active: pathname.startsWith("/players"),
    },
  ];

  const reportItems = [
    {
      label: "Financeiro",
      href: "/dashboard",
      icon: FileBarChart2,
    },
    {
      label: "Scouting Hub",
      href: "/simulation",
      icon: Users,
    },
  ];

  const initials = getInitials(user?.displayName || user?.username || "FD");

  return (
    <div className="min-h-screen bg-[#070D14] text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0A111A] print:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
            <ShieldCheck className="h-5 w-5" />
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
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <polygon points="12 7 15.5 9.5 14 13.5 10 13.5 8.5 9.5 12 7" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-tight leading-none">
                  <span className="text-emerald-400">Foot</span>
                  <span className="text-white">Decision</span>
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
                    key={item.href}
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

          <div className="border-t border-slate-800/70 pt-4">
            <p className="px-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-2.5">
              RELATÓRIOS
            </p>
            <nav className="space-y-1">
              {reportItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Transfer Window Info */}
          <div className="px-2 pt-2">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              JANELA DE TRANSFERÊNCIAS
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">Janeiro 2027</p>
            <p className="text-xs text-slate-500 mt-0.5">Planejamento do elenco</p>
          </div>
        </div>

        {/* Bottom Status & User Footer */}
        <div className="p-4 space-y-4 border-t border-slate-800/80 bg-[#080D15]">
          <div className="rounded-xl bg-[#0D1622] border border-slate-800/80 p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-300">Base sincronizada</span>
            </div>
            <p className="mt-1 text-[11px] font-mono text-slate-400">12 nov. 2026 · 09:42 UTC</p>
          </div>

          <div className="px-1">
            <p className="text-xs font-medium text-slate-300">Permissões de gestão</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {user?.role || "ROLE_ANALYST"}
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
                <p className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase">
                  {isDirector ? "DIRECTOR ACCESS" : "ANALYST ACCESS"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Encerrar sessão"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/70 transition-colors"
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
              <span
                className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase border ${
                  isDirector
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                }`}
              >
                {isDirector ? "DIRETOR EXECUTIVO" : "ANALISTA DE SCOUTING"}
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
        <main className="flex-1 p-5 sm:p-8 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
