"use client";

import { motion } from "framer-motion";
import { Pin, ArrowRight, Bell, Clock, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Notice } from "@prisma/client";

interface NoticeBoardSectionProps {
  notices?: Notice[];
}

export function NoticeBoardSection({ notices }: NoticeBoardSectionProps) {
  if (!notices || notices.length === 0) {
    return null;
  }

  const displayNotices = notices;

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden">
      {/* Decorative abstract shapes */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Heading */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 sticky top-24"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              বোর্ড নোটিশ <br className="hidden lg:block"/> ও বিজ্ঞপ্তি
            </h2>
            <Link href="/notices" className="inline-flex items-center gap-2 text-base font-bold text-white bg-primary px-6 py-3.5 rounded-xl hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 transition-all group">
              সকল নোটিশ দেখুন
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right Column: Notice List */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {displayNotices.slice(0, 4).map((notice: any, index: number) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/notices/${notice.id}`} className="block group">
                  <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row gap-6 sm:gap-8 items-start hover:-translate-y-1">
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Left Date Block */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-muted/50 rounded-xl border border-border/50 min-w-[100px] group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                      <CalendarDays className="w-6 h-6 text-primary group-hover:text-white mb-2 transition-colors" />
                      <span className="text-2xl font-black text-foreground group-hover:text-white transition-colors">{formatDate(notice.created_at || new Date()).split(" ")[0]}</span>
                      <span className="text-sm font-bold text-muted-foreground uppercase group-hover:text-white/80 transition-colors">{formatDate(notice.created_at || new Date()).split(" ")[1]} {formatDate(notice.created_at || new Date()).split(" ")[2]}</span>
                    </div>

                    {/* Right Content Block */}
                    <div className="flex-grow flex flex-col">
                      <div className="flex items-center flex-wrap gap-3 mb-3">
                        {notice.isPinned && (
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-red-500 px-2.5 py-1 rounded-md shadow-sm">
                            <Pin className="w-3.5 h-3.5" />
                            PINNED
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                          {notice.type || "Update"}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground ml-auto bg-muted px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(notice.created_at || new Date())}
                        </span>
                      </div>

                      <h4 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                        {notice.title}
                      </h4>

                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base line-clamp-2">
                        {notice.description || notice.content}
                      </p>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
