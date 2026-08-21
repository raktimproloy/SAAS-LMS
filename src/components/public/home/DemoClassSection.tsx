"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

type DemoVideo = {
  id: number;
  video_url: string;
};

export function DemoClassSection({ videos = [], sectionTitle }: { videos?: DemoVideo[], sectionTitle?: string }) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  // Extract video ID from standard YouTube links to create embed URL
  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const v = urlObj.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (urlObj.hostname === "youtu.be") return `https://www.youtube.com/embed${urlObj.pathname}`;
      if (url.includes("youtube.com/embed")) return url;
      return url;
    } catch {
      return url;
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {sectionTitle || "ফ্রি ডেমো ক্লাসসমূহ"}
          </h2>
        </div>

        <div className="relative group/slider px-12">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            speed={800}
            autoplay={{
              delay: 3000,
              pauseOnMouseEnter: true,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              }
            }}
            className="pb-10 pt-4"
          >
            {videos.map((video, index) => (
              <SwiperSlide key={video.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full aspect-video rounded-3xl overflow-hidden bg-muted border border-border/50 shadow-xl relative"
                >
                  <iframe
                    src={getEmbedUrl(video.video_url)}
                    title="Demo Class"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button 
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-border shadow-md text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-border shadow-md text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
