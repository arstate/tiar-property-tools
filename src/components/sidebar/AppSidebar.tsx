"use client";

import React, { useState } from "react";
import { ToolMode, PropertyPreset, BankRate } from "@/types";
import { PROPERTY_PRESETS } from "@/data/propertyPresets";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  activePresetId: string;
  onSelectPreset: (preset: PropertyPreset) => void;
  clientName: string;
  onClientNameChange: (name: string) => void;
  selectedBank?: BankRate;
  onOpenBankModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  activeTool,
  onSelectTool,
  activePresetId,
  onSelectPreset,
  clientName,
  onClientNameChange,
  selectedBank,
  onOpenBankModal,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(clientName);

  const handleNameSave = () => {
    onClientNameChange(tempName.trim() || "Bapak / Ibu Pembeli");
    setIsEditingName(false);
  };

  const navTools: { id: ToolMode; label: string; icon: string; badge?: string; desc: string }[] = [
    {
      id: "kpr",
      label: "Kalkulator KPR",
      icon: "solar:calculator-bold",
      badge: "HERO",
      desc: "Simulasi cicilan & subsidi promo",
    },
    {
      id: "whiteboard",
      label: "Papan Coret-Coret",
      icon: "solar:pen-new-square-bold",
      desc: "Sketsa kavling & denah interaktif",
    },
    {
      id: "dbr",
      label: "Cek Kelayakan DBR",
      icon: "solar:shield-check-bold",
      badge: "40%",
      desc: "Verifikasi slip gaji & joint income",
    },
    {
      id: "rent-vs-buy",
      label: "Ngontrak vs Beli",
      icon: "solar:chart-2-bold",
      desc: "Komparasi uang hangus sewa",
    },
    {
      id: "capital-gain",
      label: "Capital Gain 2027",
      icon: "solar:graph-up-bold",
      desc: "Katalis RSUD Sedati & Aloha",
    },
    {
      id: "slip",
      label: "Slip & Kirim WA",
      icon: "solar:document-text-bold",
      desc: "Format closing 3-balon resmi",
    },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-white border-r border-slate-200/90 shadow-sm flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none",
        isCollapsed ? "w-20" : "w-72 sm:w-80"
      )}
    >
      {/* 1. TOP SECTION: Brand Header & Client Prospect */}
      <div className={cn("border-b border-slate-100", isCollapsed ? "p-3 flex items-center justify-center" : "p-4 sm:p-5 space-y-4")}>
        {/* Brand & Collapse Toggle */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
            title="Buka Sidebar"
          >
            <IconifyIcon
              icon="solar:sidebar-minimalistic-outline"
              className="w-5 h-5"
            />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <IconifyIcon icon="solar:home-smile-bold" className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight text-slate-900 truncate">
                    TIAR PROPERTY
                  </h1>
                </div>
                <p className="text-[11px] font-semibold text-emerald-700">
                  Surabaya & Sidoarjo
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Perkecil Sidebar"
            >
              <IconifyIcon
                icon="solar:sidebar-minimalistic-bold"
                className="w-5 h-5"
              />
            </button>
          </div>
        )}

        {/* Client Name Editor Box */}
        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <IconifyIcon icon="solar:user-bold" className="w-3.5 h-3.5 text-emerald-600" />
                Nama Klien
              </span>
              <span className="text-[10px] text-emerald-600 font-extrabold">LIVE</span>
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-1 pt-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                  autoFocus
                  autoCapitalize="words"
                  autoComplete="name"
                  enterKeyHint="done"
                  className="w-full text-xs font-bold text-slate-900 bg-white border border-emerald-500 rounded-lg px-2 py-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleNameSave}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-emerald-100 rounded-lg"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempName(clientName);
                  setIsEditingName(true);
                }}
                className="w-full text-left text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors flex items-center justify-between group pt-0.5"
              >
                <span className="truncate">{clientName}</span>
                <IconifyIcon
                  icon="solar:pen-linear"
                  className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0"
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. MIDDLE SECTION: Vertical Tools Navigation & Presets (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-6 no-scrollbar">
        {/* Navigation Tools Menu */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Menu Pitching Tools
            </span>
          )}

          {navTools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id)}
                className={cn(
                  "w-full text-left rounded-2xl transition-all duration-150 flex items-center active:scale-[0.98]",
                  isCollapsed ? "w-11 h-11 mx-auto justify-center p-0" : "px-3.5 py-3 gap-3",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
                title={tool.label}
              >
                {isCollapsed ? (
                  <IconifyIcon icon={tool.icon} className="w-5 h-5 shrink-0" />
                ) : (
                  <>
                    <div
                      className={cn(
                        "p-2 rounded-xl shrink-0 transition-colors",
                        isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"
                      )}
                    >
                      <IconifyIcon icon={tool.icon} className="w-5 h-5" />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{tool.label}</span>
                        {tool.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider shrink-0",
                              isActive ? "bg-amber-400 text-slate-950" : "bg-emerald-100 text-emerald-800"
                            )}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-[10px] truncate mt-0.5",
                          isActive ? "text-emerald-100" : "text-slate-400"
                        )}
                      >
                        {tool.desc}
                      </p>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Unit Preset Quick Switcher */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 block">
              Pilihan Unit Proyek
            </span>

            <div className="space-y-1.5">
              {PROPERTY_PRESETS.map((p) => {
                const isSelected = activePresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPreset(p)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl border transition-all active:scale-[0.98]",
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold truncate">{p.name}</span>
                      {p.price > 0 && (
                        <span
                          className={cn(
                            "text-[10px] font-extrabold px-2 py-0.5 rounded-full",
                            isSelected
                              ? "bg-emerald-500 text-white"
                              : "bg-emerald-100 text-emerald-800"
                          )}
                        >
                          {p.id === "the-oso-waru" ? "Rp 650 Jt" : p.id === "kwangsan-tahap-6" ? "Rp 435 Jt" : "Custom"}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-[10px] truncate",
                        isSelected ? "text-slate-300" : "text-slate-500"
                      )}
                    >
                      {p.cluster}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM SECTION: Bank Selector & Quick Helpline */}
      <div className={cn("border-t border-slate-100 bg-slate-50/70", isCollapsed ? "p-3 flex flex-col items-center" : "p-3 sm:p-4 space-y-2")}>
        {/* Bank Selection Trigger */}
        <button
          type="button"
          onClick={onOpenBankModal}
          className={cn(
            "rounded-2xl transition-all flex items-center active:scale-95",
            isCollapsed
              ? "w-11 h-11 justify-center p-0 text-blue-700 hover:text-blue-800 hover:bg-blue-50/80"
              : "w-full p-2.5 justify-between border border-slate-200 bg-white hover:bg-slate-50 shadow-xs"
          )}
          title="Pilih Bank KPR Riil"
        >
          {isCollapsed ? (
            <IconifyIcon icon="solar:bank-bold" className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="p-1.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                  <IconifyIcon icon="solar:bank-bold" className="w-4 h-4" />
                </span>
                <div className="text-left overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Rate Bank KPR
                  </span>
                  <span className="text-xs font-black text-slate-900 truncate block">
                    {selectedBank?.name || "Pilih Bank Riil"}
                  </span>
                </div>
              </div>
              <IconifyIcon icon="solar:alt-arrow-right-linear" className="w-4 h-4 text-slate-400 shrink-0" />
            </>
          )}
        </button>

        {/* WhatsApp Consultation Contact */}
        {!isCollapsed && (
          <div className="px-2 pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold">Hotline CS WhatsApp:</span>
            <a
              href="https://wa.me/6285196598881"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-black hover:underline"
            >
              +62 851-9659-8881
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
