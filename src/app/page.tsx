"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolMode, PropertyPreset, KprInputState, DbrInputState, BankRate } from "@/types";
import { PROPERTY_PRESETS } from "@/data/propertyPresets";
import { REAL_BANK_RATES } from "@/data/realBankRates";
import { calculateKprSummary } from "@/lib/kprCalculations";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { CanvasHeader } from "@/components/header/CanvasHeader";
import { BankRateSelectorModal } from "@/components/bank/BankRateSelectorModal";
import { KprCalculatorTool } from "@/components/tools/KprCalculatorTool";
import { WhiteboardTool } from "@/components/tools/WhiteboardTool";
import { JointIncomeDbrTool } from "@/components/tools/JointIncomeDbrTool";
import { RentVsBuyTool } from "@/components/tools/RentVsBuyTool";
import { CapitalGainTool } from "@/components/tools/CapitalGainTool";
import { ProposalSlipDrawer } from "@/components/tools/ProposalSlipDrawer";

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolMode>("kpr");
  const [activePresetId, setActivePresetId] = useState<string>("kwangsan-tahap-6");
  const [clientName, setClientName] = useState<string>("Bapak / Ibu Pembeli");
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("btn-platinum");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Initial preset: Permata Kwangsan Tahap VI
  const defaultPreset = PROPERTY_PRESETS[0];

  // KPR Input State
  const [kprInput, setKprInput] = useState<KprInputState>({
    propertyPrice: defaultPreset.price,
    developerName: defaultPreset.developerName,
    projectName: defaultPreset.name,
    isDpZero: true,
    downPaymentPercent: 0,
    downPaymentAmount: 0,
    tenorYears: defaultPreset.tenorYears,
    fixedRatePercent: 3.75,
    fixedDurationYears: 3,
    floatingRatePercent: 13.5,
    hasDeveloperSubsidy: true,
    developerSubsidyPerMonth: defaultPreset.promoSubsidyPerMonth,
    developerSubsidyDurationMonths: defaultPreset.promoSubsidyMonths,
    hasFreeLegalAllIn: true,
    freeLegalAmount: defaultPreset.freeLegalFeesEstimated,
    hasKprFeeSubsidy: true,
    kprFeeSubsidyAmount: defaultPreset.kprFeeSubsidyAmount,
    customPerks: defaultPreset.customPerks,
    selectedBankId: "btn-platinum",
    calculationType: "anuitas",
  });

  // DBR Input State
  const [dbrInput, setDbrInput] = useState<DbrInputState>({
    applicantIncome: 8000000,
    spouseIncome: 5000000,
    includeSpouse: true,
    activeInstallments: [
      { id: "1", name: "Cicilan Motor Honda", amount: 950000 },
    ],
    targetHousePrice: defaultPreset.price,
  });

  // Real-time calculation output
  const kprResult = useMemo(() => {
    return calculateKprSummary(kprInput);
  }, [kprInput]);

  const selectedBank = useMemo(() => {
    return REAL_BANK_RATES.find((b) => b.id === selectedBankId);
  }, [selectedBankId]);

  const activePreset = useMemo(() => {
    return PROPERTY_PRESETS.find((p) => p.id === activePresetId);
  }, [activePresetId]);

  // Handle Preset Switch
  const handleSelectPreset = (preset: PropertyPreset) => {
    setActivePresetId(preset.id);
    setKprInput((prev) => ({
      ...prev,
      propertyPrice: preset.price,
      developerName: preset.developerName,
      projectName: preset.name,
      developerSubsidyPerMonth: preset.promoSubsidyPerMonth,
      developerSubsidyDurationMonths: preset.promoSubsidyMonths,
      freeLegalAmount: preset.freeLegalFeesEstimated,
      kprFeeSubsidyAmount: preset.kprFeeSubsidyAmount,
      customPerks: preset.customPerks,
      tenorYears: preset.tenorYears,
    }));
  };

  // Handle Bank Switch from Modal
  const handleSelectBank = (bank: BankRate) => {
    setSelectedBankId(bank.id);
    setKprInput((prev) => ({
      ...prev,
      selectedBankId: bank.id,
      fixedRatePercent: bank.fixedRate,
      fixedDurationYears: bank.fixedYears,
      floatingRatePercent: bank.floatingRate,
      calculationType: bank.isSyariah ? "flat" : "anuitas",
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-row overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        clientName={clientName}
        onClientNameChange={setClientName}
        selectedBank={selectedBank}
        onOpenBankModal={() => setIsBankModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Content Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Minimal Canvas Header */}
        <CanvasHeader
          activeTool={activeTool}
          activePreset={activePreset}
          selectedBank={selectedBank}
          onOpenBankModal={() => setIsBankModalOpen(true)}
          onQuickPrint={() => window.print()}
          onToggleSidebarMobile={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Tool Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {activeTool === "kpr" && (
                <KprCalculatorTool
                  input={kprInput}
                  onChange={setKprInput}
                  result={kprResult}
                  selectedBank={selectedBank}
                  onOpenBankModal={() => setIsBankModalOpen(true)}
                  onNavigateToTool={setActiveTool}
                />
              )}

              {activeTool === "whiteboard" && (
                <WhiteboardTool
                  clientName={clientName}
                  propertyPrice={kprInput.propertyPrice}
                  monthlyInstallment={kprResult.netMonthlyInstallmentPromo}
                  onNavigateToSlip={() => setActiveTool("slip")}
                />
              )}

              {activeTool === "dbr" && (
                <JointIncomeDbrTool
                  input={dbrInput}
                  onChange={setDbrInput}
                  targetKprInstallment={kprResult.netMonthlyInstallmentPromo}
                />
              )}

              {activeTool === "rent-vs-buy" && (
                <RentVsBuyTool
                  propertyPrice={kprInput.propertyPrice}
                  monthlyHouseInstallment={kprResult.netMonthlyInstallmentPromo}
                />
              )}

              {activeTool === "capital-gain" && (
                <CapitalGainTool initialPrice={kprInput.propertyPrice} />
              )}

              {activeTool === "slip" && (
                <ProposalSlipDrawer
                  clientName={clientName}
                  onClientNameChange={setClientName}
                  input={kprInput}
                  result={kprResult}
                  selectedBank={selectedBank}
                  activePreset={activePreset}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Minimal Studio-Grade Footer */}
        <footer className="no-print bg-white border-t border-slate-200/90 py-5 px-4 sm:px-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900">TIAR PROPERTY</span>
            <span>·</span>
            <span>Partner Resmi PT. Trimitra Manunggal Jaya</span>
          </div>

          <div className="flex items-center gap-4 text-emerald-700 font-bold">
            <span>✓ DP 0% All-In</span>
            <span>✓ Free Pajak & Notaris</span>
            <span>✓ 5 Bank Rekanan BUMN</span>
          </div>

          <div>
            <span>Hotline: </span>
            <a
              href="https://wa.me/6285196598881"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-extrabold hover:underline"
            >
              +62 851-9659-8881
            </a>
          </div>
        </footer>
      </div>

      {/* Bank Rate Selector Modal */}
      <BankRateSelectorModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSelectBank={handleSelectBank}
        selectedBankId={selectedBankId}
      />
    </div>
  );
}
