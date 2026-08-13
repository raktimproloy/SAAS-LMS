"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, Star, ArrowRight, Sparkles, GraduationCap, ChevronDown, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import { VideoCourseSection } from "@/components/public/home/VideoCourseSection";
import { ContactSection } from "@/components/public/home/ContactSection";
import { OfflineCoursesSection } from "@/components/public/home/OfflineCoursesSection";

const courses = [
  {
    title: "HSC '25 - ফার্স্ট ইয়ার ফুল কোর্স",
    students: "1200+",
    rating: 4.9,
    badge: "Most Popular",
    color: "from-purple-500/20 to-purple-500/0",
    borderHover: "hover:border-purple-500/50",
    iconColor: "text-purple-400",
    batches: [
      { id: 1, name: "Morning Batch", time: "০৮:০০ AM - ১০:০০ AM", days: "রবি, মঙ্গল, বৃহস্পতি", status: "Open" },
      { id: 2, name: "Evening Batch", time: "০৪:০০ PM - ০৬:০০ PM", days: "সোম, বুধ, শুক্র", status: "Filling Fast" },
    ]
  },
  {
    title: "মেডিকেল ভর্তি স্পেশাল ব্যাচ",
    students: "800+",
    rating: 4.8,
    badge: "Trending",
    color: "from-rose-500/20 to-rose-500/0",
    borderHover: "hover:border-rose-500/50",
    iconColor: "text-rose-400",
    batches: [
      { id: 3, name: "Pre-Medical", time: "০৩:০০ PM - ০৬:০০ PM", days: "শুক্র, শনি", status: "House Full" },
      { id: 4, name: "Regular Batch", time: "১০:০০ AM - ০১:০০ PM", days: "রবি, বুধ", status: "Open" },
    ]
  },
  {
    title: "HSC '24 - রিভিশন ও মডেল টেস্ট",
    students: "500+",
    rating: 4.7,
    badge: "New",
    color: "from-emerald-500/20 to-emerald-500/0",
    borderHover: "hover:border-emerald-500/50",
    iconColor: "text-emerald-400",
    batches: [
      { id: 5, name: "Crash Course", time: "০২:০০ PM - ০৪:০০ PM", days: "প্রতিদিন", status: "Open" },
    ]
  },
  {
    title: "বায়োলজি প্র্যাকটিক্যাল কোর্স",
    students: "600+",
    rating: 4.8,
    badge: "Top Rated",
    color: "from-blue-500/20 to-blue-500/0",
    borderHover: "hover:border-blue-500/50",
    iconColor: "text-blue-400",
    batches: [
      { id: 6, name: "Lab Batch 1", time: "০৯:০০ AM - ১২:০০ PM", days: "শনি", status: "Open" },
    ]
  },
  {
    title: "NEET Preparation (Biology)",
    students: "700+",
    rating: 4.6,
    badge: "Premium",
    color: "from-amber-500/20 to-amber-500/0",
    borderHover: "hover:border-amber-500/50",
    iconColor: "text-amber-400",
    batches: [
      { id: 7, name: "Online Batch", time: "০৮:০০ PM - ১০:০০ PM", days: "রবি, মঙ্গল, বৃহস্পতি", status: "Open" },
    ]
  },
  {
    title: "জেনারেল নলেজ ও ইংলিশ",
    students: "900+",
    rating: 4.7,
    badge: "Recommended",
    color: "from-cyan-500/20 to-cyan-500/0",
    borderHover: "hover:border-cyan-500/50",
    iconColor: "text-cyan-400",
    batches: [
      { id: 8, name: "Weekend Batch", time: "০৪:০০ PM - ০৬:০০ PM", days: "শুক্র, শনি", status: "Open" },
    ]
  },
];

export default function CoursesPage() {
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 50 });
  }, []);

  const toggleCourse = (idx: number) => {
    setExpandedCourse(prev => prev === idx ? null : idx);
  };

  return (
    <div className="bg-background">

      {/* Course Page Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div data-aos="fade-down">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              ক্যারিয়ার গড়ার <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">সঠিক গাইডলাইন</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              আপনার লক্ষ্য অনুযায়ী আমাদের প্রফেশনাল ও গোছানো কোর্সগুলো বেছে নিন এবং মেডিকেল ভর্তির প্রস্তুতিতে এক ধাপ এগিয়ে থাকুন।
            </p>
          </div>
        </div>
      </section>

      {/* All Courses Grid Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">আমাদের কোর্সসমূহ</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
              আপনার প্রয়োজন অনুযায়ী সেরা কোর্সটি বেছে নিন এবং প্রস্তুতি শুরু করুন।
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {courses.map((course, idx) => {
              const isExpanded = expandedCourse === idx;

              return (
                <div
                  key={idx}
                  data-aos="fade-up"
                  data-aos-delay={(idx % 5) * 50}
                  className={`group relative bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl transition-all duration-300 ${course.borderHover} hover:shadow-xl overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${course.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div
                    className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 cursor-pointer gap-4"
                    onClick={() => toggleCourse(idx)}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center border border-border/50 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300 ${course.iconColor}`}>
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                            {course.badge}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-0 border-border/40 pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <div className="flex items-center gap-5 text-sm text-foreground/70 shrink-0">
                        <div className="flex items-center gap-1.5" title="Students">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{course.students}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Rating">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-semibold">{course.rating}</span>
                        </div>
                      </div>

                      <button
                        className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary shrink-0 transition-colors"
                        aria-label="Expand course details"
                      >
                        <ChevronDown className={`w-5 h-5 text-primary group-hover:text-primary-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Batches Expanded Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="relative z-10 overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-border/40 bg-muted/20">
                          <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider text-primary/80">Available Batches</h4>
                          <div className="flex flex-col gap-3">
                            {course.batches.map(batch => (
                              <div key={batch.id} className="bg-background/80 border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-base text-foreground">{batch.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${batch.status === 'Open' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                                        batch.status === 'Filling Fast' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                                          'bg-red-500/10 text-red-600 border border-red-500/20'
                                      }`}>
                                      {batch.status}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4" /> {batch.time}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4" /> {batch.days}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  <Link href={`/courses/${idx + 1}`}>
                                    <button className="w-full sm:w-auto px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold rounded-lg text-sm transition-colors">
                                      Enroll Now
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Offline Batches Section */}
      {/* <OfflineCoursesSection /> */}

      {/* Video Course Section */}
      <VideoCourseSection />

      {/* Contact Section */}
      <ContactSection />

    </div>
  );
}
