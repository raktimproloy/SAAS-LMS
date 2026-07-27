"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { HeroSection } from "@/components/public/home/HeroSection";
import { TeacherBioSection } from "@/components/public/home/TeacherBioSection";
import { FeaturesSection } from "@/components/public/home/FeaturesSection";
import { OfflineCoursesSection } from "@/components/public/home/OfflineCoursesSection";
import { GallerySection } from "@/components/public/home/GallerySection";
import { PopularCoursesSection } from "@/components/public/home/PopularCoursesSection";
import { VideoCourseSection } from "@/components/public/home/VideoCourseSection";
import { NoticeBoardSection } from "@/components/public/home/NoticeBoardSection";
import { ReviewSection } from "@/components/public/home/ReviewSection";
import { ContactSection } from "@/components/public/home/ContactSection";
import { MapSection } from "@/components/public/home/MapSection";
import { CTABannerSection } from "@/components/public/home/CTABannerSection";

export default function HomePage() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 50 });
  }, []);

  return (
    <div className="bg-background">
      <HeroSection />
      <TeacherBioSection />
      <FeaturesSection />
      <OfflineCoursesSection />
      <GallerySection />
      <VideoCourseSection />
      <NoticeBoardSection />
      <ReviewSection />
      <ContactSection />
      <MapSection />
    </div>
  );
}
