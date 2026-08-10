"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }

    // Check if already dismissed
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] z-50"
        >
          <div className="glass dark:glass-dark rounded-2xl p-4 shadow-2xl border border-white/10">
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                <Dna className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">
                  App Download করুন! 📱
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Institute Web App install করুন — offline-ও কাজ করে!
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="h-8 text-xs gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 hover:from-indigo-700 hover:to-violet-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    পরে
                  </Button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
