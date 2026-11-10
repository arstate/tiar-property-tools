"use client";

import React, { useState } from "react";
import { KprInputState, KprCalculationResult, BankRate } from "@/types";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CustomSlider } from "@/components/ui/CustomSlider";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah, formatNumber, formatPercent, formatMicroDaily } from "@/lib/formatters";
import { calculateAnnuityMonthly, calculateFlatMonthly } from "@/lib/kprCalculations";
import { cn } from "@/lib/utils";

interface KprCalculatorToolProps {
  input: KprInputState;
  onChange: (newInput: KprInputState) => void;
  result: KprCalculationResult;
  selectedBank?: BankRate;
  onOpenBankModal: () => void;
  onNavigateToTool: (tool: any) => void;
}

export function KprCalculatorTool({
  input,
  onChange,
  result,
  selectedBank,
  onOpenBankModal,
  onNavigateToTool,
}: KprCalculatorToolProps) {
  const [newPerkText, setNewPerkText] = useState("");
  const microDaily = formatMicroDaily(result.netMonthlyInstallmentPromo);

  // Zero DP comparison calculation
  const zeroDpBase =
    input.calculationType === "flat"
      ? calculateFlatMonthly(input.propertyPrice, input.fixedRatePercent, input.tenorYears)
      : calculateAnnuityMonthly(input.propertyPrice, input.fixedRatePercent, input.tenorYears);
  const zeroDpNet = Math.max(0, zeroDpBase - (input.hasDeveloperSubsidy ? input.developerSubsidyPerMonth : 0));
  const dpMonthlySavings = Math.max(0, zeroDpNet - result.netMonthlyInstallmentPromo);

  const updateField = <K extends keyof KprInputState>(field: K, val: KprInputState[K]) => {
    onChange({ ...input, [field]: val });
  };

  const handleAddCustomPerk = () => {
    if (!newPerkText.trim()) return;
    const current = input.customPerks || [];
    onChange({
      ...input,
      customPerks: [...current, newPerkText.trim()],
    });
    setNewPerkText("");
  };

  const handleRemoveCustomPerk = (index: number) => {
    const current = input.customPerks || [];
    onChange({
      ...input,
      customPerks: current.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Interactive Parameter Inputs (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Harga Properti & Down Payment */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <IconifyIcon icon="solar:home-add-angle-bold" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Harga Rumah & Skema Uang Muka (DP)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ketik nominal atau geser slider sesuai harga unit.
                </p>
              </div>
            </div>

            {/* Quick Toggle DP 0% */}
            <button
              type="button"
              onClick={() => updateField("isDpZero", !input.isDpZero)}
              className={cn(
                "text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 shrink-0 active:scale-95 shadow-2xs",
                input.isDpZero
                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <IconifyIcon
                icon={input.isDpZero ? "solar:check-circle-bold" : "solar:circle-linear"}
                className="w-4 h-4"
              />
              <span>DP 0% Promo</span>
            </button>
          </div>

          {/* 1. Harga Properti */}
          <div className="space-y-2">
            <CurrencyInput
              label="Harga Properti"
              value={input.propertyPrice}
              onChange={(val) => updateField("propertyPrice", val)}
              min={50000000}
              max={3000000000}
              quickAddAmounts={[10000000, 25000000, 50000000, 100000000]}
            />
            <CustomSlider
              min={200000000}
              max={1500000000}
              step={10000000}
              value={input.propertyPrice}
              onChange={(val) => updateField("propertyPrice", val)}
              ticks={[
                { value: 435000000, label: "435 Jt" },
                { value: 650000000, label: "650 Jt" },
                { value: 850000000, label: "850 Jt" },
                { value: 1200000000, label: "1.2 M" },
              ]}
            />
          </div>

          {/* 2. Skema Uang Muka (DP) - Dual Mode Switcher */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilihan Skema Uang Muka (DP)
              </label>
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => onChange({ ...input, isDpZero: true })}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
                    input.isDpZero
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <IconifyIcon icon="solar:gift-bold" className="w-3.5 h-3.5" />
                  <span>DP 0% Promo</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ ...input, isDpZero: false })}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
                    !input.isDpZero
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <IconifyIcon icon="solar:wallet-money-bold" className="w-3.5 h-3.5" />
                  <span>DP Custom / DP Besar</span>
                </button>
              </div>
            </div>

            {/* If DP 0% Promo Mode */}
            {input.isDpZero ? (
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <IconifyIcon icon="solar:shield-check-bold" className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Skema Promo DP 0% (Bebas Biaya di Awal)
                    </h4>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      Konsumen cukup membayar UTJ tanda jadi unit langsung diproses KPR. Tanpa beban DP puluhan juta di awal!
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-white px-3 py-1 rounded-xl shadow-xs shrink-0 border border-emerald-200">
                  HEMAT 100%
                </span>
              </div>
            ) : (
              /* If DP Custom Mode (Full Manual Input + Quick Chips + Slider) */
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <CurrencyInput
                      label="Nominal DP yang Disiapkan"
                      value={input.downPaymentAmount || (input.propertyPrice * input.downPaymentPercent) / 100}
                      onChange={(val) => {
                        const percent = input.propertyPrice > 0 ? (val / input.propertyPrice) * 100 : 0;
                        onChange({
                          ...input,
                          downPaymentAmount: val,
                          downPaymentPercent: parseFloat(percent.toFixed(1)),
                        });
                      }}
                      max={input.propertyPrice}
                      quickAddAmounts={[10000000, 25000000, 50000000, 100000000]}
                    />
                  </div>

                  <div className="sm:col-span-5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Persentase DP
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="80"
                          step="0.5"
                          value={input.downPaymentPercent}
                          onChange={(e) => {
                            const pct = parseFloat(e.target.value) || 0;
                            const amt = (input.propertyPrice * pct) / 100;
                            onChange({
                              ...input,
                              downPaymentPercent: pct,
                              downPaymentAmount: amt,
                            });
                          }}
                          className="w-14 text-center text-xs font-black text-emerald-700 bg-white border border-slate-200 rounded-lg py-1 focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      {[10, 20, 30, 40].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            const amt = (input.propertyPrice * pct) / 100;
                            onChange({
                              ...input,
                              downPaymentPercent: pct,
                              downPaymentAmount: amt,
                            });
                          }}
                          className={cn(
                            "flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all text-center",
                            Math.round(input.downPaymentPercent) === pct
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <CustomSlider
                  min={0}
                  max={60}
                  step={1}
                  value={input.downPaymentPercent}
                  onChange={(pct) => {
                    const amt = (input.propertyPrice * pct) / 100;
                    onChange({
                      ...input,
                      downPaymentPercent: pct,
                      downPaymentAmount: amt,
                    });
                  }}
                  ticks={[
                    { value: 0, label: "0%" },
                    { value: 10, label: "10%" },
                    { value: 20, label: "20%" },
                    { value: 30, label: "30%" },
                    { value: 50, label: "50%" },
                  ]}
                />

                {/* Live Benefit Alert when DP > 0 */}
                {input.downPaymentAmount > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📉</span>
                      <span>
                        Plafon KPR turun jadi <strong>{formatRupiah(result.loanAmount)}</strong>. Cicilan bulanan otomatis jauh lebih ringan!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Plafon Pinjaman Info Bar */}
            <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-500">
              <span>Plafon Pinjaman KPR yang Diajukan:</span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {formatRupiah(result.loanAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Tenor & Suku Bunga Bank */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
                <IconifyIcon icon="solar:calendar-date-bold" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Tenor & Suku Bunga Bank
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih bank rekanan atau sesuaikan suku bunga KPR.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBankModal}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <IconifyIcon icon="solar:bank-linear" className="w-4 h-4" />
              <span>Ganti Bank</span>
            </button>
          </div>

          {/* Tenor Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Jangka Waktu (Tenor): {input.tenorYears} Tahun ({input.tenorYears * 12} Bulan)
              </label>
              <div className="flex gap-1">
                {[10, 15, 20, 25, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => updateField("tenorYears", yr)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors",
                      input.tenorYears === yr
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {yr} Th
                  </button>
                ))}
              </div>
            </div>
            <CustomSlider
              min={5}
              max={30}
              step={1}
              value={input.tenorYears}
              onChange={(val) => updateField("tenorYears", val)}
              ticks={[
                { value: 5, label: "5 Th" },
                { value: 10, label: "10 Th" },
                { value: 15, label: "15 Th" },
                { value: 20, label: "20 Th" },
                { value: 25, label: "25 Th" },
                { value: 30, label: "30 Th" },
              ]}
            />
          </div>

          {/* Interest Rates (Fixed Promo & Floating) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Promo Fixed Rate */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Suku Bunga Promo (Fixed)
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Durasi:</span>
                  <select
                    value={input.fixedDurationYears}
                    onChange={(e) => updateField("fixedDurationYears", parseInt(e.target.value, 10) || 1)}
                    className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border-none focus:outline-none"
                  >
                    {[1, 2, 3, 5, 10, 15, 20].map((y) => (
                      <option key={y} value={y}>{y} Thn</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  min="0"
                  max="20"
                  value={input.fixedRatePercent}
                  onChange={(e) => updateField("fixedRatePercent", parseFloat(e.target.value) || 0)}
                  className="w-full text-lg font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-600"
                />
                <span className="text-base font-bold text-slate-500">%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Suku bunga tetap di tahun-tahun awal promo.
              </p>
            </div>

            {/* Floating Rate */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Estimasi Suku Bunga Floating
                </span>
                <span className="text-xs font-bold text-slate-500">Pasca Promo</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="25"
                  value={input.floatingRatePercent}
                  onChange={(e) => updateField("floatingRatePercent", parseFloat(e.target.value) || 0)}
                  className="w-full text-lg font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-600"
                />
                <span className="text-base font-bold text-slate-500">%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bisa diisi 0% jika nasabah memilih KPR Syariah (Flat).
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Keuntungan Tambahan Developer */}
        <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white rounded-3xl p-6 border-2 border-amber-200/90 shadow-sm space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3.5 border-b border-amber-200/70">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/25">
              <IconifyIcon icon="solar:star-fall-bold" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950 leading-tight">
                Keuntungan Tambahan Developer
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Subsidi langsung dari developer yang mengurangi beban pengeluaran calon pembeli.
              </p>
            </div>
          </div>

          {/* 1. Subsidi Cicilan Angsuran */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
                  <IconifyIcon icon="solar:hand-money-bold" className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Subsidi Angsuran Cicilan Developer
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Potongan langsung per bulan dari developer untuk meringankan cicilan awal.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => updateField("hasDeveloperSubsidy", !input.hasDeveloperSubsidy)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 focus:outline-none",
                  input.hasDeveloperSubsidy ? "bg-amber-500" : "bg-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
                    input.hasDeveloperSubsidy ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Editable Fields if Active */}
            {input.hasDeveloperSubsidy && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 animate-fadeIn">
                <div className="sm:col-span-7">
                  <CurrencyInput
                    label="Nominal Subsidi per Bulan (Rp)"
                    value={input.developerSubsidyPerMonth}
                    onChange={(val) => updateField("developerSubsidyPerMonth", val)}
                    min={0}
                    max={10000000}
                    quickAddAmounts={[500000, 1000000, 1400000, 2000000]}
                  />
                </div>

                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                    Durasi Subsidi (Bulan)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[6, 12, 24].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateField("developerSubsidyDurationMonths", m)}
                        className={cn(
                          "w-11 py-2 text-xs font-bold rounded-xl transition-all text-center",
                          input.developerSubsidyDurationMonths === m
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="1"
                      max="60"
                      value={input.developerSubsidyDurationMonths}
                      onChange={(e) => updateField("developerSubsidyDurationMonths", parseInt(e.target.value, 10) || 1)}
                      className="w-16 text-center text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl py-2 focus:outline-none focus:border-amber-500"
                      title="Ketik durasi bulan"
                    />
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold block text-right">
                    Total: {formatRupiah(input.developerSubsidyPerMonth * input.developerSubsidyDurationMonths)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Free Biaya Legal All-In (BPHTB, AJB, BBN, Notaris) */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <IconifyIcon icon="solar:document-add-bold" className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Free Biaya Legal All-In (BPHTB, AJB, BBN & Notaris)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bebas pajak pembeli 5% dan pengurusan sertifikat balik nama SHM.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateField("hasFreeLegalAllIn", !input.hasFreeLegalAllIn)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 focus:outline-none",
                  input.hasFreeLegalAllIn ? "bg-amber-500" : "bg-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
                    input.hasFreeLegalAllIn ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {input.hasFreeLegalAllIn && (
              <div className="pt-2 border-t border-slate-100 animate-fadeIn">
                <CurrencyInput
                  label="Estimasi Nilai Penghematan Legal"
                  value={input.freeLegalAmount}
                  onChange={(val) => updateField("freeLegalAmount", val)}
                  min={0}
                  max={100000000}
                  quickAddAmounts={[15000000, 25000000, 35000000]}
                />
              </div>
            )}
          </div>

          {/* 3. Subsidi Biaya KPR (Bank Fees) */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-800 rounded-xl">
                  <IconifyIcon icon="solar:shield-check-bold" className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Subsidi Biaya Proses KPR (Provisi & Administrasi)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Bantuan pembebasan biaya akad kredit dari developer.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateField("hasKprFeeSubsidy", !input.hasKprFeeSubsidy)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 focus:outline-none",
                  input.hasKprFeeSubsidy ? "bg-amber-500" : "bg-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
                    input.hasKprFeeSubsidy ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {input.hasKprFeeSubsidy && (
              <div className="pt-2 border-t border-slate-100 animate-fadeIn">
                <CurrencyInput
                  label="Nominal Subsidi Biaya KPR (Rp)"
                  value={input.kprFeeSubsidyAmount}
                  onChange={(val) => updateField("kprFeeSubsidyAmount", val)}
                  min={0}
                  max={50000000}
                  quickAddAmounts={[5000000, 10000000, 15000000, 20000000]}
                />
              </div>
            )}
          </div>

          {/* 4. Bonus Hadiah Tambahan (Custom Perks Tag Builder) */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 text-purple-800 rounded-xl">
                  <IconifyIcon icon="solar:gift-bold" className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Bonus & Fasilitas Tambahan Unit (Bisa Tambah Bebas)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Misal: Free Canopy, Free AC 2 Unit, Smart Door Lock, Tandon, Cashback.
                  </p>
                </div>
              </div>
            </div>

            {/* List of Custom Perks */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(input.customPerks || []).map((perk, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold"
                >
                  <span>✓ {perk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomPerk(idx)}
                    className="text-amber-500 hover:text-rose-600 transition-colors"
                  >
                    <IconifyIcon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Perk Input Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newPerkText}
                onChange={(e) => setNewPerkText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomPerk()}
                autoCapitalize="sentences"
                enterKeyHint="done"
                placeholder="Ketik bonus custom (misal: Free AC 2 Unit) lalu Enter"
                className="flex-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomPerk}
                className="text-xs font-bold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all active:scale-95"
              >
                + Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Pitching Outcome Cards (5 Cols) */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
        {/* Main Hero Closing Card (Compact, Minimal & High-Impact) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-700/80 space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Simulasi Cicilan Resmi
              </span>
            </div>
            {selectedBank && (
              <span className="text-[11px] font-extrabold bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-300">
                {selectedBank.name}
              </span>
            )}
          </div>

          {/* Unit Name Info */}
          <div className="text-xs text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">Unit:</span>
            <strong className="text-white font-bold">{input.projectName || "Unit Pilihan"}</strong>
          </div>

          {/* Net Promo Installment */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              {input.hasDeveloperSubsidy ? "Angsuran Bersih Promo" : "Angsuran Promo"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-emerald-400 tracking-tight tabular-nums">
                {formatRupiah(result.netMonthlyInstallmentPromo)}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ bulan</span>
            </div>
            {input.hasDeveloperSubsidy && (
              <span className="text-[11px] text-slate-400 line-through block mt-0.5">
                Normal: {formatRupiah(result.baseMonthlyInstallmentPromo)}/bln
              </span>
            )}
          </div>

          {/* DP Impact Comparison Alert if DP Custom is active and > 0 */}
          {!input.isDpZero && input.downPaymentAmount > 0 && dpMonthlySavings > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
              <span className="font-medium">
                Hemat berkat DP {formatRupiah(input.downPaymentAmount)}:
              </span>
              <strong className="text-emerald-300 font-black tabular-nums">
                - {formatRupiah(dpMonthlySavings)} /bln
              </strong>
            </div>
          )}

          {/* Sleek 1-Line Micro-Installment Daily Reframing */}
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sm">☕</span>
              <span className="text-slate-300 font-medium truncate">
                Pecahan Harian: <strong className="text-amber-300 font-bold">{microDaily.formattedDaily}/hari</strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0">(Setara ngopi)</span>
          </div>

          {/* Floating Period Estimate & Total Savings */}
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-700/80">
            <div>
              <span className="text-[10px] text-slate-400 block">Cicilan Pasca Promo</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {formatRupiah(result.monthlyInstallmentFloating)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                (Floating ~{input.floatingRatePercent}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Total Subsidi Developer</span>
              <span className="text-sm font-bold text-amber-400 tabular-nums">
                {formatRupiah(result.totalDeveloperSavings)}
              </span>
              <span className="text-[9px] text-emerald-400 block mt-0.5">
                Hemat Langsung
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigateToTool("slip")}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <IconifyIcon icon="solar:document-text-bold" className="w-4 h-4" />
              <span>Buat Slip Penawaran & Kirim WhatsApp</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTool("whiteboard")}
                className="py-2 px-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <IconifyIcon icon="solar:pen-new-square-bold" className="w-3.5 h-3.5 text-emerald-300" />
                <span>Papan Coret</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTool("dbr")}
                className="py-2 px-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <IconifyIcon icon="solar:shield-check-bold" className="w-3.5 h-3.5 text-amber-300" />
                <span>Cek DBR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Amortization Milestone Snapshot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Proyeksi Cicilan per Milestone Tahun
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Tahun ke-N</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {result.amortizationBreakdown.slice(0, 5).map((item) => (
              <div key={item.year} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                    {item.year}
                  </span>
                  <span className={cn("font-medium", item.isPromo ? "text-emerald-700 font-bold" : "text-slate-600")}>
                    {item.isPromo ? "Tahun Promo" : "Tahun Berjalan"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 tabular-nums block">
                    {formatRupiah(item.monthlyInstallment)}/bln
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    Sisa Pokok: {formatRupiah(item.remainingLoan)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
