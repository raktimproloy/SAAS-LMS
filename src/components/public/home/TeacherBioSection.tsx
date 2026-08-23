"use client";

import { useState } from "react";
import { Play, BookOpen, HeartPulse } from "lucide-react";

export function TeacherBioSection({ teacher }: { teacher: any }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse stats safely
  let stats: any[] = [];
  try {
    stats = typeof teacher?.stats === 'string' ? JSON.parse(teacher.stats) : (teacher?.stats || []);
    if (!Array.isArray(stats)) stats = [];
  } catch(e) {}

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -right-64 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Bio Section */}
          <div data-aos="fade-right">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {teacher?.name || "ডাঃ রাকিবুল ইসলাম"}
            </h2>
            <h3 className="text-xl text-primary font-medium mb-6">
              {teacher?.qualifications || "MBBS (DMC), FCPS (Medicine)"}
            </h3>

            <p className="text-foreground text-lg leading-relaxed mb-8">
              {teacher?.bio || "বিগত ১০ বছর ধরে শিক্ষার্থীদের বাংলা ভাষার প্রতি ভালোবাসা তৈরি করতে ও পরীক্ষায় সেরা ফলাফল অর্জনে কাজ করে যাচ্ছি।"}
            </p>

            {stats.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {stats.slice(0, 2).map((stat: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex-1 px-6 py-5 rounded-xl bg-card border border-border shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <h4 className="text-3xl font-bold mb-1 text-foreground">
                      {stat.value}
                    </h4>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Video Player */}
          <div data-aos="fade-left" className="relative">
            {/* Decorative background behind video */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-sky-400/30 rounded-xl blur-2xl opacity-50" />

            <div 
              className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl aspect-[16/10] sm:aspect-video bg-black group"
            >
              {!isPlaying ? (
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setIsPlaying(true)}
                >
                  {/* Thumbnail Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${teacher?.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}')` }}
                  />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="relative">
                      {/* Ping animation behind button */}
                      <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30" />
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary group-hover:border-primary">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-2 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-10 pointer-events-none">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-md tracking-wider">INTRO</span>
                      <span className="text-white font-medium text-sm sm:text-base">{teacher?.name ? `${teacher.name} সম্পর্কে জানুন` : 'Institute Web সম্পর্কে জানুন'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-black">
                  <iframe
                    className="w-full h-full"
                    src={teacher?.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"}
                    title="Intro"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
