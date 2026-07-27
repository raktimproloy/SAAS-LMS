"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ArrowRight, Users, BookOpen, Trophy, Clock } from "lucide-react";

const stats = [
  { label: "ছাত্রছাত্রী", value: "5,000+", icon: Users },
  { label: "কোর্স", value: "50+", icon: BookOpen },
  { label: "সফলতা", value: "98%", icon: Trophy },
  { label: "বছরের অভিজ্ঞতা", value: "8+", icon: Clock },
];

function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "লাইভ ক্লাস"
    },
    {
      image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "মডেল টেস্ট"
    },
    {
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "স্টাডি ম্যাটেরিয়াল"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 group-hover:scale-110"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-12 left-0 right-0 text-center px-4">
            <h3 className="text-white text-2xl font-bold">{slide.title}</h3>
          </div>
        </div>
      ))}
      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-6" : "bg-white/50 w-2 hover:bg-white/80"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{ background: "linear-gradient(135deg, hsl(210 100% 18%) 0%, hsl(210 100% 28%) 50%, hsl(217 25% 18%) 100%)" }}>
      {/* Animated blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-3xl animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-white/5 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-white/5 rounded-full filter blur-3xl animate-blob animation-delay-4000" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`, backgroundSize: "32px 32px" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center pb-12 lg:pb-0">
          {/* Left Column: Text & CTA */}
          <div className="text-left pt-12 lg:pt-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6"
            >
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
              বাংলাদেশের #১ মেডিকেল এডুকেশন প্ল্যাটফর্ম
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight"
            >
              মেডিকেল ভর্তি{" "}
              <span className="text-sky-300">স্বপ্নকে</span>
              <br />
              বাস্তবে রূপ দিন
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-white/70 text-lg sm:text-xl max-w-xl leading-relaxed"
            >
              অনলাইন ক্লাস, মডেল টেস্ট, স্টাডি মেটেরিয়াল ও পার্সোনালাইজড গাইডেন্স দিয়ে
              মেডিকেল ভর্তি পরীক্ষার জন্য নিজেকে প্রস্তুত করুন।
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              <Link href="/student/login"
                className="group px-8 py-4 rounded-2xl bg-white text-primary font-bold text-base shadow-2xl hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
                এখনই শুরু করুন
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/courses"
                className="px-8 py-4 rounded-2xl border border-white/25 text-white font-semibold text-base hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex justify-center w-full sm:w-auto">
                কোর্স দেখুন
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl bg-white/8 border border-white/10 backdrop-blur-sm p-4 text-center">
                    <Icon className="h-5 w-5 text-sky-300 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/60 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Right Column: Hero Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-full aspect-[4/3] lg:aspect-[4/4] xl:aspect-[4/4] max-w-lg mx-auto lg:max-w-none"
          >
            <HeroSlider />
          </motion.div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            className="fill-background" />
        </svg>
      </div>
    </section>
  );
}
