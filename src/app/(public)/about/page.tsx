"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Building2, Target, History, Trophy, Users, GraduationCap, Quote } from "lucide-react";
import Image from "next/image";

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
    <div className="bg-background">
      
      {/* 1. About Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 bg-[#0B0F19] overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div data-aos="fade-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-semibold mb-6 backdrop-blur-md">
              <Building2 className="w-4 h-4 text-emerald-400" />
              আমাদের সম্পর্কে
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              DoctorBiology - তে <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">আপনাকে স্বাগতম</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              মেডিকেল স্বপ্ন পূরণের সবচেয়ে বিশ্বস্ত নাম। আমরা শুধু পড়াই না, আমরা একজন শিক্ষার্থীকে তার স্বপ্ন ছুঁতে প্রস্তুত করি।
            </p>
          </div>
        </div>
      </section>

      {/* 2. Unique Institute Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background relative -mt-10 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.id} 
                  data-aos="fade-up" 
                  data-aos-delay={i * 100}
                  className="bg-card/80 backdrop-blur-xl border border-border p-6 rounded-3xl text-center shadow-2xl shadow-black/5 hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. আমাদের কথা (Our Story) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div data-aos="fade-right" className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-border relative z-10">
                {/* Fallback pattern if image is not available */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20" />
                <img 
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800" 
                  alt="Our Story"
                  className="w-full h-full object-cover mix-blend-overlay opacity-80"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-card border border-border p-6 rounded-3xl shadow-xl z-20 max-w-[250px] hidden sm:block">
                <Quote className="w-8 h-8 text-primary/40 mb-3" />
                <p className="text-foreground font-medium text-sm leading-relaxed">
                  "আমাদের লক্ষ্য হলো প্রতিটা শিক্ষার্থীর ভেতরে লুকিয়ে থাকা সম্ভাবনাকে জাগিয়ে তোলা।"
                </p>
              </div>
            </div>

            <div data-aos="fade-left" className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                <Target className="w-4 h-4" />
                আমাদের কথা
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                শিক্ষার্থীদের সফলতাই <br/> আমাদের মূল লক্ষ্য
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                <p>
                  DoctorBiology-এর পথচলা শুরু হয়েছিল একটি মহৎ উদ্দেশ্য নিয়ে - শিক্ষার্থীদের জন্য বায়োলজিকে সহজ, প্রাণবন্ত এবং আকর্ষণীয় করে তোলা। আমরা বিশ্বাস করি মুখস্তবিদ্যা নয়, বরং কনসেপ্ট ক্লিয়ার করার মাধ্যমেই আসল সফলতা আসে।
                </p>
                <p>
                  বছরের পর বছর ধরে আমরা হাজারো শিক্ষার্থীকে তাদের মেডিকেল স্বপ্ন পূরণে গাইড করে আসছি। আমাদের অফলাইন ক্যাম্পাস ও অনলাইন প্ল্যাটফর্ম মিলে তৈরি করেছে এমন এক ইকোসিস্টেম, যেখানে প্রতিটি স্টুডেন্ট পায় তার জন্য প্রয়োজনীয় সর্বোচ্চ সাপোর্ট।
                </p>
                <p>
                  আমাদের টিচার্স প্যানেল, অত্যাধুনিক ল্যাব ফ্যাসিলিটি এবং স্পেশাল কেয়ার প্রোগ্রামগুলো এমনভাবে ডিজাইন করা হয়েছে, যা একজন সাধারণ স্টুডেন্টকেও অসাধারণ রেজাল্ট করতে সাহায্য করে।
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

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
