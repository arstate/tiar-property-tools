"use client";

import React, { useState } from "react";
import { DbrInputState } from "@/types";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface JointIncomeDbrToolProps {
  input: DbrInputState;
  onChange: (newInput: DbrInputState) => void;
  targetKprInstallment: number;
}

export function JointIncomeDbrTool({
  input,
  onChange,
  targetKprInstallment,
}: JointIncomeDbrToolProps) {
  const [newDebtName, setNewDebtName] = useState("");
  const [newDebtAmount, setNewDebtAmount] = useState(0);

  const totalIncome = input.applicantIncome + (input.includeSpouse ? input.spouseIncome : 0);
  const totalExistingDebts = input.activeInstallments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDebtCommitment = totalExistingDebts + targetKprInstallment;

  // DBR = Total Cicilan / Total Income * 100
  const dbrPercent = totalIncome > 0 ? (totalDebtCommitment / totalIncome) * 100 : 0;
  const maxSafeInstallmentBank = totalIncome * 0.40 - totalExistingDebts;

  const getDbrStatus = () => {
    if (totalIncome === 0) return { label: "Data Belum Lengkap", color: "slate", level: 0 };
    if (dbrPercent <= 35) {
      return {
        label: "SANGAT AMAN (APPROVED)",
        color: "emerald",
        desc: "Peluang lolos di 5 Bank Rekanan (BTN, Mandiri, BSI, BRI, BNI) mencapai 95%+.",
        level: 1,
      };
    }
    if (dbrPercent <= 40) {
      return {
        label: "BATAS MAKSIMAL ANALIS (BISA LOLOS)",
        color: "amber",
        desc: "Rasio masih di bawah batas 40% OJK. Analis bank menyetujui dengan melampirkan rekening koran aktif.",
        level: 2,
      };
    }
    return {
      label: "OVER-LEVERAGE (> 40%)",
      color: "rose",
      desc: "Rasio melebihi batas regulasi 40%. Solusi: Aktifkan Joint Income istri atau lunasi cicilan berjalan yang kecil.",
      level: 3,
    };
  };

  const status = getDbrStatus();

  const handleAddDebt = () => {
    if (!newDebtName || newDebtAmount <= 0) return;
    onChange({
      ...input,
      activeInstallments: [
        ...input.activeInstallments,
        { id: Date.now().toString(), name: newDebtName, amount: newDebtAmount },
      ],
    });
    setNewDebtName("");
    setNewDebtAmount(0);
  };

  const handleRemoveDebt = (id: string) => {
    onChange({
      ...input,
      activeInstallments: input.activeInstallments.filter((d) => d.id !== id),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Incomes & Existing Debts (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Income Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                <IconifyIcon icon="solar:wallet-money-bold" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Penghasilan Bersih Bulanan
                </h3>
                <p className="text-xs text-slate-500">
                  Gaji pokok + tunjangan tetap (Take Home Pay).
                </p>
              </div>
            </div>

            {/* Toggle Joint Income */}
            <button
              type="button"
              onClick={() => onChange({ ...input, includeSpouse: !input.includeSpouse })}
              className={cn(
                "text-xs font-black px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95",
                input.includeSpouse
                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <IconifyIcon
                icon={input.includeSpouse ? "solar:check-circle-bold" : "solar:users-group-two-rounded-linear"}
                className="w-4 h-4"
              />
              <span>+ Joint Income Istri</span>
            </button>
          </div>

          <div className="space-y-4">
            <CurrencyInput
              label="Penghasilan Pemohon Utama (Suami)"
              value={input.applicantIncome}
              onChange={(val) => onChange({ ...input, applicantIncome: val })}
              quickAddAmounts={[1000000, 2000000, 5000000]}
              helperText="THP per Bulan"
            />

            {input.includeSpouse && (
              <div className="pt-3 border-t border-slate-100 animate-fadeIn">
                <CurrencyInput
                  label="Penghasilan Pasangan (Istri)"
                  value={input.spouseIncome}
                  onChange={(val) => onChange({ ...input, spouseIncome: val })}
                  quickAddAmounts={[1000000, 2000000, 5000000]}
                  helperText="Penambah Plafon KPR"
                />
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total Joint Income Terhitung:</span>
              <span className="text-base font-black text-slate-900 tabular-nums">
                {formatRupiah(totalIncome)} / bulan
              </span>
            </div>
          </div>
        </div>

        {/* Existing Active Debts Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-rose-100 text-rose-700 rounded-2xl">
                <IconifyIcon icon="solar:card-2-bold" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cicilan Berjalan Aktif Saat Ini
                </h3>
                <p className="text-xs text-slate-500">
                  Cicilan motor, mobil, kartu kredit, paylater, atau pinjaman bank lain.
                </p>
              </div>
            </div>
          </div>

          {/* List of current debts */}
          <div className="space-y-2">
            {input.activeInstallments.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
                <p className="text-xs font-semibold text-emerald-800">
                  🎉 Klien tidak memiliki cicilan berjalan (SLIK OJK Bersih). Peluang persetujuan KPR maksimal!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {input.activeInstallments.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{debt.name}</span>
                      <span className="text-xs font-black text-rose-600 tabular-nums">
                        {formatRupiah(debt.amount)} / bln
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDebt(debt.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <IconifyIcon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new debt form */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Cicilan
                </label>
                <input
                  type="text"
                  placeholder="Misal: Cicilan Motor Vario"
                  value={newDebtName}
                  onChange={(e) => setNewDebtName(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nominal per Bulan
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newDebtAmount || ""}
                  onChange={(e) => setNewDebtAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 tabular-nums"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddDebt}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  + Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DBR Speedometer & Verdict Card (5 Cols) */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hasil Analisis DBR (SLIK OJK)
            </span>
            <span
              className={cn(
                "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full",
                status.level === 1 && "bg-emerald-100 text-emerald-800",
                status.level === 2 && "bg-amber-100 text-amber-800",
                status.level === 3 && "bg-rose-100 text-rose-800"
              )}
            >
              Maks 40% OJK
            </span>
          </div>

          {/* DBR Percentage Meter Gauge */}
          <div className="text-center py-2 space-y-2">
            <div className="relative inline-flex items-center justify-center">
              <span
                className={cn(
                  "text-5xl font-black tracking-tight tabular-nums",
                  status.level === 1 && "text-emerald-600",
                  status.level === 2 && "text-amber-600",
                  status.level === 3 && "text-rose-600"
                )}
              >
                {dbrPercent.toFixed(1)}%
              </span>
            </div>
            <h4
              className={cn(
                "text-sm font-black uppercase tracking-wider",
                status.level === 1 && "text-emerald-700",
                status.level === 2 && "text-amber-700",
                status.level === 3 && "text-rose-700"
              )}
            >
              {status.label}
            </h4>
            <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
              {status.desc}
            </p>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  status.level === 1 && "bg-emerald-500",
                  status.level === 2 && "bg-amber-500",
                  status.level === 3 && "bg-rose-500"
                )}
                style={{ width: `${Math.min(100, dbrPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>0%</span>
              <span className="text-amber-600">35% Batas Aman</span>
              <span className="text-rose-600">40% Limit OJK</span>
            </div>
          </div>

          {/* Breakdown Telemetry */}
          <div className="divide-y divide-slate-100 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Angsuran KPR Diincar:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatRupiah(targetKprInstallment)}/bln
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Cicilan Berjalan Lain:</span>
              <span className="font-bold text-rose-600 tabular-nums">
                {formatRupiah(totalExistingDebts)}/bln
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Beban Angsuran:</span>
              <span className="font-black text-slate-900 tabular-nums">
                {formatRupiah(totalDebtCommitment)}/bln
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Plafon Angsuran Maksimal (40%):</span>
              <span className="font-black text-emerald-700 tabular-nums">
                {formatRupiah(Math.max(0, maxSafeInstallmentBank))}/bln
              </span>
            </div>
          </div>

          {/* Partner Bank Status Badges */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Kesiapan Pengajuan ke 5 Bank Rekanan:
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {["BTN", "BSI", "Mandiri", "BRI", "BNI"].map((b) => (
                <div
                  key={b}
                  className={cn(
                    "p-2 rounded-xl border text-[11px] font-black",
                    status.level === 1
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : status.level === 2
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  )}
                >
                  <span className="block">{b}</span>
                  <span className="text-[9px] font-semibold block mt-0.5">
                    {status.level === 1 ? "Siap ACC" : status.level === 2 ? "Review" : "Tertahan"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
