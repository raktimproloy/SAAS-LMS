"use client";

import { useEffect } from "react";
import { Dna, Target, Heart, Award } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AboutPage() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 50 });
  }, []);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">আমাদের সম্পর্কে</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground">About DoctorBiology</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            আমরা বিশ্বাস করি প্রতিটি শিক্ষার্থীর মেডিকেল ভর্তির স্বপ্ন পূরণ করা সম্ভব — সঠিক গাইডেন্স ও পরিশ্রমের মাধ্যমে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: Target, title: "আমাদের লক্ষ্য", text: "প্রতিটি শিক্ষার্থীকে মেডিকেল ভর্তি পরীক্ষায় সাফল্য অর্জনে সহায়তা করা।", delay: "0" },
            { icon: Heart, title: "আমাদের দর্শন", text: "মানসম্পন্ন শিক্ষাকে সাশ্রয়ী ও সহজলভ্য করে তোলা।", delay: "100" },
            { icon: Award, title: "আমাদের অর্জন", text: "৮+ বছরে ৫০০০+ শিক্ষার্থীর সফল মেডিকেলে ভর্তি।", delay: "200" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                data-aos="fade-up"
                data-aos-delay={item.delay}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12" data-aos="fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Dna className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">আমাদের গল্প</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>DoctorBiology শুরু হয়েছিল একটি ছোট্ট স্বপ্ন থেকে — মেডিকেল ভর্তি প্রস্তুতিকে সকলের কাছে পৌঁছে দেওয়া।</p>
            <p>আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী প্রতিনিয়ত আধুনিক পদ্ধতিতে পাঠদান করে আসছেন। অনলাইন পরীক্ষা, লাইভ ক্লাস ও ব্যক্তিগতকৃত ফিডব্যাকের মাধ্যমে প্রতিটি শিক্ষার্থীকে তাদের লক্ষ্যে পৌঁছে দেওয়াই আমাদের সংকল্প।</p>
          </div>
        </div>
      </div>
    </div>
  );
}
