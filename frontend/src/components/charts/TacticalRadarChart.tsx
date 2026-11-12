"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Position, RadarAxisDTO } from "@/types/api";
import { getMetricInfo } from "@/utils/formatters";

interface TacticalRadarChartProps {
  metrics: RadarAxisDTO[];
  position: Position;
  playerName: string;
}

interface NormalizedRadarPoint {
  metricName: string;
  axisLabel: string;
  fullLabel: string;
  subtitle: string;
  unit: string;
  decimals: number;
  rawPlayer: number;
  rawCluster: number;
  playerNormalized: number;
  clusterNormalized: number;
  percentileTag: string;
}

export default function TacticalRadarChart({
  metrics,
  playerName,
}: TacticalRadarChartProps) {
  const radarData = useMemo<NormalizedRadarPoint[]>(() => {
    if (!metrics || metrics.length === 0) return [];

    return metrics.map((m) => {
      const info = getMetricInfo(m.metricName);
      const rawPlayer = Number(m.playerValue ?? 0);
      const rawCluster = Number(m.clusterAverageValue ?? 0);

      // Normalize to a 0-100 comparative scale where cluster benchmark is anchored at 65
      // so metrics of totally different scales (e.g., 0.12 xG vs 18.2 Progressive Passes)
      // render with balanced geometry on the radar polygon.
      let ratio = 1;
      if (rawCluster > 0) {
        ratio = info.invertBetter ? rawCluster / Math.max(rawPlayer, 0.01) : rawPlayer / rawCluster;
      } else if (rawPlayer > 0) {
        ratio = 1.25;
      }

      const playerNormalized = Math.round(Math.min(100, Math.max(15, ratio * 65)));
      const clusterNormalized = 65;
      const simulatedPercentile = Math.min(99, Math.max(12, Math.round(playerNormalized * 0.96)));

      return {
        metricName: m.metricName,
        axisLabel: info.radarLabel,
        fullLabel: info.label,
        subtitle: info.subtitle,
        unit: info.unit || "",
        decimals: info.decimals,
        rawPlayer,
        rawCluster,
        playerNormalized,
        clusterNormalized,
        percentileTag: `P${simulatedPercentile}`,
      };
    });
  }, [metrics]);

  if (radarData.length === 0) {
    return (
      <div className="h-[380px] flex items-center justify-center text-sm text-slate-400">
        Sem métricas táticas disponíveis para plotagem.
      </div>
    );
  }

  return (
    <div className="w-full h-[390px] sm:h-[430px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="axisLabel"
            tick={(props) => {
              const { x, y, payload, index } = props;
              const point = radarData[index];
              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={-4}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={11}
                    fontWeight={600}
                  >
                    {payload.value}
                  </text>
                  {point && (
                    <text
                      x={0}
                      y={11}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize={10}
                      fontFamily="monospace"
                      fontWeight={700}
                    >
                      {point.percentileTag}
                    </text>
                  )}
                </g>
              );
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={3}
            tick={{ fill: "#64748b", fontSize: 9 }}
            axisLine={false}
          />

          {/* Cluster Average Polygon (Dashed) */}
          <Radar
            name="Média do Cluster"
            dataKey="clusterNormalized"
            stroke="#94a3b8"
            strokeWidth={1.8}
            strokeDasharray="4 4"
            fill="#475569"
            fillOpacity={0.12}
          />

          {/* Player Polygon (Solid Emerald) */}
          <Radar
            name={playerName}
            dataKey="playerNormalized"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="#10b981"
            fillOpacity={0.28}
            dot={{ r: 3.5, fill: "#10b981", stroke: "#052e16", strokeWidth: 1.5 }}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const point = payload[0].payload as NormalizedRadarPoint;
              return (
                <div className="rounded-xl bg-[#09101A]/95 border border-emerald-500/40 p-3.5 shadow-2xl text-xs space-y-1.5">
                  <p className="font-bold text-white">{point.fullLabel}</p>
                  <p className="text-[11px] text-slate-400">{point.subtitle}</p>
                  <div className="pt-1 border-t border-slate-800 space-y-1 font-mono">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-emerald-400">Atleta:</span>
                      <span className="font-bold text-white">
                        {point.rawPlayer.toFixed(point.decimals)}
                        {point.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400">Média Cluster:</span>
                      <span className="text-slate-300">
                        {point.rawCluster.toFixed(point.decimals)}
                        {point.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
