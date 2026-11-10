"use client";

import React from "react";
import { ToolMode, PropertyPreset, BankRate } from "@/types";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah } from "@/lib/formatters";

interface CanvasHeaderProps {
  activeTool: ToolMode;
  activePreset?: PropertyPreset;
  selectedBank?: BankRate;
  onOpenBankModal: () => void;
  onQuickPrint: () => void;
  onToggleSidebarMobile: () => void;
}

export function CanvasHeader({
  activeTool,
  activePreset,
  selectedBank,
  onOpenBankModal,
  onQuickPrint,
  onToggleSidebarMobile,
}: CanvasHeaderProps) {
  const getToolTitle = () => {
    switch (activeTool) {
      case "kpr":
        return {
          title: "Kalkulator KPR & Subsidi Developer",
          desc: "Hitung cicilan promo, pecahan harian, dan total penghematan All-In",
          icon: "solar:calculator-bold",
        };
      case "whiteboard":
        return {
          title: "Papan Coret-Coret & Sketsa Unit",
          desc: "Kanvas interaktif untuk denah ruang, modifikasi, dan coretan kavling",
          icon: "solar:pen-new-square-bold",
        };
      case "dbr":
        return {
          title: "Cek Kelayakan Gaji & DBR 40% (SLIK OJK)",
          desc: "Validasi kemampuan angsuran nasabah dan kesiapan ACC 5 bank rekanan",
          icon: "solar:shield-check-bold",
        };
      case "rent-vs-buy":
        return {
          title: "Komparasi Finansial: Ngontrak vs Beli Rumah",
          desc: "Buka fakta kerugian uang sewa hangus vs kepemilikan aset SHM",
          icon: "solar:chart-2-bold",
        };
      case "capital-gain":
        return {
          title: "Proyeksi Capital Gain & Katalis Surabaya - Sidoarjo",
          desc: "Pertumbuhan nilai aset dengan katalis operasional RSUD Sedati 2027",
          icon: "solar:graph-up-bold",
        };
      case "slip":
        return {
          title: "Slip Penawaran Digital & 1-Klik Kirim WhatsApp",
          desc: "Generate format rekap penawaran resmi siap cetak dan chat WA 3-balon",
          icon: "solar:document-text-bold",
        };
    }
  };

  const meta = getToolTitle();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Active tool title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          type="button"
          onClick={onToggleSidebarMobile}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          <IconifyIcon icon="solar:hamburger-menu-linear" className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/70">
            <IconifyIcon icon={meta.icon} className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
              {meta.title}
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate">
              {meta.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Active Preset & Bank Quick Telemetry */}
      <div className="flex items-center gap-2.5 shrink-0">
        {activePreset && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-500">Unit:</span>
            <span className="font-bold text-slate-900">{activePreset.name}</span>
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {formatRupiah(activePreset.price)}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenBankModal}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
        >
          <IconifyIcon icon="solar:bank-linear" className="w-3.5 h-3.5 text-emerald-600" />
          <span>{selectedBank?.alias || "Bank BTN"}</span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md font-extrabold">
            {selectedBank?.fixedRate}%
          </span>
        </button>

        <button
          type="button"
          onClick={onQuickPrint}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Cetak Slip / Simpan PDF"
        >
          <IconifyIcon icon="solar:printer-linear" className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
