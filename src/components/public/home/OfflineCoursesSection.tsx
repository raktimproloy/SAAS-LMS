"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const offlineCourses = [
  {
    id: 1,
    title: "HSC 2025 Academic Batch",
    description: "HSC ২০২৫ পরীক্ষার্থীদের জন্য সম্পূর্ণ সিলেবাস কভারেজ এবং মাসিক মডেল টেস্ট।",
    batches: [
      { id: "b1", name: "Morning Batch", time: "০৮:০০ AM - ১০:০০ AM", days: "রবি, মঙ্গল, বৃহস্পতি", location: "ফার্মগেট শাখা", status: "Filling Fast" },
      { id: "b2", name: "Evening Batch", time: "০৪:০০ PM - ০৬:০০ PM", days: "সোম, বুধ, শুক্র", location: "মিরপুর শাখা", status: "Open" }
    ]
  },
  {
    id: 2,
    title: "Medical Admission Program",
    description: "মেডিকেল ভর্তিচ্ছুদের জন্য ইনটেনসিভ কেয়ার ব্যাচ। বিগত বছরের প্রশ্ন বিশ্লেষণ ও স্পেশাল গাইডলাইন।",
    batches: [
      { id: "b3", name: "Pre-Medical", time: "০৩:০০ PM - ০৬:০০ PM", days: "শুক্র, શনি", location: "ফার্মগেট শাখা", status: "House Full" },
      { id: "b4", name: "Regular Batch", time: "১০:০০ AM - ০১:০০ PM", days: "রবি, বুধ", location: "ফার্মগেট শাখা", status: "Open" }
    ]
  },
  {
    id: 3,
    title: "জীববিজ্ঞান স্পেশাল (HSC 2026)",
    description: "নতুন কারিকুলাম ও সৃজনশীল পদ্ধতির উপর ভিত্তি করে একাদশ শ্রেণির শিক্ষার্থীদের জন্য বিশেষ কোর্স।",
    batches: [
      { id: "b5", name: "First Year Batch", time: "০২:০০ PM - ০৪:০০ PM", days: "শনি, সোম, বুধ", location: "মৌচাক শাখা", status: "Open" }
    ]
  }
];

export function OfflineCoursesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Decorative Gradients */}
      <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-20" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">সরাসরি ক্লাসের অভিজ্ঞতা</h2>
          <p className="text-foreground max-w-2xl mx-auto text-lg">
            আমাদের অফলাইন ব্যাচগুলোতে ভর্তি হয়ে সরাসরি শিক্ষকদের তত্ত্বাবধানে নিজের প্রস্তুতিকে আরও শাণিত করুন।
          </p>
        </div>

        {/* Courses List */}
        <div className="flex flex-col">
          {offlineCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative ${index !== offlineCourses.length - 1 ? "pb-12 lg:pb-16 mb-12 lg:mb-16 border-b border-border" : ""
                }`}
            >
              {/* Course Info (Sticky on Desktop) */}
              <div className="lg:w-1/3 lg:sticky lg:top-32 shrink-0 z-10 bg-background/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none py-2 lg:py-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">{course.title}</h3>
                <p className="text-foreground text-base sm:text-lg leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Batches List */}
              <div className="lg:w-2/3 w-full flex flex-col gap-4">
                {course.batches.map((batch, bIndex) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: bIndex * 0.1 }}
                    key={batch.id}
                    className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-5 sm:p-6 hover:bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-6 justify-between group"
                  >

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h5 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{batch.name}</h5>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shrink-0 border ${batch.status === 'Open' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            batch.status === 'Filling Fast' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                          {batch.status}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 sm:gap-6 text-sm text-foreground/90">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-foreground/50" />
                          <span className="font-medium text-foreground/80">{batch.days}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-foreground/50" />
                          {batch.time}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-foreground/50" />
                          {batch.location}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center sm:border-l border-border sm:pl-6 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0">
                      <Button
                        className="w-full sm:w-auto rounded-xl font-bold bg-muted text-foreground hover:bg-primary hover:text-primary-foreground border-0 transition-colors group/btn flex items-center gap-2"
                        disabled={batch.status === 'House Full'}
                      >
                        {batch.status === 'House Full' ? 'ভর্তি বন্ধ' : 'যোগাযোগ করুন'}
                        {batch.status !== 'House Full' && (
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        )}
                      </Button>
                    </div>

                  </motion.div>
                ))}
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
