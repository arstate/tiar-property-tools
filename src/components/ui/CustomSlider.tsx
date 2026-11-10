"use client";

import React, { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  formatTooltip?: (val: number) => string;
  className?: string;
  ticks?: { value: number; label: string }[];
}

export function CustomSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatTooltip,
  className,
  ticks,
}: CustomSliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className={cn("relative select-none", className)}>
      {/* Slider Interactive Track Area */}
      <div className="relative w-full h-7 flex items-center">
        {/* Track Line Background */}
        <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          {/* Active track fill */}
          <div
            className="absolute top-0 left-0 h-full bg-emerald-600 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Custom Thumb dot - vertically centered at exact line midpoint */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-emerald-600 rounded-full shadow-sm pointer-events-none transition-all duration-75 flex items-center justify-center ring-4 ring-emerald-500/15 z-20"
          style={{ left: `${percentage}%` }}
        >
          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
        </div>

        {/* Standard Range Input for native drag & accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 appearance-none bg-transparent"
        />
      </div>

      {/* Optional Ticks below track container */}
      {ticks && ticks.length > 0 && (
        <div className="flex justify-between items-center mt-1 px-0.5">
          {ticks.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={cn(
                "text-[10px] font-semibold transition-colors",
                value === t.value ? "text-emerald-700 font-bold" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
