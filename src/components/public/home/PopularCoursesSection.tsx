"use client";

import Link from "next/link";
import { Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const courses = [
  { title: "জীববিজ্ঞান (HSC)", students: "1200+", rating: 4.9, badge: "Most Popular" },
  { title: "মেডিকেল ভর্তি প্রস্তুতি", students: "800+", rating: 4.8, badge: "Trending" },
  { title: "NEET Preparation", students: "500+", rating: 4.7, badge: "New" },
  { title: "রসায়ন বিশেষ কোর্স", students: "600+", rating: 4.8, badge: "Top Rated" },
];

export function PopularCoursesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">আমাদের কোর্সসমূহ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">জনপ্রিয় কোর্স</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((c, i) => (
            <div
              key={c.title}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">{c.badge}</span>
              <h3 className="font-semibold text-foreground leading-snug mb-3">{c.title}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.students}</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{c.rating}</span>
              </div>
              <Link href="/courses" className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                বিস্তারিত দেখুন <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12" data-aos="fade-up">
          <Link href="/courses">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 h-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              সব কোর্স দেখুন <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
