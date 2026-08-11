"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTABannerSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" data-aos="fade-up">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-xl overflow-hidden p-10 sm:p-16 text-center"
          style={{ background: "linear-gradient(135deg, hsl(210 100% 20%) 0%, hsl(210 100% 30%) 100%)" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              আজই যোগ দিন, সফলতার পথে এগিয়ে যান!
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              হাজার হাজার সফল শিক্ষার্থীর সাথে আপনার মেডিকেল স্বপ্ন পূরণ করুন।
            </p>
            <Link href="/student/login"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-lg bg-white text-primary font-bold text-base hover:bg-white/90 transition-all shadow-2xl">
              ফ্রি রেজিস্ট্রেশন করুন <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
