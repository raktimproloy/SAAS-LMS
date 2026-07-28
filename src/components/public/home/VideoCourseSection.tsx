"use client";

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { Video, PlayCircle, Users, FileText, ClipboardList, PenTool, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const videoCourses = [
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
  },
  {
    id: 4,
    bgImage: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    theme: "orange",
    bengaliTitle: "রসায়ন ১ম পত্র",
    subtitle: "৫টি অধ্যায়ের ক্লাস",
    badge: "অফলাইন রেকর্ডেড ক্লাস",
    englishTitle: "CHEMISTRY 1st PAPER - Full Cover",
    price: "2,999 Tk",
    instructor: "ইঞ্জিঃ ইশতিয়াক",
    description: "রসায়নের ভয়কে জয় করার কোর্স। বেসিক থেকে শুরু করে এডভান্সড লেভেলের ম্যাথ সলভিং করানো হয়েছে এই রেকর্ডেড ক্লাসে।",
    students: "900+",
    stats: [
      { label: "80+", desc: "Class Notes" },
      { label: "40+", desc: "Assignments" },
      { label: "15+", desc: "Exams" }
    ]
  }
];

const getThemeClasses = (theme: string) => {
  switch (theme) {
    case 'purple': return 'from-purple-900 via-purple-700/80 to-purple-500/30';
    case 'emerald': return 'from-emerald-900 via-emerald-700/80 to-emerald-500/30';
    case 'blue': return 'from-sky-900 via-sky-700/80 to-sky-500/30';
    case 'orange': return 'from-orange-900 via-orange-700/80 to-orange-500/30';
    default: return 'from-gray-900 via-gray-700/80 to-gray-500/30';
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

export function VideoCourseSection() {
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);

  // If there are only 1 or 2 courses, we disable loop to avoid breaking the UI.
  const isLoopable = videoCourses.length > 2;
  const displayCourses = isLoopable
    ? [...videoCourses, ...videoCourses].map((c, i) => ({ ...c, uniqueId: `${c.id}-${i}` }))
    : videoCourses.map((c, i) => ({ ...c, uniqueId: `${c.id}-${i}` }));

  // Get the real active course based on modulo arithmetic
  const activeCourse = videoCourses[activeCourseIndex % videoCourses.length];

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
    <section className="py-24 overflow-hidden relative bg-muted/40">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">সকল রেকর্ডেড ক্লাস</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            যেকোনো সময়, যেকোনো জায়গা থেকে সেরা শিক্ষকদের অফলাইন রেকর্ডেড ক্লাসের মাধ্যমে নিজের প্রস্তুতি সম্পন্ন করুন।
          </p>
        </div>
      </div>

      {/* Wrapper to handle pause on hover/touch for both slider and description */}
      <div
        className="w-full relative z-10"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        {/* Swiper Slider */}
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
              <SwiperSlide key={course.uniqueId} className="!w-[85vw] sm:!w-[600px] lg:!w-[700px]">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">

                  {/* Background Image & Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"
                    style={{ backgroundImage: `url(${course.bgImage})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${getThemeClasses(course.theme)}`} />
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 text-center">

                    {/* Top: Title */}
                    <div className="mt-4 sm:mt-6">
                      <h3 className="text-3xl sm:text-5xl font-black text-white mb-2 sm:mb-4 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
                        {course.bengaliTitle}
                      </h3>
                      <p className="text-base sm:text-lg font-semibold text-white/90 filter drop-shadow-md">
                        {course.subtitle}
                      </p>
                    </div>

                    {/* Middle: Badge & Play Icon */}
                    <div className="flex flex-col items-center justify-center gap-4 my-auto">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                        <PlayCircle className="w-8 h-8 ml-1" />
                      </div>

                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#e2e8f0]/90 text-slate-800 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-black/20">
                        <Video className="w-4 h-4 text-red-600" />
                        {course.badge}
                      </span>
                    </div>

                    {/* Bottom: Info Bar */}
                    <div className="absolute bottom-0 left-0 right-0 text-left bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 sm:p-8 pt-12 sm:pt-16">
                      <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/50 mb-1">
                        ACADEMIC PROGRAM
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-white mb-3">
                        {course.englishTitle}
                      </h4>

                      <div className="flex justify-between items-end">
                        <div className="text-xl sm:text-2xl font-black text-white">
                          {course.price}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-white/50">
                          Instructor: <span className="text-white/80">{course.instructor}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Dynamic Course Description Area */}
        <div className="max-w-4xl mx-auto px-4 mt-2 sm:mt-6 h-auto sm:h-[200px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCourse.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full bg-card border border-border rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 ${getThemeGlow(activeCourse.theme)} rounded-full blur-[60px] pointer-events-none`} />

              <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-10 relative z-10">
                {/* Left side: Title and Description */}
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {activeCourse.englishTitle}
                    </h4>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-foreground/80 text-xs font-semibold border border-border">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {activeCourse.students}
                    </div>
                  </div>

                  <div className="flex sm:hidden items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-foreground/80 text-xs font-semibold border border-border w-fit mb-4">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {activeCourse.students}
                  </div>

                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed pr-0 sm:pr-8">
                    {activeCourse.description}
                  </p>
                </div>

                {/* Right side: Stats / Tags */}
                <div className="w-full sm:w-auto shrink-0 grid grid-cols-3 sm:grid-cols-1 gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-border pt-6 sm:pt-0 sm:pl-10">
                  {activeCourse.stats.map((stat, idx) => {
                    const Icon = idx === 0 ? FileText : idx === 1 ? ClipboardList : PenTool;
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left group/stat cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 group-hover/stat:bg-muted/80 transition-colors">
                          <Icon className="w-5 h-5 text-primary/80 group-hover/stat:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-foreground">{stat.label}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.desc}</div>
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
          background-color: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #6366f1 !important;
          width: 24px !important;
          border-radius: 8px !important;
        }
      `}} />
    </section>
  );
}
