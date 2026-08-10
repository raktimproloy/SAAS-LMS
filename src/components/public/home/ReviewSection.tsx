"use client";

import { Star, Quote, Heart } from "lucide-react";

const reviews = [
  { id: 1, name: "ফারিহা রহমান", college: "ভিকারুননিসা নূন স্কুল এন্ড কলেজ", text: "রাকিব স্যারের ক্লাস করার পর বায়োলজিতে আমার ভয় পুরোপুরি কেটে গেছে। স্যারের বোঝানোর স্টাইল একদম আলাদা!", rating: 5, color: "text-purple-400" },
  { id: 2, name: "তাসিন আহমেদ", college: "নটর ডেম কলেজ", text: "অফলাইন ব্যাচের স্পেশাল কেয়ার এবং মডেল টেস্টগুলো আমাকে ভর্তি পরীক্ষার জন্য খুব ভালোভাবে প্রস্তুত করেছে।", rating: 5, color: "text-sky-400" },
  { id: 3, name: "সাদিয়া ইসলাম", college: "রাজুক উত্তরা মডেল কলেজ", text: "ল্যাব প্র্যাকটিক্যালগুলো এতো সুন্দরভাবে করানো হয় যে, বইয়ের থিওরি একদম চোখের সামনে ভাসতে থাকে।", rating: 5, color: "text-emerald-400" },
  { id: 4, name: "মাহমুদুল হাসান", college: "ঢাকা রেসিডেনসিয়াল মডেল কলেজ", text: "লাইব্রেরি এবং স্টাডি জোনটি অসাধারণ! ক্লাস শেষে এখানেই বসে ঘণ্টার পর ঘণ্টা পড়েছি।", rating: 5, color: "text-orange-400" },
  { id: 5, name: "নাবিলা তাবাসসুম", college: "হলি ক্রস কলেজ", text: "ডক্টর বায়োলজি শুধু একটি কোচিং নয়, এটি একটি পূর্ণাঙ্গ গাইডলাইন। থ্যাংকস টু রাকিব স্যার!", rating: 5, color: "text-pink-400" },
  { id: 6, name: "রাফসান জামান", college: "ঢাকা কলেজ", text: "এখানকার এক্সাম সিস্টেম অনেক ভালো। নিজের ভুলগুলো খুব সহজেই শুধরে নেওয়া যায়।", rating: 4, color: "text-indigo-400" },
  { id: 7, name: "মিম আক্তার", college: "আইডিয়াল স্কুল অ্যান্ড কলেজ", text: "ক্লাস নোটস এবং লেকচার শিটগুলো খুবই গোছানো। রিভিশন দিতে অনেক সুবিধা হয়।", rating: 5, color: "text-teal-400" },
  { id: 8, name: "জুবায়ের খান", college: "আদমজী ক্যান্টনমেন্ট কলেজ", text: "সত্যি বলতে আমি আগে বায়োলজি মুখস্ত করতাম। কিন্তু এখানে ক্লাস করার পর কনসেপ্ট ক্লিয়ার হয়েছে।", rating: 5, color: "text-yellow-400" },
];

export function ReviewSection() {
  const row1 = reviews.slice(0, 4);
  const row2 = reviews.slice(4, 8);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-white/10 text-white/20'}`}
      />
    ));
  };

  return (
    <section className="py-24 overflow-hidden bg-muted/40 relative border-t border-border">

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-16">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            তারা কী বলছে আমাদের সম্পর্কে?
          </h2>
          <p className="text-foreground max-w-2xl mx-auto text-lg">
            হাজারো শিক্ষার্থীর আস্থার জায়গা Institute Web। চলুন শুনে নেওয়া যাক সফল শিক্ষার্থীদের বাস্তব অভিজ্ঞতা।
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="w-full relative flex flex-col gap-6 sm:gap-8">

        {/* Row 1 (Moves Left) */}
        <div className="flex overflow-hidden group">
          <div className="flex animate-marquee-left whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...row1, ...row1, ...row1].map((review, idx) => (
              <div
                key={`${review.id}-${idx}`}
                className="w-[320px] sm:w-[400px] mx-3 sm:mx-4 shrink-0 bg-card/40 backdrop-blur-md border border-border rounded-3xl p-6 sm:p-8 hover:bg-card/60 transition-colors duration-300"
              >
                <Quote className="w-10 h-10 text-foreground/5 mb-4" />
                <p className="text-foreground/80 text-sm sm:text-base whitespace-normal leading-relaxed mb-6 line-clamp-3">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-lg">
                      <span className={review.color}>{review.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold text-sm">{review.name}</h4>
                      <p className="text-foreground/90 text-xs truncate max-w-[150px]">{review.college}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 (Moves Right) */}
        <div className="flex overflow-hidden group">
          <div className="flex animate-marquee-right whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...row2, ...row2, ...row2].map((review, idx) => (
              <div
                key={`${review.id}-${idx}`}
                className="w-[320px] sm:w-[400px] mx-3 sm:mx-4 shrink-0 bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 hover:bg-card/60 transition-colors duration-300"
              >
                <Quote className="w-10 h-10 text-white/5 mb-4" />
                <p className="text-white/80 text-sm sm:text-base whitespace-normal leading-relaxed mb-6 line-clamp-3">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg">
                      <span className={review.color}>{review.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{review.name}</h4>
                      <p className="text-white/40 text-xs truncate max-w-[150px]">{review.college}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient fades for edges */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
        
        .animate-marquee-left {
          animation: marqueeLeft 40s linear infinite;
        }
        .animate-marquee-right {
          animation: marqueeRight 40s linear infinite;
        }
      `}} />
    </section>
  );
}
