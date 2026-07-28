"use client";

import { motion } from "framer-motion";
import { Megaphone, Pin, ArrowRight } from "lucide-react";

const notices = [
  {
    id: 1,
    title: "এইচএসসি ২০২৫ অফলাইন ব্যাচের ভর্তি চলছে!",
    type: "ভর্তি",
    description: "আগামী ২৫ই অক্টোবর থেকে ফার্মগেট ও মিরপুর শাখায় নতুন ব্যাচের ক্লাস শুরু হবে। সিট সীমিত, দ্রুত ভর্তি নিশ্চিত করুন।",
    isImportant: true,
  },
  {
    id: 2,
    title: "মেডিকেল ভর্তি প্রস্তুতি ফ্রি সেমিনার",
    type: "সেমিনার",
    description: "আগামী শুক্রবার সকাল ১০টায় মৌচাক শাখায় মেডিকেল ভর্তি প্রস্তুতি নিয়ে একটি ওপেন সেমিনার অনুষ্ঠিত হবে। সবার জন্য উন্মুক্ত।",
    isImportant: false,
  },
  {
    id: 3,
    title: "অফিসিয়াল ছুটি সংক্রান্ত বিজ্ঞপ্তি",
    type: "ছুটি",
    description: "সরকারি ছুটি উপলক্ষে আগামী ১১ ও ১২ অক্টোবর সকল শাখার অফিস ও অফলাইন ক্লাস সাময়িক বন্ধ থাকবে।",
    isImportant: false,
  },
  {
    id: 4,
    title: "বায়োলজি মেগা মডেল টেস্ট রেজাল্ট প্রকাশ",
    type: "রেজাল্ট",
    description: "গত রবিবারের বায়োলজি মেগা মডেল টেস্টের মেরিট লিস্ট ওয়েবসাইট ও অ্যাপে প্রকাশ করা হয়েছে।",
    isImportant: false,
  }
];

export function NoticeBoardSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6" data-aos="fade-up">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              গুরুত্বপূর্ণ আপডেট
            </h2>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
            সকল নোটিশ দেখুন
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`bg-card/40 backdrop-blur-3xl border rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 ${notice.isImportant
                  ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
                  : "border-border/50 dark:border-white/5"
                }`}
            >
              {/* Decorative Glowing Element */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${notice.isImportant
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/80 text-secondary-foreground"
                    }`}>
                    {notice.type}
                  </span>
                  {notice.isImportant && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                      <Pin className="w-3.5 h-3.5" />
                      PINNED
                    </span>
                  )}
                </div>

                <h4 className="text-xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                  {notice.title}
                </h4>

                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                  {notice.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
