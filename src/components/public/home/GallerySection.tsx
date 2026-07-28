"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Sparkles } from "lucide-react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';

const fallbackImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200", title: "ইন্টারেক্টিভ ক্লাসরুম" },
  { id: 2, src: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200", title: "প্র্যাকটিক্যাল ল্যাব ও এক্সপেরিমেন্ট" },
  { id: 3, src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200", title: "মডেল টেস্ট ও এক্সাম হল" },
  { id: 4, src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200", title: "গ্রুপ স্টাডি ও ডিসকাশন জোন" },
  { id: 5, src: "https://images.unsplash.com/photo-1580894732444-8ecded790047?w=1200", title: "ওয়ান-টু-ওয়ান স্পেশাল কেয়ার" },
  { id: 6, src: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=1200", title: "লাইব্রেরি ও স্টাডি মেটেরিয়ালস" }
];

export function GallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [images, setImages] = useState<{id: number, src: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/admin/content/gallery");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Map the database fields to the UI fields
            const mappedImages = data.map((img: any) => ({
              id: img.id,
              src: img.image_path,
              title: img.caption || "Gallery Image"
            }));
            setImages(mappedImages);
          }
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const displayImages = images.length > 0 ? images : fallbackImages;
  const activeImage = displayImages[activeIndex % displayImages.length];

  if (loading) {
    return null; // or a skeleton loader
  }


  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            সেরা শিক্ষার অভিজ্ঞতা
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            আধুনিক ক্লাসরুম, ল্যাব এবং সেরা পরিবেশ নিয়ে আমাদের অফলাইন সেন্টারগুলোতে শিক্ষার্থীদের জন্য রয়েছে বিশ্বমানের পড়াশোনার অভিজ্ঞতা।
          </p>
        </div>

        {/* Gallery Container */}
        <div className="max-w-5xl mx-auto flex flex-col items-center">

          {/* Main Large Image */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/8] lg:aspect-[21/9] relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-black/20 border border-white/5 group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${activeImage.src})` }}
                />

                {/* Gradient Overlay for Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Title Overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 p-8 sm:p-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                      {activeImage.title}
                    </h3>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnails Slider */}
          <div className="w-full mt-6 sm:mt-8 relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
            <Swiper
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              loop={true}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 2,
                slideShadows: false,
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              speed={1000}
              onRealIndexChange={(swiper) => setActiveIndex(swiper.realIndex)}
              modules={[EffectCoverflow, Autoplay]}
              className="gallery-thumbs-slider !pb-8 !pt-4"
            >
              {/* Duplicate array for smooth infinite loop if needed, but 6 is usually enough for auto slides */}
              {[...displayImages, ...displayImages].map((img, idx) => (
                <SwiperSlide key={`${img.id}-${idx}`} className="!w-[140px] sm:!w-[200px]">
                  <div className="thumbnail-wrapper relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-500">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${img.src})` }}
                    />
                    {/* Dark overlay for non-active slides */}
                    <div className="overlay absolute inset-0 bg-black/50 transition-opacity duration-500" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .gallery-thumbs-slider .swiper-slide {
          transition: all 0.5s ease;
          opacity: 0.6;
          transform: scale(0.9);
        }
        
        .gallery-thumbs-slider .swiper-slide-active {
          opacity: 1;
          transform: scale(1.1);
          z-index: 10;
        }

        .gallery-thumbs-slider .swiper-slide .thumbnail-wrapper {
          border-color: transparent;
        }

        .gallery-thumbs-slider .swiper-slide-active .thumbnail-wrapper {
          border-color: #38bdf8; /* sky-400 */
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }

        .gallery-thumbs-slider .swiper-slide-active .overlay {
          opacity: 0;
        }
      `}} />
    </section>
  );
}
