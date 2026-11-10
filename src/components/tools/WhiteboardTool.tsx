"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { IconifyIcon } from "@/components/ui/IconifyIcon";
import { formatRupiah } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface WhiteboardToolProps {
  clientName: string;
  propertyPrice: number;
  monthlyInstallment: number;
  onNavigateToSlip: () => void;
}

type BrushTool = "pen" | "highlighter" | "eraser";
type BackgroundTemplate = "blank" | "grid" | "floorplan-1fl" | "floorplan-2fl" | "siteplan";

const COLOR_PALETTE = [
  { name: "Hitam Tinta", hex: "#0F172A" },
  { name: "Hijau Emerald", hex: "#059669" },
  { name: "Biru Blueprint", hex: "#2563EB" },
  { name: "Merah Alert", hex: "#DC2626" },
  { name: "Kuning Stabilo", hex: "#EAB308" },
  { name: "Oranye Tiar", hex: "#D97706" },
];

export function WhiteboardTool({
  clientName,
  propertyPrice,
  monthlyInstallment,
  onNavigateToSlip,
}: WhiteboardToolProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<BrushTool>("pen");
  const [activeColor, setActiveColor] = useState<string>("#0F172A");
  const [brushSize, setBrushSize] = useState<number>(4);
  const [bgTemplate, setBgTemplate] = useState<BackgroundTemplate>("blank");

  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize and resize canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set physical pixel dimensions for high DPI
    canvas.width = rect.width * dpr;
    canvas.height = 680 * dpr;

    // Set logical CSS dimensions
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = "680px";

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Save initial blank state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas]);

  // Pointer event handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize * 4;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (activeTool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = brushSize * 3;
      ctx.strokeStyle = activeColor;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = activeColor;
      ctx.globalAlpha = 1.0;
    }

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.closePath();
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";
    setIsDrawing(false);

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {}

    // Save to history stack
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    // Limit history to 20 steps
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevIndex = historyIndex - 1;
    ctx.putImageData(history[prevIndex], 0, 0);
    setHistoryIndex(prevIndex);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nextIndex = historyIndex + 1;
    ctx.putImageData(history[nextIndex], 0, 0);
    setHistoryIndex(nextIndex);
  };

  const handleClear = () => {
    if (window.confirm("Bersihkan seluruh coretan di kanvas?")) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const emptyState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([emptyState]);
      setHistoryIndex(0);
    }
  };

  // Download sketch as PNG
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary export canvas with white background
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    // 1. Draw solid background
    exportCtx.fillStyle = "#FAF9F5";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 2. Draw watermark & title
    exportCtx.fillStyle = "#0F172A";
    exportCtx.font = "bold 24px sans-serif";
    exportCtx.fillText(`TIAR PROPERTY — Sketsa Unit: ${clientName}`, 30, 40);

    exportCtx.fillStyle = "#059669";
    exportCtx.font = "bold 18px sans-serif";
    exportCtx.fillText(`Harga: ${formatRupiah(propertyPrice)} | Angsuran Promo: ${formatRupiah(monthlyInstallment)}/bln`, 30, 70);

    // 3. Draw user strokes
    exportCtx.drawImage(canvas, 0, 0);

    // 4. Trigger download
    const link = document.createElement("a");
    link.download = `Sketsa-TiarProperty-${clientName.replace(/\s+/g, "_")}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Controls, Color, Brushes, and Actions */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Tool selector (Pen, Highlighter, Eraser) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTool("pen")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
              activeTool === "pen"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <IconifyIcon icon="solar:pen-bold" className="w-4 h-4 text-emerald-600" />
            <span>Pena</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("highlighter")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
              activeTool === "highlighter"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <IconifyIcon icon="solar:brush-bold" className="w-4 h-4 text-amber-500" />
            <span>Stabilo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("eraser")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
              activeTool === "eraser"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <IconifyIcon icon="solar:eraser-bold" className="w-4 h-4 text-rose-500" />
            <span>Hapus</span>
          </button>
        </div>

        {/* Center: Color Picker */}
        {activeTool !== "eraser" && (
          <div className="flex items-center gap-1.5 px-2">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setActiveColor(c.hex)}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-transform active:scale-90",
                  activeColor === c.hex
                    ? "border-slate-900 scale-110 shadow-sm ring-2 ring-slate-400/40"
                    : "border-white hover:scale-105"
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Brush Size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Tebal:</span>
          {[2, 4, 8, 14].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setBrushSize(sz)}
              className={cn(
                "w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center transition-all",
                brushSize === sz
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1">Template:</span>
          <select
            value={bgTemplate}
            onChange={(e) => setBgTemplate(e.target.value as BackgroundTemplate)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-600"
          >
            <option value="blank">Kertas Putih Polos</option>
            <option value="grid">Grid Milimeter</option>
            <option value="floorplan-1fl">Denah 1 Lantai (Kwangsan 36/72)</option>
            <option value="floorplan-2fl">Denah 2 Lantai (The Oso 55/60)</option>
            <option value="siteplan">Siteplan / Blok Kavling</option>
          </select>
        </div>

        {/* Actions: Undo, Redo, Clear, Download */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            title="Undo"
          >
            <IconifyIcon icon="solar:undo-left-round-bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            title="Redo"
          >
            <IconifyIcon icon="solar:undo-right-round-bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus Semua"
          >
            <IconifyIcon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            className="text-xs font-bold px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <IconifyIcon icon="solar:download-minimalistic-bold" className="w-4 h-4" />
            <span>Unduh PNG</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Drawing Artboard */}
      <div
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-md bg-white select-none"
        style={{ minHeight: "680px" }}
      >
        {/* Background Visual Template Overlays */}
        {bgTemplate === "grid" && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(#0F172A 1px, transparent 1px), radial-gradient(#0F172A 1px, #FAF9F5 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />
        )}

        {/* Floorplan 1 Lantai SVG Template */}
        {bgTemplate === "floorplan-1fl" && (
          <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center opacity-40">
            <svg viewBox="0 0 600 800" className="w-full max-w-md h-auto stroke-slate-700 fill-none stroke-[2]">
              {/* Outer boundary 6x12m */}
              <rect x="50" y="50" width="500" height="700" strokeWidth="4" />
              {/* Carport & Taman Depan */}
              <rect x="50" y="50" width="280" height="220" />
              <text x="120" y="160" fill="#475569" fontSize="16" fontWeight="bold">CARPORT (3 x 4.5m)</text>
              <rect x="330" y="50" width="220" height="220" />
              <text x="370" y="160" fill="#475569" fontSize="16" fontWeight="bold">TAMAN DEPAN</text>
              {/* Ruang Tamu / Keluarga */}
              <rect x="50" y="270" width="280" height="260" />
              <text x="100" y="400" fill="#475569" fontSize="18" fontWeight="bold">RUANG KELUARGA</text>
              {/* Kamar Tidur Utama */}
              <rect x="330" y="270" width="220" height="180" />
              <text x="360" y="360" fill="#475569" fontSize="16" fontWeight="bold">KAMAR UTAMA</text>
              {/* Kamar Mandi */}
              <rect x="330" y="450" width="120" height="120" />
              <text x="370" y="515" fill="#475569" fontSize="14" fontWeight="bold">KM</text>
              {/* Kamar Tidur 2 */}
              <rect x="50" y="530" width="240" height="220" />
              <text x="90" y="640" fill="#475569" fontSize="16" fontWeight="bold">KAMAR 2 (3 x 3m)</text>
              {/* Dapur & Sisa Lahan Belakang */}
              <rect x="290" y="570" width="260" height="180" />
              <text x="340" y="660" fill="#475569" fontSize="16" fontWeight="bold">DAPUR & TAMAN BELAKANG</text>
            </svg>
          </div>
        )}

        {/* Floorplan 2 Lantai SVG Template */}
        {bgTemplate === "floorplan-2fl" && (
          <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center opacity-40">
            <svg viewBox="0 0 700 700" className="w-full max-w-lg h-auto stroke-slate-700 fill-none stroke-[2]">
              {/* Lantai 1 */}
              <rect x="30" y="50" width="300" height="600" strokeWidth="3" />
              <text x="110" y="35" fill="#0F172A" fontSize="18" fontWeight="bold">LANTAI 1 (THE OSO)</text>
              <rect x="30" y="50" width="300" height="200" />
              <text x="80" y="150" fill="#475569" fontSize="15" fontWeight="bold">CARPORT 2 MOBIL</text>
              <rect x="30" y="250" width="300" height="220" />
              <text x="70" y="360" fill="#475569" fontSize="16" fontWeight="bold">LIVING & DINING ROOM</text>
              <rect x="30" y="470" width="160" height="180" />
              <text x="60" y="560" fill="#475569" fontSize="14" fontWeight="bold">KAMAR 1</text>
              <rect x="190" y="470" width="140" height="180" />
              <text x="230" y="560" fill="#475569" fontSize="14" fontWeight="bold">DAPUR</text>

              {/* Lantai 2 */}
              <rect x="370" y="50" width="300" height="600" strokeWidth="3" />
              <text x="450" y="35" fill="#0F172A" fontSize="18" fontWeight="bold">LANTAI 2 (THE OSO)</text>
              <rect x="370" y="50" width="300" height="120" />
              <text x="430" y="115" fill="#475569" fontSize="15" fontWeight="bold">BALKON ROOFTOP</text>
              <rect x="370" y="170" width="300" height="240" />
              <text x="430" y="290" fill="#475569" fontSize="16" fontWeight="bold">MASTER BEDROOM</text>
              <rect x="370" y="410" width="180" height="240" />
              <text x="410" y="530" fill="#475569" fontSize="15" fontWeight="bold">KAMAR ANAK</text>
              <rect x="550" y="410" width="120" height="120" />
              <text x="585" y="475" fill="#475569" fontSize="14" fontWeight="bold">KM 2</text>
            </svg>
          </div>
        )}

        {/* Siteplan Kavling Template */}
        {bgTemplate === "siteplan" && (
          <div className="absolute inset-0 pointer-events-none p-6 flex items-center justify-center opacity-30">
            <svg viewBox="0 0 800 600" className="w-full max-w-xl h-auto stroke-slate-800 fill-none stroke-[2]">
              {/* Main Road */}
              <line x1="50" y1="300" x2="750" y2="300" strokeWidth="8" strokeDasharray="16,8" />
              <text x="310" y="306" fill="#0F172A" fontSize="18" fontWeight="black">ROW JALAN UTAMA 8 METER</text>
              
              {/* Block A (Top Row) */}
              {[1, 2, 3, 4, 5, 6, 7].map((num, i) => (
                <g key={`A-${num}`}>
                  <rect x={70 + i * 95} y={120} width={85} height={140} />
                  <text x={95 + i * 95} y={195} fill="#0F172A" fontSize="16" fontWeight="bold">A-{num}</text>
                  <text x={85 + i * 95} y={220} fill="#64748B" fontSize="11">6x12 m</text>
                </g>
              ))}

              {/* Block B (Bottom Row) */}
              {[1, 2, 3, 4, 5, 6, 7].map((num, i) => (
                <g key={`B-${num}`}>
                  <rect x={70 + i * 95} y={340} width={85} height={140} />
                  <text x={95 + i * 95} y={415} fill="#0F172A" fontSize="16" fontWeight="bold">B-{num}</text>
                  <text x={85 + i * 95} y={440} fill="#64748B" fontSize="11">6x12 m</text>
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Interactive Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="relative z-10 w-full h-[680px] touch-none cursor-crosshair"
        />

        {/* Floating Pitching Telemetry Bar (Bottom overlay) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <IconifyIcon icon="solar:calculator-minimalistic-bold" className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                Estimasi Closing Unit ({clientName})
              </span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                Harga: {formatRupiah(propertyPrice)} · Angsuran: {formatRupiah(monthlyInstallment)}/bln
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Gunakan pena untuk tandai nomor kavling atau modifikasi denah.
            </span>
            <button
              type="button"
              onClick={onNavigateToSlip}
              className="text-xs font-bold px-3 py-1.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>Kirim ke Slip Penawaran</span>
              <IconifyIcon icon="solar:arrow-right-linear" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
