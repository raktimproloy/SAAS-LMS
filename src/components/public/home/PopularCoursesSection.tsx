"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, Clock, Calendar, Users } from "lucide-react";
import { formatTimeRangeBengali, translateDayToBengali } from "@/lib/bengali";

export interface CourseBatch {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  status: string;
  max_students: number | null;
  class_days: unknown;
}

export interface CompactCourse {
  id: number | string;
  title: string;
  fee: number | null;
  discount_fee: number | null;
  batches?: CourseBatch[];
}

interface PopularCoursesSectionProps {
  courses?: CompactCourse[];
}

const fallbackCourses: CompactCourse[] = [
  {
    id: "1",
    title: "জীববিজ্ঞান (HSC)",
    fee: 5000,
    discount_fee: 3000,
    batches: [
      { id: 1, name: "Morning Batch", start_time: "08:00", end_time: "10:00", status: "active", max_students: 40, class_days: ["রবি", "মঙ্গল", "বৃহস্পতি"] },
      { id: 2, name: "Evening Batch", start_time: "16:00", end_time: "18:00", status: "active", max_students: 40, class_days: ["সোম", "বুধ", "শুক্র"] },
    ],
  },
  {
    id: "2",
    title: "মেডিকেল ভর্তি প্রস্তুতি",
    fee: 15000,
    discount_fee: 12000,
    batches: [
      { id: 3, name: "Regular Batch", start_time: "10:00", end_time: "13:00", status: "active", max_students: 50, class_days: ["রবি", "বুধ"] },
    ],
  },
  {
    id: "3",
    title: "NEET Preparation",
    fee: 20000,
    discount_fee: 18000,
    batches: [],
  },
];

function formatDays(classDays: unknown): string | null {
  if (!classDays) return null;
  if (Array.isArray(classDays) && classDays.length > 0) {
    return classDays.filter((d) => typeof d === "string").map(d => translateDayToBengali(d)).join(", ");
  }
  if (typeof classDays === "string" && classDays.trim()) return translateDayToBengali(classDays);
  return null;
}

function formatPrice(fee: number | null, discountFee: number | null) {
  if (discountFee) {
    return (
      <span className="flex items-baseline gap-1.5 shrink-0">
        {fee ? (
          <span className="text-xs text-muted-foreground line-through">৳{fee}</span>
        ) : null}
        <span className="text-sm font-bold text-foreground">৳{discountFee}</span>
      </span>
    );
  }
  if (fee) {
    return (
      <span className="text-sm font-bold text-foreground shrink-0">
        ৳{fee}
      </span>
    );
  }
  return null;
}

export function PopularCoursesSection({ courses }: PopularCoursesSectionProps) {
  const displayCourses = courses && courses.length > 0 ? courses : fallbackCourses;
  const [openId, setOpenId] = useState<number | string | null>(null);

  const toggle = (id: number | string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              আমাদের কোর্সসমূহ
            </h2>
          </div>
          <Link
            href="/courses"
            className="group flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors text-sm"
          >
            সব কোর্স দেখুন
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="flex flex-col gap-3">
          {displayCourses.map((c, i) => {
            const isOpen = openId === c.id;
            const batches = c.batches ?? [];
            const price = formatPrice(c.fee, c.discount_fee);

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 px-5 py-4 min-h-[56px] text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="flex-1 min-w-0 font-semibold text-foreground text-base sm:text-lg truncate">
                    {c.title}
                  </span>
                  {price}
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1 border-t border-border/50">
                        {batches.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4">
                            এই কোর্সে এখন কোনো ব্যাচ নেই।
                          </p>
                        ) : (
                          <ul className="divide-y divide-border/40">
                            {batches.map((batch) => {
                              const days = formatDays(batch.class_days);
                              return (
                                <li key={batch.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{batch.name}</p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTimeRangeBengali(batch.start_time, batch.end_time)}
                                      </span>
                                      {days && (
                                        <span className="inline-flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {days}
                                        </span>
                                      )}
                                      {batch.max_students ? (
                                        <span className="inline-flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {batch.max_students} seats
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                  <span
                                    className={`self-start sm:self-center text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${batch.status === "active" || batch.status === "PUBLISHED"
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : "bg-muted text-muted-foreground border-border"
                                      }`}
                                  >
                                    {batch.status === "active" || batch.status === "PUBLISHED" ? "Open" : "Closed"}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
