"use client";

import { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";

import "swiper/css";

type GalleryImage = { id: number; src: string; title: string };

export function GallerySection({ initialImages = [] }: { initialImages?: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo<GalleryImage[]>(() => {
    if (initialImages && initialImages.length > 0) {
      return initialImages.map((img) => ({
        id: img.id,
        src: img.image_path,
        title: img.caption || "Gallery",
      }));
    }
    return [];
  }, [initialImages]);

  if (images.length === 0) {
    return null;
  }

  const thumbImages = useMemo(() => {
    return images.slice(0, 5);
  }, [images]);

  const loopSlides = useMemo(() => {
    if (thumbImages.length === 0) return [];
    const copies = Math.max(3, Math.ceil(8 / thumbImages.length));
    return Array.from({ length: copies }, (_, copy) =>
      thumbImages.map((img) => ({ ...img, _key: `${img.id}-${copy}` }))
    ).flat();
  }, [thumbImages]);

  const activeImage = thumbImages[activeIndex % Math.max(thumbImages.length, 1)] ?? thumbImages[0];

  if (!activeImage) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative isolate z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10" data-aos="fade-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            গ্যালারি ও কিছু স্মৃতি
          </h2>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Main image — no title, no dark overlay */}
          <div className="w-full aspect-[16/9] lg:aspect-[21/9] relative rounded-xl overflow-hidden shadow-lg bg-muted border border-border/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0 overflow-hidden"
              >
                {/* Blurred backdrop for images that don't fill the aspect ratio */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                  draggable={false}
                />
                {/* Main uncropped image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain z-10 drop-shadow-2xl"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnails */}
          <div className="w-full mt-6 sm:mt-8 relative max-w-2xl mx-auto overflow-hidden">
            <Swiper
              grabCursor
              centeredSlides
              slidesPerView="auto"
              spaceBetween={12}
              loop
              loopAdditionalSlides={thumbImages.length}
              watchSlidesProgress
              speed={600}
              autoplay={{
                delay: 3200,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              onSlideChange={(swiper) => {
                setActiveIndex(swiper.realIndex % thumbImages.length);
              }}
              modules={[Autoplay]}
              className="gallery-thumbs-slider !py-3"
            >
              {loopSlides.map((img) => (
                <SwiperSlide
                  key={img._key}
                  className="!w-[90px] sm:!w-[140px]"
                >
                  <div className="thumbnail-wrapper relative aspect-video rounded-lg overflow-hidden border-2 border-transparent transition-[border-color,box-shadow,transform] duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .gallery-thumbs-slider .swiper-wrapper {
          align-items: center;
          transition-timing-function: ease-out !important;
        }

        .gallery-thumbs-slider .swiper-slide {
          opacity: 1 !important;
          filter: none !important;
          height: auto;
        }

        .gallery-thumbs-slider .swiper-slide .thumbnail-wrapper {
          transform: none;
        }

        .gallery-thumbs-slider .swiper-slide-active .thumbnail-wrapper {
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
        }
      `}} />
    </section>
  );
}
