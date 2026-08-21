"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Building2, Target, History, Trophy, Users, GraduationCap, Quote } from "lucide-react";
import Image from "next/image";

import { HeroTeacherSection } from "@/components/public/home/HeroTeacherSection";
import { TeacherBioSection } from "@/components/public/home/TeacherBioSection";
import { GallerySection } from "@/components/public/home/GallerySection";
import { MapSection } from "@/components/public/home/MapSection";
import { ContactSection } from "@/components/public/home/ContactSection";

const stats = [
  { id: 1, label: "সর্বমোট শিক্ষার্থী", value: "৫০০০+", icon: Users, color: "text-blue-500" },
  { id: 2, label: "সাফল্যের হার", value: "৯৮%", icon: Trophy, color: "text-emerald-500" },
  { id: 3, label: "অভিজ্ঞ শিক্ষক", value: "১৫+", icon: GraduationCap, color: "text-purple-500" },
  { id: 4, label: "প্রতিষ্ঠা সাল", value: "২০১৫", icon: History, color: "text-rose-500" },
];

export default function AboutPage() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 50 });
  }, []);

  return (
    <div>
      <HeroTeacherSection teacher={null} hideButtons={true} showStatsCards={true} />


      {/* 4. Teacher Bio Section */}
      <TeacherBioSection />

      {/* 5. Gallery Section */}
      <GallerySection />

      {/* 6. Location (Map) */}
      <MapSection />

      {/* 7. Contact Section */}
      <ContactSection />

    </div>
  );
}
