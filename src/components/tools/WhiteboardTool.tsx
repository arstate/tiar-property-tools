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
  const [activeColor, setActiveColor] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tiar_whiteboard_color_v1") || "#0F172A";
    }
    return "#0F172A";
  });
  const [brushSize, setBrushSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("tiar_whiteboard_size_v1");
      if (s) return parseInt(s, 10) || 4;
    }
    return 4;
  });
  const [bgTemplate, setBgTemplate] = useState<BackgroundTemplate>(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("tiar_whiteboard_template_v1");
      if (t) return t as BackgroundTemplate;
    }
    return "blank";
  });

  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isDrawingRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  // Helper to get compact WebP data URL (~50x smaller than raw PNG) to prevent localStorage quota exhaustion
  const getStorageDataUrl = (canvas: HTMLCanvasElement): string => {
    try {
      const webp = canvas.toDataURL("image/webp", 0.85);
      if (webp && webp.startsWith("data:image/webp")) {
        return webp;
      }
    } catch {}
    return canvas.toDataURL("image/png");
  };

  const saveToStorage = (canvas: HTMLCanvasElement) => {
    try {
      if (typeof window !== "undefined") {
        const dataUrl = getStorageDataUrl(canvas);
        localStorage.setItem("tiar_whiteboard_canvas_v1", dataUrl);
      }
    } catch (err) {
      console.warn("Storage quota or save notice:", err);
    }
  };

  // Initialize and resize canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Capture in-memory drawing ONLY on resize (after initial mount has completed)
    let inMemoryDrawing: string | null = null;
    if (isInitializedRef.current && canvas.width > 0 && canvas.height > 0) {
      try {
        inMemoryDrawing = canvas.toDataURL();
      } catch {}
    }

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const h = rect.height || 750;

    // Set physical pixel dimensions for high DPI
    canvas.width = rect.width * dpr;
    canvas.height = h * dpr;

    // Set logical CSS dimensions
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // On initial mount, restore strictly from localStorage. On resize, restore from in-memory drawing.
    const saved =
      inMemoryDrawing ||
      (!isInitializedRef.current && typeof window !== "undefined"
        ? localStorage.getItem("tiar_whiteboard_canvas_v1")
        : null);

    isInitializedRef.current = true;

    if (saved) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, h);
        const restoredState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([restoredState]);
        setHistoryIndex(0);
      };
      img.src = saved;
    } else {
      // Save initial blank state
      const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
      setHistoryIndex(0);
    }
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

    // Immediately stroke a point so single tap or click creates a visible dot
    ctx.lineTo(x, y);
    ctx.stroke();

    isDrawingRef.current = true;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
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
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.closePath();
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";

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

    // Persist to local browser storage with quota-safe compression
    saveToStorage(canvas);
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
    saveToStorage(canvas);
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
    saveToStorage(canvas);
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
      try {
        localStorage.removeItem("tiar_whiteboard_canvas_v1");
      } catch {}
    }
  };

  // Download sketch as PNG (includes background floorplan/siteplan template)
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const triggerDownload = () => {
      // 4. Draw user strokes on top of template
      exportCtx.drawImage(canvas, 0, 0);

      const link = document.createElement("a");
      link.download = `Sketsa-TiarProperty-${clientName.replace(/\s+/g, "_")}.png`;
      link.href = exportCanvas.toDataURL("image/png");
      link.click();
    };

    // 3. Render active background template
    if (bgTemplate === "grid") {
      exportCtx.fillStyle = "#94A3B8";
      const step = 24 * (window.devicePixelRatio || 1);
      for (let x = 0; x < exportCanvas.width; x += step) {
        for (let y = 100; y < exportCanvas.height; y += step) {
          exportCtx.beginPath();
          exportCtx.arc(x, y, 1.5, 0, Math.PI * 2);
          exportCtx.fill();
        }
      }
      triggerDownload();
    } else if (bgTemplate !== "blank" && containerRef.current) {
      const svg = containerRef.current.querySelector("svg");
      if (svg) {
        try {
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          const svgImg = new Image();
          svgImg.onload = () => {
            const padding = 60;
            const availableW = exportCanvas.width - padding * 2;
            const availableH = exportCanvas.height - 120 - padding;
            const vbW = svg.viewBox?.baseVal?.width || 600;
            const vbH = svg.viewBox?.baseVal?.height || 800;
            const scale = Math.min(availableW / vbW, availableH / vbH);
            const drawW = vbW * scale;
            const drawH = vbH * scale;
            const drawX = (exportCanvas.width - drawW) / 2;
            const drawY = 100 + (availableH - drawH) / 2;

            exportCtx.save();
            exportCtx.globalAlpha = 0.5;
            exportCtx.drawImage(svgImg, drawX, drawY, drawW, drawH);
            exportCtx.restore();
            URL.revokeObjectURL(url);
            triggerDownload();
          };
          svgImg.onerror = () => triggerDownload();
          svgImg.src = url;
          return;
        } catch {
          triggerDownload();
        }
      } else {
        triggerDownload();
      }
    } else {
      triggerDownload();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex-1 rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-sm bg-white select-none"
    >
      {/* FLOATING 1-ROW GLASSMORPHIC TOOLBAR AT BOTTOM */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 max-w-[95%] overflow-x-auto no-scrollbar">
        {/* Tool selector: Pen, Highlighter, Eraser */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-full shrink-0">
          <button
            type="button"
            onClick={() => setActiveTool("pen")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
              activeTool === "pen"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <IconifyIcon icon="solar:pen-bold" className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Pena</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("highlighter")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
              activeTool === "highlighter"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <IconifyIcon icon="solar:brush-bold" className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Stabilo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("eraser")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95",
              activeTool === "eraser"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <IconifyIcon icon="solar:eraser-bold" className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>

        {/* Color Palette Dots */}
        {activeTool !== "eraser" && (
          <div className="flex items-center gap-1.5 px-1 shrink-0">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  setActiveColor(c.hex);
                  try {
                    localStorage.setItem("tiar_whiteboard_color_v1", c.hex);
                  } catch {}
                }}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform active:scale-90",
                  activeColor === c.hex
                    ? "border-slate-900 scale-110 shadow-sm ring-2 ring-slate-400/30"
                    : "border-white hover:scale-105"
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

        {/* Brush Size */}
        <div className="flex items-center gap-1 shrink-0">
          {[2, 4, 8, 14].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => {
                setBrushSize(sz);
                try {
                  localStorage.setItem("tiar_whiteboard_size_v1", sz.toString());
                } catch {}
              }}
              className={cn(
                "w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all",
                brushSize === sz
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {sz}
            </button>
          ))}
        </div>

        <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

        {/* Template Dropdown */}
        <div className="shrink-0">
          <select
            value={bgTemplate}
            onChange={(e) => {
              const tmpl = e.target.value as BackgroundTemplate;
              setBgTemplate(tmpl);
              try {
                localStorage.setItem("tiar_whiteboard_template_v1", tmpl);
              } catch {}
            }}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 focus:outline-none focus:border-emerald-600"
          >
            <option value="blank">Kertas Polos</option>
            <option value="grid">Grid</option>
            <option value="floorplan-1fl">Denah 1 Lt (36/72)</option>
            <option value="floorplan-2fl">Denah 2 Lt (55/60)</option>
            <option value="siteplan">Siteplan Kavling</option>
          </select>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

        {/* Actions: Undo, Redo, Clear, Download PNG (Icon Only) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <IconifyIcon icon="solar:undo-left-round-bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <IconifyIcon icon="solar:undo-right-round-bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus Semua"
          >
            <IconifyIcon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all shrink-0"
            title="Unduh PNG Sketsa"
          >
            <IconifyIcon icon="solar:download-minimalistic-bold" className="w-4 h-4" />
          </button>
        </div>
      </div>
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
          className="relative z-10 w-full h-full touch-none cursor-crosshair"
        />
    </div>
  );
}
