"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronDown, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const offlineCourses = [
  {
    id: 1,
    title: "HSC 2025 Academic Batch",
    description: "HSC ২০২৫ পরীক্ষার্থীদের জন্য সম্পূর্ণ সিলেবাস কভারেজ এবং মাসিক মডেল টেস্ট।",
    features: ["লেকচার শিট", "সাপ্তাহিক পরীক্ষা", "প্রবলেম সলভিং ক্লাস"],
    batches: [
      { id: "b1", name: "Morning Batch", time: "০৮:০০ AM - ১০:০০ AM", days: "রবি, মঙ্গল, বৃহস্পতি", location: "ফার্মগেট শাখা", status: "Filling Fast", students: "450+" },
      { id: "b2", name: "Evening Batch", time: "০৪:০০ PM - ০৬:০০ PM", days: "সোম, বুধ, শুক্র", location: "মিরপুর শাখা", status: "Open", students: "320+" }
    ]
  },
  {
    id: 2,
    title: "Medical Admission Program",
    description: "মেডিকেল ভর্তিচ্ছুদের জন্য ইনটেনসিভ কেয়ার ব্যাচ। বিগত বছরের প্রশ্ন বিশ্লেষণ ও স্পেশাল গাইডলাইন।",
    features: ["ডেইলী এক্সাম", "স্পেশাল গাইডলাইন", "পেপার ফাইনাল"],
    batches: [
      { id: "b3", name: "Pre-Medical Batch", time: "০৩:০০ PM - ০৬:০০ PM", days: "শুক্র, શনি", location: "ফার্মগেট শাখা", status: "House Full", students: "600+" },
      { id: "b4", name: "Regular Batch", time: "১০:০০ AM - ০১:০০ PM", days: "রবি, বুধ", location: "ফার্মগেট শাখা", status: "Open", students: "250+" }
    ]
  },
  {
    id: 3,
    title: "জীববিজ্ঞান স্পেশাল (HSC 2026)",
    description: "নতুন কারিকুলাম ও সৃজনশীল পদ্ধতির উপর ভিত্তি করে একাদশ শ্রেণির শিক্ষার্থীদের জন্য বিশেষ কোর্স।",
    features: ["বেসিক বিল্ডআপ", "সৃজনশীল প্র্যাকটিস", "বই দাগানো"],
    batches: [
      { id: "b5", name: "First Year Batch", time: "০২:০০ PM - ০৪:০০ PM", days: "শনি, সোম, বুধ", location: "মৌচাক শাখা", status: "Open", students: "400+" }
    ]
  }
];

export function OfflineCoursesSection() {
  const [expandedCourse, setExpandedCourse] = useState<number | null>(1);

  const toggleCourse = (id: number) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(210 100% 12%) 0%, hsl(210 100% 20%) 100%)" }}>
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm uppercase tracking-widest border border-primary/20 mb-4">
            অফলাইন সেন্টার
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">সরাসরি ক্লাসের অভিজ্ঞতা</h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            আমাদের অফলাইন ব্যাচগুলোতে ভর্তি হয়ে সরাসরি শিক্ষকদের তত্ত্বাবধানে নিজের প্রস্তুতিকে আরও শাণিত করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          {offlineCourses.map((course, index) => {
            const isExpanded = expandedCourse === course.id;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                  isExpanded 
                    ? "bg-white/10 border-primary/40 shadow-[0_0_40px_-15px_rgba(56,189,248,0.3)]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                {/* Course Header (Clickable) */}
                <div 
                  className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group/header"
                  onClick={() => toggleCourse(course.id)}
                >
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white group-hover/header:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm sm:text-base leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {course.features.map((feature, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-white/10 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                    <div className="text-left sm:text-right">
                      <div className="text-white font-bold text-lg">{course.batches.length} টি ব্যাচ</div>
                      <div className={`text-xs mt-0.5 transition-colors ${isExpanded ? 'text-primary' : 'text-white/50 group-hover/header:text-white/80'}`}>
                        {isExpanded ? 'ব্যাচ লুকান' : 'ব্যাচ দেখতে ক্লিক করুন'}
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isExpanded 
                        ? 'bg-primary text-white rotate-180 shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                        : 'bg-white/10 text-white/70 group-hover/header:bg-white/20 group-hover/header:text-white group-hover/header:scale-110'
                    }`}>
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Batches Expandable Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 sm:p-8 pt-0 border-t border-white/10 mt-2">
                        <h4 className="text-white/80 font-semibold mb-6 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          উপলব্ধ ব্যাচসমূহ
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course.batches.map((batch) => (
                            <div key={batch.id} className="relative bg-black/20 border border-white/10 rounded-2xl overflow-hidden flex flex-col sm:flex-row group hover:border-primary/50 transition-colors duration-300">
                              
                              {/* Left Side: Time/Day Badge */}
                              <div className="sm:w-2/5 bg-primary/10 p-5 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-dashed border-white/20 relative">
                                {/* Ticket cutouts */}
                                <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#111c2d]" />
                                
                                <Clock className="w-6 h-6 text-primary mb-2 opacity-80" />
                                <div className="text-primary font-bold text-center leading-tight mb-1">{batch.days}</div>
                                <div className="text-white/70 text-xs text-center">{batch.time}</div>
                              </div>

                              {/* Right Side: Batch Details */}
                              <div className="sm:w-3/5 p-5 relative flex flex-col justify-between">
                                {/* Ticket cutouts */}
                                <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#111c2d]" />

                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-white text-lg">{batch.name}</h5>
                                    {batch.status === 'Open' ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">OPEN</span>
                                    ) : batch.status === 'Filling Fast' ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">FILLING FAST</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">HOUSE FULL</span>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/60 text-sm mb-4">
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="w-4 h-4" />
                                      {batch.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-primary/80 font-medium">
                                      <Users className="w-4 h-4" />
                                      {batch.students}
                                    </span>
                                  </div>
                                </div>
                                
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  className="w-full bg-white/10 hover:bg-primary hover:text-white text-white border-0 transition-all shadow-none"
                                  disabled={batch.status === 'House Full'}
                                >
                                  {batch.status === 'House Full' ? 'ভর্তি বন্ধ' : 'ভর্তি হতে যোগাযোগ করুন'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
