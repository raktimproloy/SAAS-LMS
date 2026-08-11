"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, BookOpen, ArrowRight, PlayCircle } from "lucide-react";
import { Course } from "@prisma/client";

interface PopularCoursesSectionProps {
  courses?: Course[];
}

// Fallback data if DB is empty
const fallbackCourses: any[] = [
  { id: "1", title: "জীববিজ্ঞান (HSC)", fee: 5000, discount_fee: 3000 },
  { id: "2", title: "মেডিকেল ভর্তি প্রস্তুতি", fee: 15000, discount_fee: 12000 },
  { id: "3", title: "NEET Preparation", fee: 20000, discount_fee: 18000 },
];

export function PopularCoursesSection({ courses }: PopularCoursesSectionProps) {
  const displayCourses = courses && courses.length > 0 ? courses : fallbackCourses;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6"
        >
          <div>
            <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Premium Learning</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              জনপ্রিয় কোর্সসমূহ
            </h2>
          </div>
          <Link href="/courses" className="group flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors">
            সব কোর্স দেখুন
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/courses/${c.id}`} className="block h-full group">
                <div className="h-full bg-card/60 backdrop-blur-xl border border-border/60 hover:border-primary/40 rounded-xl p-5 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)] relative overflow-hidden flex flex-col">
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors duration-500" />
                  
                  <div className="relative z-10 flex-grow">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold mb-4 uppercase tracking-wider border border-primary/20">
                      কোর্স
                    </span>
                    <h3 className="text-xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                  </div>

                  <div className="relative z-10 pt-4 mt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {c.discount_fee ? (
                          <>
                            <span className="text-foreground/90 line-through text-sm font-semibold">৳{c.fee}</span>
                            <span className="text-foreground font-bold text-xl">৳{c.discount_fee}</span>
                          </>
                        ) : (
                          <span className="text-foreground font-bold text-xl">৳{c.fee}</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
