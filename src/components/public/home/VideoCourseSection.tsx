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

  const displayVideoCourses = videoCourses && videoCourses.length > 0 ? videoCourses.map((c, i) => ({
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
  })) : fallbackVideoCourses;

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
          <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Video Library</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-4">সকল রেকর্ডেড ক্লাস</h2>
          <p className="text-foreground max-w-xl mx-auto text-base">
            যেকোনো সময়, যেকোনো জায়গা থেকে সেরা শিক্ষকদের অফলাইন রেকর্ডেড ক্লাসের মাধ্যমে নিজের প্রস্তুতি সম্পন্ন করুন।
          </p>
        </motion.div>
      </div>

      <div
        className="w-full relative z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
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
            className="w-full !pt-10 !pb-14 px-4"
          >
            {displayCourses.map((course) => (
              <SwiperSlide key={course.uniqueId} className="!w-[80vw] sm:!w-[500px] lg:!w-[600px]">
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
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

        <div className="max-w-3xl mx-auto px-4 mt-2 sm:mt-6 h-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCourse.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full bg-card/60 border border-border/60 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute -top-24 -right-24 w-48 h-48 ${getThemeGlow(activeCourse.theme)} rounded-full blur-[60px] pointer-events-none`} />

              <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-10 relative z-10">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-xl sm:text-2xl font-bold text-foreground">
                      {activeCourse.englishTitle}
                    </h4>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold border border-primary/20">
                      <Users className="w-3.5 h-3.5" />
                      {activeCourse.students}
                    </div>
                  </div>

                  <p className="text-foreground font-medium text-sm sm:text-base leading-relaxed pr-0 sm:pr-8">
                    {activeCourse.description}
                  </p>
                </div>

                <div className="w-full sm:w-auto shrink-0 grid grid-cols-3 sm:grid-cols-1 gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-border pt-6 sm:pt-0 sm:pl-10">
                  {activeCourse.stats.map((stat, idx) => {
                    const Icon = idx === 0 ? FileText : idx === 1 ? ClipboardList : PenTool;
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left group/stat cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 shadow-sm group-hover/stat:border-primary/50 transition-colors">
                          <Icon className="w-5 h-5 text-primary group-hover/stat:scale-110 transition-transform" />
                        </div>
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-foreground">{stat.label}</div>
                          <div className="text-xs font-bold text-foreground/90 uppercase tracking-wider">{stat.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .swiper-slide {
          transition: filter 0.6s ease;
        }
        .swiper-slide:not(.swiper-slide-active) {
          filter: blur(5px) brightness(0.6);
        }
        .swiper-pagination-bullet {
          background-color: rgba(100, 116, 139, 0.5) !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background-color: hsl(var(--primary)) !important;
          width: 24px !important;
          border-radius: 8px !important;
        }
      `}} />
    </section>
  );
}
