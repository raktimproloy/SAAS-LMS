"use client";

import { useEffect } from "react";
import { BookOpen, Users, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";

const courses = [
  { title: "জীববিজ্ঞান (HSC)", students: "1200+", rating: 4.9, badge: "Most Popular" },
  { title: "মেডিকেল ভর্তি প্রস্তুতি", students: "800+", rating: 4.8, badge: "Trending" },
  { title: "NEET Preparation", students: "500+", rating: 4.7, badge: "New" },
  { title: "রসায়ন বিশেষ কোর্স", students: "600+", rating: 4.8, badge: "Top Rated" },
  { title: "পদার্থ বিজ্ঞান", students: "700+", rating: 4.6, badge: "Popular" },
  { title: "ইংরেজি সাধারণ জ্ঞান", students: "900+", rating: 4.7, badge: "Recommended" },
];

export default function CoursesPage() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 50 });
  }, []);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">আমাদের কোর্সসমূহ</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground">সব কোর্স</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            আপনার লক্ষ্য অনুযায়ী সঠিক কোর্সটি বেছে নিন এবং সফলতার দিকে এগিয়ে যান।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c, i) => (
            <div
              key={c.title}
              data-aos="fade-up"
              data-aos-delay={i * 80}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-1.5 w-full bg-primary" />
              <div className="p-6">
                <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">{c.badge}</span>
                <h2 className="font-semibold text-foreground text-lg mb-3">{c.title}</h2>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-5">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.students}</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{c.rating}</span>
                </div>
                <Link href="/student/login">
                  <Button size="sm" className="w-full gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl border-0">
                    ভর্তি হন <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
