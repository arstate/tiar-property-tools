"use client";

import React, { useState } from "react";
import { BankRate } from "@/types";
import { REAL_BANK_RATES } from "@/data/realBankRates";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface BankRateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBank: (bank: BankRate) => void;
  selectedBankId?: string;
}

export function BankRateSelectorModal({
  isOpen,
  onClose,
  onSelectBank,
  selectedBankId,
}: BankRateSelectorModalProps) {
  const [filterType, setFilterType] = useState<"all" | "conventional" | "syariah">("all");

  if (!isOpen) return null;

  const filteredBanks = REAL_BANK_RATES.filter((b) => {
    if (filterType === "conventional") return !b.isSyariah;
    if (filterType === "syariah") return b.isSyariah;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                <IconifyIcon icon="solar:bank-bold" className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Database Suku Bunga KPR Bank Riil
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Data terverifikasi perbankan Indonesia (BTN, Mandiri, BSI, BRI, BCA, BNI). Pilih bank untuk otomatis mengisi kalkulator.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <IconifyIcon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 bg-white">
          <span className="text-xs font-semibold text-slate-400 mr-1">Kategori:</span>
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full transition-all",
              filterType === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Semua Bank ({REAL_BANK_RATES.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("conventional")}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full transition-all",
              filterType === "conventional"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Konvensional (5)
          </button>
          <button
            type="button"
            onClick={() => setFilterType("syariah")}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full transition-all",
              filterType === "syariah"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            )}
          >
            Syariah (BSI Griya)
          </button>
        </div>

        {/* Bank List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBanks.map((bank) => {
              const isSelected = selectedBankId === bank.id;
              return (
                <div
                  key={bank.id}
                  className={cn(
                    "rounded-2xl p-4 border transition-all relative flex flex-col justify-between hover:shadow-md",
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  {/* Bank Top info */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0"
                          style={{ backgroundColor: bank.color }}
                        >
                          {bank.logoText}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {bank.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {bank.badge}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-emerald-600">
                          <IconifyIcon icon="solar:check-circle-bold" className="w-5 h-5" />
                        </span>
                      )}
                    </div>

                    {/* Interest Rate Metric Box */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {bank.isSyariah ? "Margin Setara" : `Promo Fixed (${bank.fixedYears} Thn)`}
                        </span>
                        <span className="text-base font-black text-emerald-700 tabular-nums">
                          {formatPercent(bank.fixedRate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {bank.isSyariah ? "Status Floating" : "Est. Floating"}
                        </span>
                        <span className="text-base font-black text-slate-700 tabular-nums">
                          {bank.isSyariah ? "0% (Flat Tetap)" : formatPercent(bank.floatingRate)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {bank.highlight}
                    </p>

                    <p className="text-[11px] text-slate-400 italic mt-2 border-t border-slate-100 pt-2">
                      💡 {bank.specialPromoNote}
                    </p>
                  </div>

                  {/* Action button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                      Sumber: {bank.alias}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBank(bank);
                        onClose();
                      }}
                      className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5",
                        isSelected
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      )}
                    >
                      <span>Terapkan Rate</span>
                      <IconifyIcon icon="solar:arrow-right-linear" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <IconifyIcon icon="solar:info-circle-linear" className="w-4 h-4 text-slate-400" />
            <span>
              Angka di atas adalah estimasi data pasar KPR 2025/2026. Anda tetap bisa mengubah nilai bunga secara manual di form.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
