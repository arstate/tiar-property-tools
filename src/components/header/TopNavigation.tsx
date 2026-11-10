"use client";

import React, { useState } from "react";
import { ToolMode, PropertyPreset } from "@/types";
import { PROPERTY_PRESETS } from "@/data/propertyPresets";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  activePresetId: string;
  onSelectPreset: (preset: PropertyPreset) => void;
  clientName: string;
  onClientNameChange: (name: string) => void;
  onOpenBankModal: () => void;
  selectedBankName?: string;
}

export function TopNavigation({
  activeTool,
  onSelectTool,
  activePresetId,
  onSelectPreset,
  clientName,
  onClientNameChange,
  onOpenBankModal,
  selectedBankName,
}: TopNavigationProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(clientName);

  const handleNameSave = () => {
    onClientNameChange(tempName.trim() || "Calon Pembeli Prospek");
    setIsEditingName(false);
  };

  const navTools: { id: ToolMode; label: string; icon: string; badge?: string }[] = [
    { id: "kpr", label: "Kalkulator KPR", icon: "solar:calculator-bold", badge: "Hero" },
    { id: "whiteboard", label: "Papan Coret-Coret", icon: "solar:pen-new-square-bold" },
    { id: "dbr", label: "Cek Kelayakan DBR", icon: "solar:shield-check-bold" },
    { id: "rent-vs-buy", label: "Ngontrak vs Beli", icon: "solar:chart-2-bold" },
    { id: "capital-gain", label: "Capital Gain 2027", icon: "solar:graph-up-bold" },
    { id: "slip", label: "Slip & Kirim WA", icon: "solar:document-text-bold" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner Bar: Brand Identity & Client Prospect Name */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <IconifyIcon icon="solar:home-smile-bold" className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900">
                TIAR PROPERTY
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pitching Suite
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Surabaya & Sidoarjo (Kwangsan · The Oso Waru MERR)
            </p>
          </div>
        </div>

        {/* Center: Live Client Name Tag */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl">
          <IconifyIcon icon="solar:user-bold" className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-400">Klien:</span>
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                autoFocus
                autoCapitalize="words"
                autoComplete="name"
                enterKeyHint="done"
                className="text-xs font-bold text-slate-900 bg-white border border-emerald-500 rounded-lg px-2 py-0.5 focus:outline-none w-36"
              />
              <button
                type="button"
                onClick={handleNameSave}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-1.5 py-0.5"
              >
                Simpan
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempName(clientName);
                setIsEditingName(true);
              }}
              className="text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-1 group"
              title="Klik untuk ubah nama prospek"
            >
              <span>{clientName}</span>
              <IconifyIcon
                icon="solar:pen-linear"
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600"
              />
            </button>
          )}
        </div>

        {/* Right: Bank Rate Selector Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBankModal}
            className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <IconifyIcon icon="solar:bank-linear" className="w-4 h-4 text-emerald-600" />
            <span>Bank:</span>
            <span className="text-emerald-700 font-extrabold underline decoration-emerald-400">
              {selectedBankName || "Pilih Rate Riil"}
            </span>
          </button>
        </div>
      </div>

      {/* Preset Bar & Main Tool Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Unit Preset Quick Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <IconifyIcon icon="solar:tag-price-bold" className="w-3.5 h-3.5" />
            Preset:
          </span>
          {PROPERTY_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPreset(p)}
                className={cn(
                  "text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-1.5",
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <span>{p.name}</span>
                {p.price > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-md font-extrabold",
                      isSelected ? "bg-emerald-500 text-white" : "text-emerald-700 bg-emerald-100/80"
                    )}
                  >
                    {p.id === "the-oso-waru" ? "650 Jt" : p.id === "kwangsan-tahap-6" ? "435 Jt" : "Custom"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 6 Main Tools Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {navTools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id)}
                className={cn(
                  "relative text-xs font-bold px-3.5 py-2 rounded-2xl transition-all duration-150 flex items-center gap-2 shrink-0 active:scale-95",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <IconifyIcon icon={tool.icon} className="w-4 h-4 shrink-0" />
                <span>{tool.label}</span>
                {tool.badge && (
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider",
                      isActive
                        ? "bg-amber-400 text-slate-900 font-extrabold"
                        : "bg-emerald-100 text-emerald-800"
                    )}
                  >
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
