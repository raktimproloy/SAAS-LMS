"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Teacher } from "@prisma/client";
import Link from "next/link";
import { LogIn, Download, Share, X, CheckCircle2 } from "lucide-react";
import { usePWAInstall } from "@/components/public/PWAInstallContext";
import { Button } from "@/components/ui/button";

interface HeroTeacherSectionProps {
  teacher: Teacher | null;
  hideButtons?: boolean;
  showStatsCards?: boolean;
}

export function HeroTeacherSection({ teacher, hideButtons = false, showStatsCards = false }: HeroTeacherSectionProps) {
  const name = teacher?.name || "ডাঃ রাকিবুল ইসলাম";
  const bio = teacher?.bio || "বিগত ১০ বছর ধরে মেডিকেল ভর্তিচ্ছু শিক্ষার্থীদের জীববিজ্ঞানের ভয় দূর করে তাদের স্বপ্ন পূরণে কাজ করে যাচ্ছি। আমার লক্ষ্য হলো প্রতিটি শিক্ষার্থী যেন শুধু মুখস্থ না করে, বরং বুঝে শিখতে পারে।";
  const image = teacher?.photo || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  const { promptInstall, isInstalled, isIOS, canInstall } = usePWAInstall();
  const [showHelp, setShowHelp] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstalled) {
      setToast("অ্যাপ ইতিমধ্যেই ইনস্টল করা আছে!");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setInstalling(true);
    try {
      const result = await promptInstall();
      if (result === "accepted") {
        setToast("অ্যাপ ইনস্টল শুরু হয়েছে!");
        setTimeout(() => setToast(null), 2500);
      } else if (result === "ios" || result === "unavailable") {
        setShowHelp(true);
      } else if (result === "installed") {
        setToast("অ্যাপ ইতিমধ্যেই ইনস্টল করা আছে!");
        setTimeout(() => setToast(null), 2500);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <section className="relative min-h-[60vh] flex items-center pt-16 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left: Image */}
          <div className="relative order-2 lg:order-1 flex justify-center">
            <div className="relative max-w-sm w-full">
              <Image 
                src={image} 
                alt={name} 
                width={400}
                height={500}
                className="object-cover object-top w-full h-auto shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Right: Bio & Info */}
          <div className="order-1 lg:order-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl md:leading-tight font-extrabold text-foreground mb-2">
                <span className="gradient-text">{name}</span>
              </h1>
              <h3 className="text-lg sm:text-xl text-foreground font-semibold mb-4">
                MBBS (DMC), FCPS (Medicine)
              </h3>
              
              <p className="text-foreground text-base leading-relaxed max-w-xl">
                {bio}
              </p>
            </motion.div>

            {!hideButtons && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
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
                  disabled={installing}
                  className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-6 py-4 bg-card border-2 border-primary/20 text-foreground rounded-lg font-bold text-base shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1 disabled:opacity-70"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 text-primary">
                    {isInstalled ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </div>
                  <span>
                    {installing
                      ? "Installing..."
                      : isInstalled
                        ? "App Installed"
                        : canInstall
                          ? "Install App"
                          : "Install App"}
                  </span>
                </button>
              </motion.div>
            )}

            {showStatsCards && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 flex items-center gap-5 w-full sm:w-auto shadow-xl">
                  <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-foreground mb-1">৫০০০+</h4>
                    <p className="text-muted-foreground text-sm font-medium">সর্বমোট শিক্ষার্থী</p>
                  </div>
                </div>
                
                <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 flex items-center gap-5 w-full sm:w-auto shadow-xl">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-foreground mb-1">১৫+</h4>
                    <p className="text-muted-foreground text-sm font-medium">অভিজ্ঞ শিক্ষক</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-foreground text-background px-4 py-2 text-sm shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

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
