"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconifyIcon } from "@/components/ui/IconifyIcon";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showAndroidManualHelp, setShowAndroidManualHelp] = useState<boolean>(false);

  useEffect(() => {
    // 0. Register Service Worker for PWA compliance
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW register notice:", err));
    }

    // 1. Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return; // Already installed, do not show prompt
    }

    // 2. Check if user already dismissed the prompt
    const isDismissed = localStorage.getItem("tiar_pwa_dismissed_v1");
    if (isDismissed) {
      return;
    }

    // 3. Detect mobile device
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isMobileDevice =
      /android|iphone|ipad|ipod|mobile|silk|kindle/i.test(ua) ||
      (window.navigator.maxTouchPoints > 1 && /macintosh/i.test(ua)) ||
      window.innerWidth < 768;

    setIsIos(isIosDevice);

    // 4. Capture beforeinstallprompt for Android & Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For mobile devices (iOS Safari, Android Chrome/Firefox):
    // Show after a brief delay if on mobile and not installed
    const timer = setTimeout(() => {
      if (isMobileDevice && !isStandalone && !isDismissed) {
        setIsVisible(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          localStorage.setItem("tiar_pwa_installed", "true");
          setIsVisible(false);
        }
      } catch (err) {
        console.warn("PWA install error:", err);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for Android if prompt was delayed/not supported
      setShowAndroidManualHelp(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("tiar_pwa_dismissed_v1", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 select-none"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950/20 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
                <IconifyIcon icon="solar:home-smile-bold" className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-slate-900 tracking-tight">
                    Install Aplikasi Tiar Property
                  </h4>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">
                  Akses instan di layar utama tanpa ketik URL & tanpa makan browser bar
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              title="Tutup"
            >
              <IconifyIcon icon="solar:close-circle-linear" className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <IconifyIcon icon="solar:shield-check-bold" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full Screen Layar Penuh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconifyIcon icon="solar:bolt-bold" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Cepat & Hemat Kuota</span>
            </div>
          </div>

          {isIos ? (
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <IconifyIcon icon="solar:info-circle-bold" className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                Cara Install di iPhone / iPad:
              </p>
              <p className="text-[11px] text-emerald-800">
                Ketuk tombol <strong>Bagikan (Share)</strong> <IconifyIcon icon="solar:share-linear" className="inline w-3 h-3" /> di Safari, lalu pilih <strong>&quot;Tambah ke Layar Utama (Add to Home Screen)&quot;</strong> ➕.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-0.5">
              {showAndroidManualHelp && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <IconifyIcon icon="solar:info-circle-bold" className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    Cara Pasang Cepat di Android:
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Buka menu browser (titik 3 di kanan atas ⋮), lalu pilih <strong>&quot;Install aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <IconifyIcon icon="solar:download-square-bold" className="w-4 h-4" />
                  <span>Install Aplikasi Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2.5 px-3 text-slate-500 hover:text-slate-700 text-xs font-bold rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  Nanti
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
