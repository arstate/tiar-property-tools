"use client";

import React, { useState } from "react";
import { KprInputState, KprCalculationResult, BankRate } from "@/types";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CustomSlider } from "@/components/ui/CustomSlider";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah, formatNumber, formatPercent, formatMicroDaily } from "@/lib/formatters";
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
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                <IconifyIcon icon="solar:home-add-angle-bold" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Harga Rumah & Skema Uang Muka (DP)
                </h3>
                <p className="text-xs text-slate-500">
                  Ketik manual atau geser slider sesuai penawaran unit developer.
                </p>
              </div>
            </div>

            {/* Quick Toggle DP 0% */}
            <button
              type="button"
              onClick={() => updateField("isDpZero", !input.isDpZero)}
              className={cn(
                "text-xs font-black px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95",
                input.isDpZero
                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30"
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
              label="Harga Properti (Ketik Bebas)"
              value={input.propertyPrice}
              onChange={(val) => updateField("propertyPrice", val)}
              min={50000000}
              max={3000000000}
              quickAddAmounts={[10000000, 25000000, 50000000, 100000000]}
              helperText="Satuan Rupiah"
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

          {/* 2. Uang Muka DP */}
          {!input.isDpZero ? (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CurrencyInput
                  label="Nominal DP (Rp)"
                  value={input.downPaymentAmount || (input.propertyPrice * input.downPaymentPercent) / 100}
                  onChange={(val) => {
                    const percent = input.propertyPrice > 0 ? (val / input.propertyPrice) * 100 : 0;
                    onChange({
                      ...input,
                      downPaymentAmount: val,
                      downPaymentPercent: parseFloat(percent.toFixed(2)),
                    });
                  }}
                  max={input.propertyPrice}
                />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                    Persentase DP: {input.downPaymentPercent}%
                  </label>
                  <CustomSlider
                    min={0}
                    max={50}
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
                      { value: 5, label: "5%" },
                      { value: 10, label: "10%" },
                      { value: 20, label: "20%" },
                      { value: 30, label: "30%" },
                    ]}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-600 text-white rounded-xl">
                  <IconifyIcon icon="solar:gift-bold" className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Skema Promo Developer: DP 0% All-In
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Konsumen bebas biaya uang muka di awal. Cukup bayar UTJ tanda jadi unit langsung diproses KPR.
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-xl shadow-xs">
                HEMAT 100%
              </span>
            </div>
          )}

          {/* Plafon Pinjaman Info Bar */}
          <div className="flex items-center justify-between pt-2 text-xs font-semibold text-slate-500">
            <span>Plafon Pinjaman KPR yang Diajukan:</span>
            <span className="text-sm font-black text-slate-900 tabular-nums">
              {formatRupiah(result.loanAmount)}
            </span>
          </div>
        </div>

        {/* Card 2: Tenor & Suku Bunga Bank */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-100 text-blue-700 rounded-2xl">
                <IconifyIcon icon="solar:calendar-date-bold" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tenor & Suku Bunga Bank
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih bank riil rekanan atau ubah suku bunga secara bebas manual.
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

        {/* Card 3: FULL CUSTOM SUBSIDI & PROMO DEVELOPER (Multi-Developer Ready) */}
        <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white rounded-3xl p-6 border-2 border-amber-200/90 shadow-sm space-y-5">
          {/* Header & Developer Info */}
          <div className="space-y-3 pb-3 border-b border-amber-200/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500 text-white rounded-2xl shadow-sm">
                  <IconifyIcon icon="solar:star-fall-bold" className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-amber-950">
                    Keuntungan & Subsidi Promo Developer
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    100% Full Custom untuk berbagai developer mitra yang Anda pasarkan.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Multi-Developer
              </span>
            </div>

            {/* Custom Developer Name & Project Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Nama Developer Mitra (Ketik Bebas)
                </label>
                <input
                  type="text"
                  value={input.developerName}
                  onChange={(e) => updateField("developerName", e.target.value)}
                  placeholder="Misal: PT. Trimitra / Citra Harmoni / Safira"
                  className="w-full text-xs font-bold text-slate-900 bg-white border border-amber-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Nama Proyek / Cluster Unit
                </label>
                <input
                  type="text"
                  value={input.projectName}
                  onChange={(e) => updateField("projectName", e.target.value)}
                  placeholder="Misal: Permata Kwangsan Tahap VI / The Oso Waru"
                  className="w-full text-xs font-bold text-slate-900 bg-white border border-amber-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 1. Custom Subsidi Cicilan Angsuran */}
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
                  "w-12 h-6 rounded-full transition-colors relative shrink-0",
                  input.hasDeveloperSubsidy ? "bg-amber-500" : "bg-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5",
                    input.hasDeveloperSubsidy ? "left-6.5" : "left-0.5"
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
                          "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                          input.developerSubsidyDurationMonths === m
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {m} Bln
                      </button>
                    ))}
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={input.developerSubsidyDurationMonths}
                      onChange={(e) => updateField("developerSubsidyDurationMonths", parseInt(e.target.value, 10) || 1)}
                      className="w-16 text-center text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl py-2 focus:outline-none focus:border-amber-500"
                      title="Ketik durasi bulan custom"
                    />
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold block text-right">
                    Total: {formatRupiah(input.developerSubsidyPerMonth * input.developerSubsidyDurationMonths)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Custom Free Legal All-In (BPHTB, AJB, BBN, Notaris) */}
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
                  "w-12 h-6 rounded-full transition-colors relative shrink-0",
                  input.hasFreeLegalAllIn ? "bg-amber-500" : "bg-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5",
                    input.hasFreeLegalAllIn ? "left-6.5" : "left-0.5"
                  )}
                />
              </button>
            </div>

            {input.hasFreeLegalAllIn && (
              <div className="pt-2 border-t border-slate-100 animate-fadeIn">
                <CurrencyInput
                  label="Estimasi Nilai Penghematan Legal (Ketik Bebas)"
                  value={input.freeLegalAmount}
                  onChange={(val) => updateField("freeLegalAmount", val)}
                  min={0}
                  max={100000000}
                  quickAddAmounts={[15000000, 25000000, 35000000]}
                  helperText="Nilai Penghematan Nyata"
                />
              </div>
            )}
          </div>

          {/* 3. Custom Subsidi Biaya KPR (Bank Fees) */}
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
                  "w-12 h-6 rounded-full transition-colors relative shrink-0",
                  input.hasKprFeeSubsidy ? "bg-amber-500" : "bg-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5",
                    input.hasKprFeeSubsidy ? "left-6.5" : "left-0.5"
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
        {/* Main Hero Closing Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-700 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
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

          {/* Project & Developer Label */}
          <div className="text-xs text-slate-400">
            <span>Properti: </span>
            <strong className="text-white font-bold">{input.projectName || "Unit Pilihan"}</strong>
            {input.developerName && (
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Developer: {input.developerName}
              </span>
            )}
          </div>

          {/* Net Promo Installment */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">
              {input.hasDeveloperSubsidy ? "Angsuran Bersih Promo (Setelah Subsidi Developer)" : "Angsuran Promo per Bulan"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight tabular-nums">
                {formatRupiah(result.netMonthlyInstallmentPromo)}
              </span>
              <span className="text-sm font-semibold text-slate-300">/ bulan</span>
            </div>
            {input.hasDeveloperSubsidy && (
              <span className="text-xs text-slate-400 line-through">
                Harga Normal: {formatRupiah(result.baseMonthlyInstallmentPromo)}/bln
              </span>
            )}
          </div>

          {/* Micro-Installment Daily Reframing Badge (Anti-Price Shock) */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <IconifyIcon icon="fluent-emoji:hot-beverage" className="w-4 h-4" />
              <span>Pecahan Harian Ringan</span>
            </div>
            <div className="text-xl font-black text-white tabular-nums">
              Cuma {microDaily.formattedDaily} <span className="text-xs font-normal text-slate-300">/ hari</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              💡 {microDaily.phrase}. Uang jajan harian langsung berubah jadi aset rumah SHM milik sendiri!
            </p>
          </div>

          {/* Floating Period Estimate & Total Savings */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/80">
            <div>
              <span className="text-[11px] text-slate-400 block">Cicilan Pasca Promo</span>
              <span className="text-base font-bold text-white tabular-nums">
                {formatRupiah(result.monthlyInstallmentFloating)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                (Floating ~{input.floatingRatePercent}%)
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Total Subsidi Developer</span>
              <span className="text-base font-bold text-amber-400 tabular-nums">
                {formatRupiah(result.totalDeveloperSavings)}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                Hemat Langsung
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToTool("slip")}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <IconifyIcon icon="solar:document-text-bold" className="w-5 h-5" />
              <span>Buat Slip Penawaran & Kirim WhatsApp</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTool("whiteboard")}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <IconifyIcon icon="solar:pen-new-square-bold" className="w-4 h-4 text-emerald-300" />
                <span>Papan Coret-Coret</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTool("dbr")}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <IconifyIcon icon="solar:shield-check-bold" className="w-4 h-4 text-amber-300" />
                <span>Cek Gaji & DBR</span>
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
