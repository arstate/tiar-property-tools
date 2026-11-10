"use client";

import React, { useState } from "react";
import { KprInputState, KprCalculationResult, BankRate, PropertyPreset } from "@/types";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah, formatNumber, formatPercent, formatMicroDaily } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ProposalSlipDrawerProps {
  clientName: string;
  onClientNameChange: (name: string) => void;
  input: KprInputState;
  result: KprCalculationResult;
  selectedBank?: BankRate;
  activePreset?: PropertyPreset;
}

export function ProposalSlipDrawer({
  clientName,
  onClientNameChange,
  input,
  result,
  selectedBank,
  activePreset,
}: ProposalSlipDrawerProps) {
  const [clientPhone, setClientPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const microDaily = formatMicroDaily(result.netMonthlyInstallmentPromo);
  const todayStr = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const projectName = input.projectName || activePreset?.name || "Unit Pilihan";
  const developerName = input.developerName || "Developer Mitra Tiar Property";

  // Generate authentic 3-balloon human WhatsApp chat message (Persona Mbak Ningsih / Tiar Property)
  const generateWhatsAppMessage = () => {
    const bankName = selectedBank?.name || "Bank Rekanan";
    const cicilanStr = formatRupiah(result.netMonthlyInstallmentPromo);
    const harianStr = microDaily.formattedDaily;
    const hematStr = formatRupiah(result.totalDeveloperSavings);

    const bonusList = (input.customPerks && input.customPerks.length > 0)
      ? `\nBonus Tambahan:\n` + input.customPerks.map((p) => `• ${p}`).join("\n")
      : "";

    return `Halo kak ${clientName}, ini saya kirimkan rangkuman simulasi KPR resmi Tiar Property untuk ${projectName} yaa kak 🙏✨

Developer: ${developerName}
Harga Unit: ${formatRupiah(input.propertyPrice)}
Skema DP: ${input.isDpZero ? "DP 0% All-In (Cukup UTJ)" : formatRupiah(input.downPaymentAmount)}
Tenor KPR: ${input.tenorYears} Tahun
Bank Rekanan: ${bankName}
Suku Bunga Promo: ${formatPercent(input.fixedRatePercent)} (Fixed ${input.fixedDurationYears} Thn)

Angsuran Promo: ${cicilanStr} / bulan
(Hitungan ringannya cuma sekitar ${harianStr} per hari kak, setara 2 kopi kekinian aja) ☕🏠

Kabar baiknya kak, unit ini dapet subsidi developer senilai ${hematStr} kak.${bonusList}

Kira-kira mau saya temenin cek lokasinya hari Sabtu sore atau Minggu pagi kak ${clientName}? Biar saya siapkan unitnya dulu 😊`;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = clientPhone.replace(/[^\d]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    const textEncoded = encodeURIComponent(generateWhatsAppMessage());
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${textEncoded}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, "_blank");
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: The Printable Physical Slip (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Printable Card */}
        <div
          id="printable-slip"
          className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute -right-12 -bottom-12 pointer-events-none opacity-5 select-none text-slate-900">
            <IconifyIcon icon="solar:home-smile-bold" className="w-80 h-80" />
          </div>

          {/* Slip Header */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                <IconifyIcon icon="solar:home-smile-bold" className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  TIAR PROPERTY
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Surabaya & Sidoarjo · Partner Resmi Berbagai Developer Terpercaya
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full block mb-1">
                SLIP SIMULASI RESMI
              </span>
              <span className="text-xs text-slate-400 font-medium">{todayStr}</span>
            </div>
          </div>

          {/* Client & Unit Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Prospek</span>
              <span className="font-black text-slate-900">{clientName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Proyek</span>
              <span className="font-black text-slate-900">{projectName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Developer</span>
              <span className="font-bold text-slate-700 truncate block">
                {developerName}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Rekanan</span>
              <span className="font-bold text-emerald-700">{selectedBank?.alias || "BTN / BSI"}</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">Harga Transaksi Properti:</span>
              <span className="font-black text-slate-900 tabular-nums text-sm">
                {formatRupiah(input.propertyPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">Skema Uang Muka (DP):</span>
              <span className="font-extrabold text-emerald-700">
                {input.isDpZero ? "DP 0% All-In (Cukup Booking UTJ)" : formatRupiah(input.downPaymentAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">Plafon Pinjaman KPR:</span>
              <span className="font-black text-slate-900 tabular-nums">
                {formatRupiah(result.loanAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">Jangka Waktu Pinjaman:</span>
              <span className="font-bold text-slate-800">
                {input.tenorYears} Tahun ({input.tenorYears * 12} Bulan)
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">Suku Bunga Promo (Fixed):</span>
              <span className="font-bold text-slate-800">
                {formatPercent(input.fixedRatePercent)} (Fixed {input.fixedDurationYears} Tahun)
              </span>
            </div>
          </div>

          {/* Big Highlight Box: Angsuran Bersih */}
          <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                Angsuran Bersih Promo
              </span>
              <div className="text-3xl font-black text-emerald-700 tabular-nums">
                {formatRupiah(result.netMonthlyInstallmentPromo)}
                <span className="text-xs font-medium text-emerald-800"> / bulan</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 block mt-0.5">
                💡 {microDaily.phrase}
              </span>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Subsidi Developer</span>
              <span className="text-lg font-black text-amber-600 tabular-nums">
                {formatRupiah(result.totalDeveloperSavings)}
              </span>
              <span className="text-[10px] font-semibold text-slate-600 block">Hemat Langsung</span>
            </div>
          </div>

          {/* Included Developer Perks list */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-800 block mb-1">
              Fasilitas, Subsidi & Bonus Developer Termasuk:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              {input.hasFreeLegalAllIn && (
                <div className="flex items-center gap-1.5">
                  <IconifyIcon icon="solar:check-circle-bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free Biaya Pajak BPHTB, AJB, BBN & Notaris</span>
                </div>
              )}
              {input.hasDeveloperSubsidy && (
                <div className="flex items-center gap-1.5">
                  <IconifyIcon icon="solar:check-circle-bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subsidi Angsuran Rp {formatNumber(input.developerSubsidyPerMonth)}/bln ({input.developerSubsidyDurationMonths} Bln)</span>
                </div>
              )}
              {input.hasKprFeeSubsidy && (
                <div className="flex items-center gap-1.5">
                  <IconifyIcon icon="solar:check-circle-bold" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subsidi Biaya Akad KPR Bank ({formatRupiah(input.kprFeeSubsidyAmount)})</span>
                </div>
              )}
              {(input.customPerks || []).map((p, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <IconifyIcon icon="solar:check-circle-bold" className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slip Footer with Sales Contact */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <span className="font-bold text-slate-800 block">Kantor Konsultan Tiar Property:</span>
              <span>Surabaya & Sidoarjo · WhatsApp Hotline: +62 851-9659-8881</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-slate-400 italic block">
                Validitas simulasi mengikuti kuota subsidi promo developer yang berlaku.
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Print */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrintSlip}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <IconifyIcon icon="solar:printer-bold" className="w-5 h-5 text-emerald-400" />
            <span>Cetak Slip Penawaran / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: WhatsApp Message Sender (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                <IconifyIcon icon="solar:chat-round-dots-bold" className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Kirim Penawaran ke WhatsApp
              </h3>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Sekuen 3 Balon
            </span>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
              Nomor WhatsApp Prospek (Opsional)
            </label>
            <div className="relative flex items-center rounded-2xl bg-white border border-slate-200 px-3.5 py-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <span className="mr-2 text-sm font-bold text-slate-400 select-none">+62</span>
              <input
                type="tel"
                placeholder="81234567890"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none tabular-nums"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Bisa langsung klik tombol di bawah untuk membuka aplikasi WhatsApp.
            </p>
          </div>

          {/* Live Preview of WhatsApp Chat */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Preview Pesan WhatsApp:</span>
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold"
              >
                <IconifyIcon icon="solar:copy-linear" className="w-3.5 h-3.5" />
                <span>{copied ? "Tersalin!" : "Salin Pesan"}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {generateWhatsAppMessage()}
            </div>
          </div>

          {/* Direct Send WhatsApp Button */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <IconifyIcon icon="solar:plain-bold" className="w-5 h-5" />
            <span>Kirim Pesan ke WhatsApp Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
