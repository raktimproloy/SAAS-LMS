"use client";

import { useEffect } from "react";
import { BookOpen, Users, Star, ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
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
    iconColor: "text-purple-400"
  },
  {
    title: "মেডিকেল ভর্তি স্পেশাল ব্যাচ",
    students: "800+",
    rating: 4.8,
    badge: "Trending",
    color: "from-rose-500/20 to-rose-500/0",
    borderHover: "hover:border-rose-500/50",
    iconColor: "text-rose-400"
  },
  {
    title: "HSC '24 - রিভিশন ও মডেল টেস্ট",
    students: "500+",
    rating: 4.7,
    badge: "New",
    color: "from-emerald-500/20 to-emerald-500/0",
    borderHover: "hover:border-emerald-500/50",
    iconColor: "text-emerald-400"
  },
  {
    title: "বায়োলজি প্র্যাকটিক্যাল কোর্স",
    students: "600+",
    rating: 4.8,
    badge: "Top Rated",
    color: "from-blue-500/20 to-blue-500/0",
    borderHover: "hover:border-blue-500/50",
    iconColor: "text-blue-400"
  },
  {
    title: "NEET Preparation (Biology)",
    students: "700+",
    rating: 4.6,
    badge: "Premium",
    color: "from-amber-500/20 to-amber-500/0",
    borderHover: "hover:border-amber-500/50",
    iconColor: "text-amber-400"
  },
  {
    title: "জেনারেল নলেজ ও ইংলিশ",
    students: "900+",
    rating: 4.7,
    badge: "Recommended",
    color: "from-cyan-500/20 to-cyan-500/0",
    borderHover: "hover:border-cyan-500/50",
    iconColor: "text-cyan-400"
  },
];

export default function CoursesPage() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 50 });
  }, []);

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

      {/* Offline Batches Section */}
      <OfflineCoursesSection />

      {/* Video Course Section */}
      <VideoCourseSection />

      {/* Contact Section */}
      <ContactSection />

    </div>
  );
}
