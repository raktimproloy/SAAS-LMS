"use client";

import { motion } from "framer-motion";
import { Pin, ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { Notice } from "@prisma/client";

interface NoticeBoardSectionProps {
  notices?: Notice[];
}

const fallbackNotices = [
  { id: "1", title: "এইচএসসি ২০২৫ অফলাইন ব্যাচের ভর্তি চলছে!", type: "ভর্তি", description: "আগামী ২৫ই অক্টোবর থেকে ফার্মগেট ও মিরপুর শাখায় নতুন ব্যাচের ক্লাস শুরু হবে। সিট সীমিত, দ্রুত ভর্তি নিশ্চিত করুন।", isPinned: true },
  { id: "2", title: "মেডিকেল ভর্তি প্রস্তুতি ফ্রি সেমিনার", type: "সেমিনার", description: "আগামী শুক্রবার সকাল ১০টায় মৌচাক শাখায় মেডিকেল ভর্তি প্রস্তুতি নিয়ে একটি ওপেন সেমিনার অনুষ্ঠিত হবে। সবার জন্য উন্মুক্ত।", isPinned: false },
  { id: "3", title: "বায়োলজি মেগা মডেল টেস্ট রেজাল্ট প্রকাশ", type: "রেজাল্ট", description: "গত রবিবারের বায়োলজি মেগা মডেল টেস্টের মেরিট লিস্ট ওয়েবসাইট ও অ্যাপে প্রকাশ করা হয়েছে।", isPinned: false }
];

export function NoticeBoardSection({ notices }: NoticeBoardSectionProps) {
  const displayNotices = notices && notices.length > 0 ? notices : fallbackNotices as any;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
              <Bell className="w-4 h-4" />
              আপডেট ও বিজ্ঞপ্তি
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              বোর্ড নোটিশ
            </h2>
          </div>
          <Link href="/notices" className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group bg-primary/10 px-5 py-2.5 rounded-xl border border-primary/20 hover:bg-primary/20">
            সকল নোটিশ দেখুন
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayNotices.slice(0, 3).map((notice: any, index: number) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/notices/${notice.id}`} className="block h-full group">
                <div className={`bg-card/40 backdrop-blur-xl border rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${notice.isPinned
                    ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/60"
                    : "border-border/50 hover:border-primary/40"
                  }`}
                >
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors duration-500 pointer-events-none" />

                  <div className="relative z-10 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${notice.isPinned
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                        }`}>
                        {notice.type || "Update"}
                      </span>
                      {notice.isPinned && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                          <Pin className="w-3.5 h-3.5" />
                          PINNED
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {notice.title}
                    </h4>

                    {/* Clamp description to 3 lines as requested */}
                    <p className="text-foreground leading-relaxed text-sm line-clamp-3 mb-4 flex-grow">
                      {notice.description || notice.content}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-primary mt-auto">
                      বিস্তারিত পড়ুন
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
