"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/components/public/PWAInstallContext";
import { siteConfig } from "@/config/site.config";

const DISMISSED_KEY = "pwa-install-dismissed";

export function PWAInstallPrompt() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed || isInstalled) return;

    // Show banner once install is available, or on iOS after delay
    if (canInstall) {
      const t = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(t);
    }

    if (isIOS) {
      const t = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(t);
    }
  }, [canInstall, isInstalled, isIOS]);

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result === "accepted" || result === "installed") {
      setShowBanner(false);
      setShowIOSHelp(false);
      return;
    }
    if (result === "ios") {
      setShowIOSHelp(true);
      return;
    }
    if (result === "unavailable") {
      setShowIOSHelp(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSHelp(false);
    sessionStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!mounted || isInstalled) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] z-50"
          >
            <div className="glass dark:glass-dark rounded-2xl p-4 shadow-2xl border border-white/10 bg-card/95 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl overflow-hidden shadow-lg shrink-0 bg-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/icon-192x192.png"
                    alt={siteConfig.instituteName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">
                    App Download করুন
                  </h3>
                  <p className="text-xs text-foreground/80 mt-0.5">
                    {siteConfig.instituteName} install করুন — হোম স্ক্রিনে অ্যাপের মতো ব্যবহার করুন!
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Install App
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="h-8 text-xs text-foreground/80"
                    >
                      পরে
                    </Button>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="text-foreground/70 hover:text-foreground transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4"
            onClick={handleDismiss}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-base">App Install করবেন যেভাবে</h3>
                <button onClick={handleDismiss} aria-label="Close">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {isIOS ? (
                <ol className="space-y-3 text-sm text-foreground/90">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span className="inline-flex items-center gap-1 flex-wrap">
                      Safari-এ নিচের <Share className="h-4 w-4 inline" /> Share বাটনে ট্যাপ করুন
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>&quot;Add to Home Screen&quot; সিলেক্ট করুন</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Add চাপলে অ্যাপ হোম স্ক্রিনে ইনস্টল হবে</span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-3 text-sm text-foreground/90">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Chrome/Edge ব্রাউজারের মেনু (⋮) খুলুন</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>&quot;Install app&quot; / &quot;Add to Home screen&quot; সিলেক্ট করুন</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Install কনফার্ম করলে অ্যাপ ডাউনলোড/ইনস্টল হবে</span>
                  </li>
                </ol>
              )}

              <Button className="w-full mt-5" onClick={handleDismiss}>
                বুঝেছি
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
