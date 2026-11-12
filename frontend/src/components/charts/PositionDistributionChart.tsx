"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Position } from "@/types/api";
import { POSITION_METADATA } from "@/utils/formatters";

interface PositionDistributionChartProps {
  distribution: Record<Position, number>;
  totalSquadCount: number;
}

const ORDERED_POSITIONS: Position[] = ["GK", "DF", "MF", "FW"];

export default function PositionDistributionChart({
  distribution,
  totalSquadCount,
}: PositionDistributionChartProps) {
  const chartData = useMemo(() => {
    const safeTotal = totalSquadCount > 0 ? totalSquadCount : 1;
    return ORDERED_POSITIONS.map((pos) => {
      const count = distribution?.[pos] ?? 0;
      const pct = Number(((count / safeTotal) * 100).toFixed(1));
      const meta = POSITION_METADATA[pos];
      return {
        pos,
        name: meta.pluralLabel,
        count,
        pct,
        color: meta.hex,
        badgeBg: meta.badgeBg,
        badgeText: meta.badgeText,
        barColor: meta.barColor,
      };
    });
  }, [distribution, totalSquadCount]);

  return (
    <div className="space-y-4">
      {/* Custom Figma-style sector bars */}
      <div className="space-y-3.5">
        {chartData.map((row) => (
          <div key={row.pos} className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-4 sm:col-span-3 flex items-center gap-2.5">
              <span
                className={`inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-mono font-bold ${row.badgeBg} ${row.badgeText}`}
              >
                {row.pos}
              </span>
              <span className="text-xs sm:text-sm text-slate-300 truncate">{row.name}</span>
            </div>

            <div className="col-span-5 sm:col-span-6">
              <div className="h-2.5 w-full rounded-full bg-slate-800/90 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${row.barColor}`}
                  style={{ width: `${Math.min(100, Math.max(row.count > 0 ? 6 : 0, row.pct))}%` }}
                />
              </div>
            </div>

            <div className="col-span-3 flex items-center justify-end gap-3 font-mono">
              <span className="text-sm font-bold text-white">
                {String(row.count).padStart(2, "0")}
              </span>
              <span className="text-xs text-slate-400 w-12 text-right">
                {row.pct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Recharts Mini Distribution Bar Chart */}
      <div className="h-28 pt-2 border-t border-slate-800/60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="pos"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(15, 23, 42, 0.55)" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg bg-slate-950/95 border border-slate-700 px-3 py-2 text-xs shadow-xl">
                    <p className="font-semibold text-white">
                      {item.name} ({item.pos})
                    </p>
                    <p className="text-slate-300 font-mono mt-0.5">
                      {item.count} atletas ({item.pct.toLocaleString("pt-BR")}%)
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {chartData.map((entry) => (
                <Cell key={entry.pos} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
