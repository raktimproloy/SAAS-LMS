"use client";

import { useEffect } from "react";
import { Headphones, MessageSquareText } from "lucide-react";

import { ContactSection } from "@/components/public/home/ContactSection";
import { MapSection } from "@/components/public/home/MapSection";
import { ReviewSection } from "@/components/public/home/ReviewSection";

export default function ContactPage() {

  return (
    <div>

      {/* Contact Page Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div data-aos="fade-down">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              আমরা আছি আপনার <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">যেকোনো প্রয়োজনে</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              ভর্তি সংক্রান্ত যেকোনো তথ্য, কোর্সের বিস্তারিত বা যেকোনো জিজ্ঞাসা থাকলে আমাদের সাথে যোগাযোগ করুন। আমাদের সাপোর্ট টিম সবসময় প্রস্তুত আপনার সহায়তায়।
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <div className="-mt-10 relative z-20">
        <ContactSection />
      </div>

      {/* Map Section */}
      <MapSection />

      {/* Reviews Section */}
      <ReviewSection />

    </div>
  );
}
