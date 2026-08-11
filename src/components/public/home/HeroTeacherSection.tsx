"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Teacher } from "@prisma/client";
import Link from "next/link";
import { LogIn, Download } from "lucide-react";

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
          <div className="relative order-2 lg:order-1 flex justify-center">
            <div className="relative max-w-sm w-full">
              <Image 
                src={image} 
                alt={name} 
                width={400}
                height={500}
                className="object-cover object-top w-full h-auto shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Right: Bio & Info */}
          <div className="order-1 lg:order-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
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
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link 
                href="/student/login"
                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-base shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-10px_hsl(var(--primary))] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <LogIn className="w-5 h-5 relative z-10" />
                <span className="relative z-10 text-white">Student Login</span>
              </Link>

              <button 
                className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-6 py-4 bg-card border-2 border-primary/20 text-foreground rounded-lg font-bold text-base shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 text-primary">
                  <Download className="w-4 h-4" />
                </div>
                <span>Install App</span>
              </button>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
