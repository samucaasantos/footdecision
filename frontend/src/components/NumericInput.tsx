"use client";

import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface NumericInputProps {
  value: string | number;
  onChange: (newValue: string) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  title?: string;
}

export function NumericInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  placeholder,
  required = false,
  className = "",
  inputClassName = "",
  title,
}: NumericInputProps) {
  const handleStep = (direction: 1 | -1) => {
    const current = Number(value);
    const base = Number.isNaN(current) ? 0 : current;
    let next = base + direction * step;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    // Avoid floating point artifacts
    const rounded = Number.isInteger(step) ? Math.round(next) : Number(next.toFixed(2));
    onChange(String(rounded));
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-400">
          {prefix}
        </span>
      )}

      <input
        type="number"
        step="any"
        min={min}
        max={max}
        required={required}
        value={value}
        placeholder={placeholder}
        title={title}
        onChange={(e) => onChange(e.target.value)}
        className={`no-spinner w-full rounded-xl bg-[#091019] border border-slate-800 focus:border-emerald-500 focus:outline-none py-2.5 text-sm font-mono font-bold text-white transition-colors ${
          prefix ? "pl-8" : "pl-4"
        } ${suffix ? "pr-20" : "pr-10"} ${inputClassName}`}
      />

      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {suffix && (
          <span className="pointer-events-none text-[11px] font-mono text-slate-400 mr-0.5">
            {suffix}
          </span>
        )}
        <div className="flex flex-col rounded-lg bg-slate-900/90 border border-slate-700/80 overflow-hidden shadow-sm">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleStep(1)}
            className="px-1.5 py-0.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Aumentar valor"
          >
            <ChevronUp className="h-3 w-3 stroke-[2.5]" />
          </button>
          <div className="h-px bg-slate-800" />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleStep(-1)}
            className="px-1.5 py-0.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Diminuir valor"
          >
            <ChevronDown className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
