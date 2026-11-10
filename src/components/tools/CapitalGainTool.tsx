"use client";

import React, { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah, formatNumber, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CapitalGainToolProps {
  initialPrice: number;
}

export function CapitalGainTool({ initialPrice }: CapitalGainToolProps) {
  const [holdingYears, setHoldingYears] = useState<number>(3);
  const [includeRsudSedati, setIncludeRsudSedati] = useState<boolean>(true);
  const [includeAlohaMerr, setIncludeAlohaMerr] = useState<boolean>(true);
  const [rentalYieldPercent, setRentalYieldPercent] = useState<number>(5.5);

  // Baseline appreciation: 10% per year
  // Catalyst RSUD Sedati 2027: +15% boost
  // Catalyst Aloha MERR: +8% boost
  const effectiveGrowthRate =
    10 + (includeRsudSedati ? 5 : 0) + (includeAlohaMerr ? 3 : 0);

  // Projection year by year
  const startYear = 2026;
  const yearlyProjections = [];
  let currentVal = initialPrice;

  for (let i = 1; i <= 5; i++) {
    const yr = startYear + i;
    // Extra catalyst jump at year 2027 (RSUD completion)
    const isCatalystYear = yr === 2027 && includeRsudSedati;
    const rateThisYear = isCatalystYear ? effectiveGrowthRate + 12 : effectiveGrowthRate;

    currentVal = Math.round(currentVal * (1 + rateThisYear / 100));
    const estimatedRentalIncome = Math.round((currentVal * rentalYieldPercent) / 100);

    yearlyProjections.push({
      year: yr,
      propertyValue: currentVal,
      capitalGainTotal: currentVal - initialPrice,
      growthPercentTotal: ((currentVal - initialPrice) / initialPrice) * 100,
      estimatedRentalIncome,
      isCatalystYear,
    });
  }

  const selectedProjection = yearlyProjections[Math.min(holdingYears - 1, yearlyProjections.length - 1)];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Infrastructure Catalysts & Config (6 Cols) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
              <IconifyIcon icon="solar:graph-up-bold" className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Katalis Pertumbuhan Surabaya - Sidoarjo
              </h3>
              <p className="text-xs text-slate-500">
                Faktor percepatan infrastruktur resmi yang mendorong lonjakan harga.
              </p>
            </div>
          </div>

          {/* Holding duration selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Target Durasi Simpan (Holding Period):
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setHoldingYears(yr)}
                    className={cn(
                      "text-xs font-bold px-3 py-1.5 rounded-xl transition-all",
                      holdingYears === yr
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {yr} Tahun ({startYear + yr})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Infrastructure Catalyst 1: RSUD Sedati 2027 */}
          <div
            onClick={() => setIncludeRsudSedati(!includeRsudSedati)}
            className={cn(
              "p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3",
              includeRsudSedati
                ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20"
                : "bg-slate-50 border-slate-200 opacity-60"
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Katalis 1: Pembangunan RSUD Sedati (2027)
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  BOOST +35%
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hanya 1 km dari lokasi Permata Kwangsan Tahap VI. Keberadaan RSUD umum memicu kebutuhan hunian & sewa dari tenaga medis.
              </p>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                includeRsudSedati ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-500"
              )}
            >
              <IconifyIcon icon="solar:check-read-linear" className="w-4 h-4" />
            </div>
          </div>

          {/* Infrastructure Catalyst 2: Flyover Aloha & Koridor OERR/MERR */}
          <div
            onClick={() => setIncludeAlohaMerr(!includeAlohaMerr)}
            className={cn(
              "p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3",
              includeAlohaMerr
                ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20"
                : "bg-slate-50 border-slate-200 opacity-60"
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Katalis 2: Flyover Aloha & Akses OERR/MERR
                </span>
                <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  KONEKSI CEPAT
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Memangkas kemacetan Sidoarjo-Surabaya menjadi hanya 10 menit ke Bandara Juanda dan kawasan bisnis Rungkut Surabaya.
              </p>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                includeAlohaMerr ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-500"
              )}
            >
              <IconifyIcon icon="solar:check-read-linear" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Capital Gain Outcome Telemetry (6 Cols) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Proyeksi Nilai di Tahun {startYear + holdingYears}
            </span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              +{selectedProjection.growthPercentTotal.toFixed(0)}% Kenaikan Nilai
            </span>
          </div>

          {/* Big Number Gain */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 block">
              Estimasi Nilai Properti Menjadi:
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {formatRupiah(selectedProjection.propertyValue)}
            </div>
            <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 pt-1">
              <IconifyIcon icon="solar:arrow-up-bold" className="w-4 h-4" />
              <span>Capital Gain Bersih: +{formatRupiah(selectedProjection.capitalGainTotal)}</span>
            </div>
          </div>

          {/* Passive Income / Rental Yield Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <IconifyIcon icon="solar:hand-money-bold" className="w-4 h-4 text-amber-600" />
                Potensi Pasif Income Sewa per Tahun
              </span>
              <span className="text-xs font-black text-amber-700 tabular-nums">
                ~{formatRupiah(selectedProjection.estimatedRentalIncome)} / thn
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Jika dijadikan investasi sewa untuk pegawai RSUD Sedati atau karyawan Bandara Juanda (Yield ~{rentalYieldPercent}%/tahun).
            </p>
          </div>

          {/* Year by Year Growth Milestones */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              Trajectory Kenaikan Nilai 2027 s/d 2031:
            </span>
            <div className="divide-y divide-slate-100">
              {yearlyProjections.map((p) => (
                <div key={p.year} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                      {p.year}
                    </span>
                    {p.isCatalystYear ? (
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ⚡ RSUD Sedati Resmi Beroperasi
                      </span>
                    ) : (
                      <span className="text-slate-600 font-medium">Apresiasi Organik</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 tabular-nums block">
                      {formatRupiah(p.propertyValue)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold tabular-nums">
                      +{formatRupiah(p.capitalGainTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
