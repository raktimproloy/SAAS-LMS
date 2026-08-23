"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Download, LogIn, Share, X, CheckCircle2 } from "lucide-react";
import { usePWAInstall } from "@/components/public/PWAInstallContext";
import { Button } from "@/components/ui/button";

export function ActionButtonsSection() {
  const { promptInstall, isInstalled, isIOS } = usePWAInstall();
  const [showHelp, setShowHelp] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) return;
    setInstalling(true);
    try {
      const result = await promptInstall();
      if (result === "ios" || result === "unavailable") {
        setShowHelp(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/student/login"
            className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-base shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-10px_hsl(var(--primary))] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <LogIn className="w-5 h-5 relative z-10" />
            <span className="relative z-10 text-white">Student Login</span>
          </Link>

          <button
            type="button"
            onClick={handleInstallClick}
            disabled={installing || isInstalled}
            className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-6 py-4 bg-card border-2 border-primary/20 text-foreground rounded-lg font-bold text-base shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1 disabled:opacity-70"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 text-primary">
              {isInstalled ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            </div>
            <span>{isInstalled ? "App Installed" : installing ? "Installing..." : "Install App"}</span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4"
            onClick={() => setShowHelp(false)}
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
                <button type="button" onClick={() => setShowHelp(false)} aria-label="Close">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {isIOS ? (
                <ol className="space-y-3 text-sm text-foreground/90">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span className="inline-flex items-center gap-1 flex-wrap">
                      Safari-এ <Share className="h-4 w-4 inline" /> Share বাটনে ট্যাপ করুন
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>&quot;Add to Home Screen&quot; সিলেক্ট করুন</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Add চাপলে অ্যাপ ইনস্টল হবে</span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-3 text-sm text-foreground/90">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Chrome/Edge মেনু (⋮) খুলুন</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>&quot;Install app&quot; বা &quot;Add to Home screen&quot; চাপুন</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Install কনফার্ম করলে অ্যাপ ডাউনলোড হবে</span>
                  </li>
                </ol>
              )}
              <Button className="w-full mt-5" onClick={() => setShowHelp(false)}>
                বুঝেছি
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
