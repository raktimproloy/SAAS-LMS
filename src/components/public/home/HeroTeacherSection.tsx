"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Teacher } from "@prisma/client";
import { HeartPulse, BookOpen, Star } from "lucide-react";

interface HeroTeacherSectionProps {
  teacher: Teacher | null;
}

export function HeroTeacherSection({ teacher }: HeroTeacherSectionProps) {
  // Fallback for UI if teacher not found
  const name = teacher?.name || "ডাঃ রাকিবুল ইসলাম";
  const bio = teacher?.bio || "বিগত ১০ বছর ধরে মেডিকেল ভর্তিচ্ছু শিক্ষার্থীদের জীববিজ্ঞানের ভয় দূর করে তাদের স্বপ্ন পূরণে কাজ করে যাচ্ছি। আমার লক্ষ্য হলো প্রতিটি শিক্ষার্থী যেন শুধু মুখস্থ না করে, বরং বুঝে শিখতে পারে।";
  const image = teacher?.photo || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  return (
    <section className="relative min-h-[60vh] flex items-center pt-16 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left: Image */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] max-w-sm mx-auto lg:max-w-none lg:mx-0 w-full rounded-[2.5rem] overflow-hidden animated-premium-glass">
              {/* Premium Inner Glow & border */}
              <div className="absolute inset-0 border border-white/20 rounded-[2.5rem] z-20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent z-10 mix-blend-overlay pointer-events-none" />
              
              <Image 
                src={image} 
                alt={name} 
                fill 
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Floating Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute bottom-4 left-0 right-0 mx-auto w-[85%] bg-background/80 backdrop-blur-xl border border-border p-3 rounded-2xl shadow-2xl z-20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base">Top Rated Instructor</h4>
                    <p className="text-xs text-foreground/90">99% Success Rate</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Bio & Info */}
          <div className="order-1 lg:order-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs mb-4 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Founder & Lead Instructor
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl md:leading-tight font-extrabold text-foreground mb-2">
                <span className="gradient-text">{name}</span>
              </h1>
              <h3 className="text-lg sm:text-xl text-foreground font-semibold mb-4">
                MBBS (DMC), FCPS (Medicine)
              </h3>
              
              <p className="text-foreground text-base leading-relaxed max-w-xl">
                {bio}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 max-w-xl"
            >
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors shadow-sm group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">১০,০০০+</h4>
                  <p className="text-sm text-foreground/90">সফল শিক্ষার্থী</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-sky-500/50 transition-colors shadow-sm group">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">১০+ বছর</h4>
                  <p className="text-sm text-foreground/90">অভিজ্ঞতা</p>
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
