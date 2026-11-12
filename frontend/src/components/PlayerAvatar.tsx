"use client";

import React from "react";
import { Shield } from "lucide-react";
import { Position } from "@/types/api";
import { getInitials, POSITION_METADATA } from "@/utils/formatters";

interface PlayerAvatarProps {
  name: string;
  position?: Position;
  size?: "sm" | "md" | "lg" | "xl";
  rank?: number;
  showShieldBadge?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-9 h-9 text-xs rounded-lg",
  md: "w-12 h-12 text-sm rounded-xl",
  lg: "w-14 h-14 text-base rounded-2xl",
  xl: "w-24 h-24 text-2xl rounded-2xl",
};

const GRADIENT_BY_POSITION: Record<Position, string> = {
  GK: "from-cyan-500/25 via-cyan-950/60 to-slate-900 border-cyan-500/40 text-cyan-300",
  DF: "from-sky-500/25 via-sky-950/60 to-slate-900 border-sky-500/40 text-sky-300",
  MF: "from-amber-500/25 via-amber-950/60 to-slate-900 border-amber-500/40 text-amber-300",
  FW: "from-emerald-500/25 via-emerald-950/60 to-slate-900 border-emerald-500/40 text-emerald-300",
};

export const PlayerAvatar = React.memo(function PlayerAvatar({
  name,
  position = "MF",
  size = "lg",
  rank,
  showShieldBadge = false,
  className = "",
}: PlayerAvatarProps) {
  const initials = getInitials(name);
  const posGradient = GRADIENT_BY_POSITION[position] || GRADIENT_BY_POSITION.MF;
  const posMeta = POSITION_METADATA[position] || POSITION_METADATA.MF;

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {rank !== undefined && (
        <span
          className={`absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-md ${
            rank === 1
              ? "bg-emerald-500 text-slate-950 ring-2 ring-slate-950"
              : "bg-slate-800 text-slate-200 border border-slate-600"
          }`}
        >
          {rank}
        </span>
      )}

      <div
        className={`relative flex items-center justify-center overflow-hidden border bg-gradient-to-br font-bold tracking-wider shadow-inner ${SIZE_CLASSES[size]} ${posGradient}`}
        title={`${name} (${posMeta.code})`}
      >
        {/* Subtle SVG Jersey/Tactical watermark */}
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-15 pointer-events-none"
          fill="currentColor"
        >
          <path d="M20 10L10 18l5 9 7-4v31h20V23l7 4 5-9-10-8h-5a7 7 0 01-14 0h-5z" />
        </svg>

        <span className="relative z-10 font-mono tracking-tight drop-shadow-sm">{initials}</span>
      </div>

      {showShieldBadge && (
        <span
          className="absolute -bottom-1.5 -right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg ring-2 ring-slate-950"
          title={`Perfil Verificado · ${posMeta.label}`}
        >
          <Shield className="h-3.5 w-3.5 fill-current" />
        </span>
      )}
    </div>
  );
});
