"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, Clock, Calendar, Users, Loader2, Send, CheckCircle2 } from "lucide-react";
import { formatTimeRangeBengali, translateDayToBengali } from "@/lib/bengali";
import { submitContactForm } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  showAll?: boolean; // If true, shows all courses without "see all" link
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

function EnrollDialog({ courseId, courseName }: { courseId: number | string; courseName: string }) {
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitContactForm({
      name: formData.name,
      phone: formData.phone,
      course_id: typeof courseId === "number" ? courseId : parseInt(courseId as string) || undefined,
      message: formData.message,
    });

    if (res.success) {
      setSuccess(true);
      setFormData({ name: "", phone: "", message: "" });
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 3000);
    } else {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          ভর্তি হোন
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ভর্তির জন্য যোগাযোগ করুন</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{courseName}</p>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">ধন্যবাদ!</h4>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
              আপনার তথ্য সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।
            </p>
          </div>
        ) : (
          <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">শিক্ষার্থীর নাম *</label>
              <input
                type="text"
                placeholder="আপনার পূর্ণ নাম"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ফোন নম্বর *</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">মেসেজ (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                placeholder="আপনার কিছু জানার থাকলে এখানে লিখুন..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {submitting ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PopularCoursesSection({ courses, showAll = false }: PopularCoursesSectionProps) {
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
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.1 }}
                  className="bg-card/70 backdrop-blur-xl border border-border/60 rounded-xl overflow-hidden"
                >
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 px-5 py-4 min-h-[56px] text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="flex-1 min-w-0 font-semibold text-foreground text-base sm:text-lg line-clamp-2 text-wrap">
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
                          <div className="flex items-center justify-between py-4">
                            <p className="text-sm text-muted-foreground">
                              এই কোর্সে এখন কোনো ব্যাচ নেই।
                            </p>
                            <EnrollDialog courseId={c.id} courseName={c.title} />
                          </div>
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
                                  <div className="flex items-center gap-3">
                                    <EnrollDialog courseId={c.id} courseName={c.title} />
                                  </div>
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
