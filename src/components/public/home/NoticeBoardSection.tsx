"use client";

import { motion } from "framer-motion";
import { Megaphone, Pin, Calendar, ArrowRight, Bell, Sparkles } from "lucide-react";

const notices = [
  {
    id: 1,
    title: "এইচএসসি ২০২৫ অফলাইন ব্যাচের ভর্তি চলছে!",
    date: "১৫ অক্টোবর",
    month: "অক্টোবর",
    type: "ভর্তি",
    description: "আগামী ২৫ই অক্টোবর থেকে ফার্মগেট ও মিরপুর শাখায় নতুন ব্যাচের ক্লাস শুরু হবে। সিট সীমিত, দ্রুত ভর্তি নিশ্চিত করুন।",
    isImportant: true,
  },
  {
    id: 2,
    title: "মেডিকেল ভর্তি প্রস্তুতি ফ্রি সেমিনার",
    date: "১২",
    month: "অক্টোবর",
    type: "সেমিনার",
    description: "আগামী শুক্রবার সকাল ১০টায় মৌচাক শাখায় মেডিকেল ভর্তি প্রস্তুতি নিয়ে একটি ওপেন সেমিনার অনুষ্ঠিত হবে। সবার জন্য উন্মুক্ত।",
    isImportant: false,
  },
  {
    id: 3,
    title: "অফিসিয়াল ছুটি সংক্রান্ত বিজ্ঞপ্তি",
    date: "১০",
    month: "অক্টোবর",
    type: "ছুটি",
    description: "সরকারি ছুটি উপলক্ষে আগামী ১১ ও ১২ অক্টোবর সকল শাখার অফিস ও অফলাইন ক্লাস সাময়িক বন্ধ থাকবে।",
    isImportant: false,
  },
  {
    id: 4,
    title: "বায়োলজি মেগা মডেল টেস্ট রেজাল্ট প্রকাশ",
    date: "০৮",
    month: "অক্টোবর",
    type: "রেজাল্ট",
    description: "গত রবিবারের বায়োলজি মেগা মডেল টেস্টের মেরিট লিস্ট ওয়েবসাইট ও অ্যাপে প্রকাশ করা হয়েছে।",
    isImportant: false,
  }
];

export function NoticeBoardSection() {
  const importantNotice = notices.find(n => n.isImportant) || notices[0];
  const regularNotices = notices.filter(n => !n.isImportant);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Glowing accents */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6" data-aos="fade-up">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-3">
              <Megaphone className="w-5 h-5" />
              <span>নোটিশ বোর্ড</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              গুরুত্বপূর্ণ আপডেট
            </h2>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
            সকল নোটিশ দেখুন
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Side: Featured / Pinned Notice */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="h-full relative bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-primary/5 overflow-hidden group">
              {/* Decorative top-right element */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-bold mb-8 border border-primary/20">
                <Pin className="w-3.5 h-3.5 fill-primary/40" />
                PINNED NOTICE
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-4">
                {importantNotice.title}
              </h3>
              
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
                {importantNotice.description}
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex flex-col items-center justify-center text-primary shadow-sm">
                  <span className="font-bold text-lg leading-none">{importantNotice.date.split(' ')[0]}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{importantNotice.month}</div>
                  <div className="text-xs text-muted-foreground">DoctorBiology Authority</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: List of Regular Notices */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {regularNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 sm:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md cursor-pointer"
              >
                {/* Date Badge */}
                <div className="flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-1 w-auto sm:w-20 sm:h-20 shrink-0 bg-secondary/50 group-hover:bg-primary/10 rounded-xl transition-colors duration-300 p-3 sm:p-0">
                  <span className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{notice.date}</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary/70">{notice.month}</span>
                </div>

                {/* Notice Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border group-hover:border-primary/20">
                      {notice.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bell className="w-3 h-3" />
                      আপডেট
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {notice.title}
                  </h4>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {notice.description}
                  </p>
                </div>

                {/* Action Icon */}
                <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-full bg-secondary items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
