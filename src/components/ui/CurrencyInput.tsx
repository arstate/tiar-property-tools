"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { formatNumber, parseRupiah } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  helperText?: string;
  quickAddAmounts?: number[]; // e.g. [10000000, 50000000]
}

export function CurrencyInput({
  label,
  value,
  onChange,
  prefix = "Rp",
  suffix,
  min = 0,
  max,
  step = 1000000,
  placeholder = "0",
  className,
  helperText,
  quickAddAmounts,
}: CurrencyInputProps) {
  // Local string state to allow natural typing without cursor jumping
  const [displayValue, setDisplayValue] = useState<string>(
    value ? formatNumber(value) : ""
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value ? formatNumber(value) : "");
    }
  }, [value, isFocused]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const parsed = parseRupiah(rawInput);

    // Update display with live dot formatting
    setDisplayValue(parsed ? formatNumber(parsed) : "");

    let finalVal = parsed;
    if (min !== undefined && finalVal < min) {
      // allow typing lower while editing, but send parsed
    }
    if (max !== undefined && finalVal > max) {
      finalVal = max;
    }

    onChange(finalVal);
  };

  const handleBlur = () => {
    setIsFocused(false);
    let finalVal = parseRupiah(displayValue);
    if (min !== undefined && finalVal < min) finalVal = min;
    if (max !== undefined && finalVal > max) finalVal = max;
    onChange(finalVal);
    setDisplayValue(finalVal ? formatNumber(finalVal) : "");
  };

  const handleQuickAdd = (addAmount: number) => {
    const newVal = Math.max(min, (value || 0) + addAmount);
    onChange(max ? Math.min(max, newVal) : newVal);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
        {helperText && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {helperText}
          </span>
        )}
      </div>

      <div
        className={cn(
          "relative flex items-center rounded-2xl bg-white border border-slate-200 px-3.5 py-2.5 transition-all duration-150 shadow-sm",
          isFocused ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md" : "hover:border-slate-300"
        )}
      >
        {prefix && (
          <span className="mr-2 text-sm font-bold text-slate-400 select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-transparent text-base md:text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none tabular-nums"
        />
        {suffix && (
          <span className="ml-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg select-none">
            {suffix}
          </span>
        )}
      </div>

      {quickAddAmounts && quickAddAmounts.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 select-none mr-1">Cepat:</span>
          {quickAddAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickAdd(amt)}
              className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 px-2.5 py-1 rounded-lg transition-transform whitespace-nowrap"
            >
              +{amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000} Rb`}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange(min)}
            className="text-[11px] font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors ml-auto"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
