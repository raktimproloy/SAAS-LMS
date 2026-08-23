import { Building2, Target, History, Trophy, Users, GraduationCap, Quote } from "lucide-react";
import Image from "next/image";
import prisma from "@/lib/db";

import { TeacherBioSection } from "@/components/public/home/TeacherBioSection";
import { GallerySection } from "@/components/public/home/GallerySection";
import { MapSection } from "@/components/public/home/MapSection";
import { ContactSection } from "@/components/public/home/ContactSection";
import { AboutStatsCards } from "@/components/public/about/AboutStatsCards";
import { AOSInit } from "./AOSInit";

export default async function AboutPage() {
  const teacher = await prisma.teacher.findFirst({
    orderBy: { created_at: "asc" }
  });

  // Parse stats safely
  let stats: any[] = [];
  try {
    stats = typeof teacher?.stats === 'string' ? JSON.parse(teacher.stats) : (teacher?.stats || []);
    if (!Array.isArray(stats)) stats = [];
  } catch(e) {}

  return (
    <div>
      <AOSInit />
      
      {/* 4. Teacher Bio Section */}
      <TeacherBioSection teacher={teacher} />

      {/* 5. Gallery Section */}
      <GallerySection />

      {/* 6. Location (Map) */}
      <MapSection />

      {/* 7. Contact Section */}
      <ContactSection />
    </div>
  );
}
