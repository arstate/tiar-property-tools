"use client";

import React, { useState } from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CustomSlider } from "@/components/ui/CustomSlider";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface RentVsBuyToolProps {
  propertyPrice: number;
  monthlyHouseInstallment: number;
}

export function RentVsBuyTool({
  propertyPrice,
  monthlyHouseInstallment,
}: RentVsBuyToolProps) {
  const [yearlyRent, setYearlyRent] = useState<number>(30000000); // 30 Juta / thn
  const [rentInflation, setRentInflation] = useState<number>(8); // 8% inflasi sewa / thn
  const [comparisonYears, setComparisonYears] = useState<number>(10); // 10 tahun
  const [propertyAppreciation, setPropertyAppreciation] = useState<number>(10); // 10% apresiasi / thn

  // Calculate cumulative rental cost over N years with inflation
  let totalRentPaid = 0;
  let currentRent = yearlyRent;
  for (let i = 0; i < comparisonYears; i++) {
    totalRentPaid += currentRent;
    currentRent *= 1 + rentInflation / 100;
  }
  totalRentPaid = Math.round(totalRentPaid);

  // Calculate cumulative mortgage installment paid over N years
  const totalMortgagePaid = monthlyHouseInstallment * 12 * comparisonYears;

  // Calculate projected house value after N years
  const projectedHouseValue = Math.round(
    propertyPrice * Math.pow(1 + propertyAppreciation / 100, comparisonYears)
  );

  // Net Wealth Delta: House Asset Value vs Wasted Rent Money
  const netWealthGain = projectedHouseValue - totalMortgagePaid;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Input Parameters (6 Cols) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <span className="p-2 bg-rose-100 text-rose-700 rounded-2xl">
              <IconifyIcon icon="solar:fire-bold" className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kalkulasi Biaya Sewa / Kontrakan Saat Ini
              </h3>
              <p className="text-xs text-slate-500">
                Berapa biaya yang dihabiskan klien jika menunda beli rumah?
              </p>
            </div>
          </div>

          <CurrencyInput
            label="Biaya Sewa Kontrakan per Tahun (Ketik Bebas)"
            value={yearlyRent}
            onChange={(val) => setYearlyRent(val)}
            min={10000000}
            max={100000000}
            quickAddAmounts={[5000000, 10000000]}
            helperText={`~${formatRupiah(Math.round(yearlyRent / 12))}/bln`}
          />

          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Durasi Perbandingan: {comparisonYears} Tahun
              </label>
              <div className="flex gap-1.5">
                {[5, 10, 15, 20].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setComparisonYears(yr)}
                    className={cn(
                      "text-xs font-bold px-3 py-1 rounded-xl transition-all",
                      comparisonYears === yr
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {yr} Tahun
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Asumsi Kenaikan Harga Sewa Kontrakan per Tahun:</span>
              <span className="text-rose-600 tabular-nums">{rentInflation}% / tahun</span>
            </div>
            <CustomSlider
              min={0}
              max={15}
              step={1}
              value={rentInflation}
              onChange={(val) => setRentInflation(val)}
              ticks={[
                { value: 5, label: "5%" },
                { value: 8, label: "8% Rata-rata" },
                { value: 12, label: "12% Tinggi" },
              ]}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Apresiasi Nilai Rumah Tiar Property per Tahun:</span>
              <span className="text-emerald-600 tabular-nums">{propertyAppreciation}% / tahun</span>
            </div>
            <CustomSlider
              min={5}
              max={20}
              step={1}
              value={propertyAppreciation}
              onChange={(val) => setPropertyAppreciation(val)}
              ticks={[
                { value: 8, label: "8% Wajar" },
                { value: 10, label: "10% Standar" },
                { value: 15, label: "15% Katalis RSUD" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The Financial Contrast Proof (6 Cols) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hasil Komparasi Finansial {comparisonYears} Tahun
            </span>
            <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Fakta Finansial Maut
            </span>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box A: Ngontrak (Merah) */}
            <div className="rounded-2xl p-5 bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <IconifyIcon icon="solar:close-circle-bold" className="w-4 h-4" />
                <span>Opsi 1: Tetap Ngontrak</span>
              </div>
              <div>
                <span className="text-xs text-rose-800/80 block">Total Uang Sewa Keluar:</span>
                <span className="text-2xl font-black text-rose-600 tabular-nums">
                  {formatRupiah(totalRentPaid)}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-rose-900/90 pt-2 border-t border-rose-200/80">
                <div className="flex justify-between">
                  <span>Status Uang:</span>
                  <span className="font-extrabold text-rose-700">100% Hangus</span>
                </div>
                <div className="flex justify-between">
                  <span>Nilai Aset Akhir:</span>
                  <span className="font-extrabold text-rose-700">Rp 0 (Nol)</span>
                </div>
                <div className="flex justify-between">
                  <span>Sertifikat SHM:</span>
                  <span className="font-extrabold text-rose-700">Milik Orang Lain</span>
                </div>
              </div>
            </div>

            {/* Box B: Beli di Tiar Property (Hijau) */}
            <div className="rounded-2xl p-5 bg-emerald-50/70 border border-emerald-300 space-y-3 ring-2 ring-emerald-500/10">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <IconifyIcon icon="solar:check-circle-bold" className="w-4 h-4" />
                <span>Opsi 2: Beli di Tiar Property</span>
              </div>
              <div>
                <span className="text-xs text-emerald-800/80 block">Nilai Properti Jadi:</span>
                <span className="text-2xl font-black text-emerald-600 tabular-nums">
                  {formatRupiah(projectedHouseValue)}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-emerald-950 pt-2 border-t border-emerald-200/80">
                <div className="flex justify-between">
                  <span>Status Uang:</span>
                  <span className="font-extrabold text-emerald-700">100% Jadi Ekuitas</span>
                </div>
                <div className="flex justify-between">
                  <span>Sertifikat Legalitas:</span>
                  <span className="font-extrabold text-emerald-700">SHM Atas Nama Pribadi</span>
                </div>
                <div className="flex justify-between">
                  <span>Keuntungan Aset:</span>
                  <span className="font-extrabold text-emerald-700">+{formatRupiah(projectedHouseValue - propertyPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Verdict Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <IconifyIcon icon="solar:shield-warning-bold" className="w-4 h-4" />
              <span>Kesimpulan Pitching ke Klien</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Jika klien menunda beli rumah selama {comparisonYears} tahun, klien membuang{" "}
              <strong className="text-rose-400 font-black">{formatRupiah(totalRentPaid)}</strong> uang sewa ke pemilik rumah lain tanpa memiliki sebutir debu pun dari aset tersebut.
              Sebaliknya, dengan cicilan yang sama di Tiar Property, klien kini memiliki aset berharga senilai{" "}
              <strong className="text-emerald-400 font-black">{formatRupiah(projectedHouseValue)}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
