"use client";

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { Video, PlayCircle, Users, FileText, ClipboardList, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const fallbackVideoCourses = [
  {
    id: 1,
    bgImage: "https://images.unsplash.com/photo-1614036634955-ae5e90f9cb9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    theme: "purple",
    bengaliTitle: "জীববিজ্ঞান ১ম পত্র",
    subtitle: "১২টি অধ্যায়ের ক্লাস",
    badge: "অফলাইন রেকর্ডেড ক্লাস",
    englishTitle: "BIOLOGY 1st PAPER - Full Cover",
    price: "2,500 Tk",
    instructor: "ডাঃ রাকিবুল ইসলাম",
    description: "জীববিজ্ঞান ১ম পত্রের প্রতিটি অধ্যায়ের লাইন-বাই-লাইন বিশ্লেষণ। উদ্ভিদবিজ্ঞানের কঠিন বিষয়গুলোকে একদম সহজভাবে উপস্থাপন করা হয়েছে এই কোর্সে।",
    students: "1,500+",
    stats: [
      { label: "120+", desc: "Class Notes" },
      { label: "50+", desc: "Assignments" },
      { label: "20+", desc: "Exams" }
    ]
  },
  {
    id: 2,
    bgImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    theme: "emerald",
    bengaliTitle: "জীববিজ্ঞান ২য় পত্র",
    subtitle: "১৪টি অধ্যায়ের ক্লাস",
    badge: "অফলাইন রেকর্ডেড ক্লাস",
    englishTitle: "BIOLOGY 2nd PAPER - Full Cover",
    price: "2,500 Tk",
    instructor: "ডাঃ রাকিবুল ইসলাম",
    description: "প্রাণিবিজ্ঞানের ১৪টি অধ্যায়ের খুঁটিনাটি সবকিছু। মানবদেহ থেকে শুরু করে জিনতত্ত্ব পর্যন্ত সবকিছু বাস্তব উদাহরণসহ বোঝানো হয়েছে।",
    students: "1,200+",
    stats: [
      { label: "140+", desc: "Class Notes" },
      { label: "60+", desc: "Assignments" },
      { label: "25+", desc: "Exams" }
    ]
  },
  {
    id: 3,
    bgImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    theme: "blue",
    bengaliTitle: "মেডিকেল বায়োলজি",
    subtitle: "সকল অধ্যায়ের ক্লাস",
    badge: "অফলাইন রেকর্ডেড ক্লাস",
    englishTitle: "MEDICAL BIOLOGY - Full Cover",
    price: "4,000 Tk",
    instructor: "ডাঃ রাকিবুল ইসলাম",
    description: "মেডিকেল ভর্তি পরীক্ষার জন্য জীববিজ্ঞানের একটি মাস্টারক্লাস। বিগত ১০ বছরের প্রশ্ন এনালাইসিস করে তৈরি করা স্পেশাল কারিকুলাম।",
    students: "3,000+",
    stats: [
      { label: "200+", desc: "Class Notes" },
      { label: "100+", desc: "Assignments" },
      { label: "50+", desc: "Mega Exams" }
    ]
  }
];

const getThemeClasses = (theme: string) => {
  switch (theme) {
    case 'purple': return 'from-purple-900 via-purple-700/80 to-purple-500/30';
    case 'emerald': return 'from-emerald-900 via-emerald-700/80 to-emerald-500/30';
    case 'blue': return 'from-sky-900 via-sky-700/80 to-sky-500/30';
    case 'orange': return 'from-orange-900 via-orange-700/80 to-orange-500/30';
    default: return 'from-indigo-900 via-indigo-700/80 to-indigo-500/30';
  }
};

const getThemeGlow = (theme: string) => {
  switch (theme) {
    case 'purple': return 'bg-purple-500/20';
    case 'emerald': return 'bg-emerald-500/20';
    case 'blue': return 'bg-sky-500/20';
    case 'orange': return 'bg-orange-500/20';
    default: return 'bg-indigo-500/20';
  }
};

interface VideoCourseSectionProps {
  videoCourses?: any[];
}

export function VideoCourseSection({ videoCourses }: VideoCourseSectionProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);

  if (!videoCourses || videoCourses.length === 0) {
    return null;
  }

  const displayVideoCourses = videoCourses.map((c, i) => ({
    id: c.id,
    bgImage: c.thumbnail || "https://images.unsplash.com/photo-1614036634955-ae5e90f9cb9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    theme: ["purple", "emerald", "blue", "orange"][i % 4],
    bengaliTitle: c.title,
    subtitle: "সম্পূর্ণ কোর্স",
    badge: "ভিডিও কোর্স",
    englishTitle: c.title,
    price: c.is_free ? "Free" : `${c.price} Tk`,
    instructor: "Expert Instructor",
    description: c.description || "একটি সেরা মানের ভিডিও কোর্স যা আপনার প্রস্তুতিকে করবে আরো সহজ।",
    students: "500+",
    stats: [
      { label: "100+", desc: "Class Notes" },
      { label: "20+", desc: "Assignments" },
      { label: "10+", desc: "Exams" }
    ]
  }));

  const isLoopable = displayVideoCourses.length > 2;
  const displayCourses = isLoopable
    ? [...displayVideoCourses, ...displayVideoCourses].map((c, i) => ({ ...c, uniqueId: `${c.id}-${i}` }))
    : displayVideoCourses.map((c, i) => ({ ...c, uniqueId: `${c.id}-${i}` }));

  const activeCourse = displayVideoCourses[activeCourseIndex % displayVideoCourses.length];

  const handleMouseEnter = () => {
    if (swiperInstance && swiperInstance.autoplay) {
      swiperInstance.autoplay.stop();
    }
  };

  const handleMouseLeave = () => {
    if (swiperInstance && swiperInstance.autoplay) {
      swiperInstance.autoplay.start();
    }
  };

  return (
    <section className="py-16 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">সকল রেকর্ডেড ক্লাস</h2>
        </motion.div>
      </div>

      <motion.div
        className="w-full relative z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="pb-8">
          <Swiper
            onSwiper={setSwiperInstance}
            onRealIndexChange={(swiper) => setActiveCourseIndex(swiper.realIndex)}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={isLoopable}
            coverflowEffect={{
              rotate: 20,
              stretch: 0,
              depth: 250,
              modifier: 1,
              slideShadows: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            modules={[EffectCoverflow, Pagination, Autoplay]}
            className="video-courses-slider w-full !pt-10 !pb-14 px-4"
          >
            {displayCourses.map((course) => (
              <SwiperSlide key={course.uniqueId} className="!w-[80vw] sm:!w-[500px] lg:!w-[600px]">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"
                    style={{ backgroundImage: `url(${course.bgImage})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${getThemeClasses(course.theme)}`} />
                  <div className="absolute inset-0 bg-black/30" />

                  <div className="relative h-full flex flex-col justify-between p-5 sm:p-8 text-center">
                    <div className="mt-4 sm:mt-6">
                      <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 sm:mb-3 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
                        {course.bengaliTitle}
                      </h3>
                      <p className="text-sm sm:text-base font-bold text-white filter drop-shadow-md">
                        {course.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 my-auto">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                        <PlayCircle className="w-8 h-8 ml-1" />
                      </div>

                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-black/20">
                        <Video className="w-4 h-4 text-primary" />
                        {course.badge}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 text-left bg-gradient-to-t from-black/95 via-black/80 to-transparent p-5 sm:p-6 pt-8 sm:pt-10">
                      <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/70 mb-1">
                        ACADEMIC PROGRAM
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-white mb-3">
                        {course.englishTitle}
                      </h4>

                      <div className="flex justify-between items-end">
                        <div className="text-xl sm:text-2xl font-black text-white">
                          {course.price}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-white/70">
                          Instructor: <span className="text-white">{course.instructor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </motion.div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .video-courses-slider .swiper-slide {
          transition: filter 0.6s ease;
        }
        .video-courses-slider .swiper-slide:not(.swiper-slide-active) {
          filter: blur(5px) brightness(0.6);
        }
        .video-courses-slider .swiper-pagination-bullet {
          background-color: rgba(100, 116, 139, 0.5) !important;
          opacity: 1 !important;
        }
        .video-courses-slider .swiper-pagination-bullet-active {
          background-color: hsl(var(--primary)) !important;
          width: 24px !important;
          border-radius: 8px !important;
        }
      `}} />
    </section>
  );
}
