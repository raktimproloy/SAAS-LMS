"use client";

import { useEffect } from "react";
import { MapPin, Phone, Mail, MessageCircle, Send } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 50 });
  }, []);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">যোগাযোগ</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-foreground">Contact Us</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div data-aos="fade-right" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">আমাদের খুঁজুন</h2>
            {[
              { icon: MapPin, label: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
              { icon: Phone, label: "ফোন", value: "+880 1XXXXXXXXX", href: "tel:+8801XXXXXXXXX" },
              { icon: Mail, label: "ইমেইল", value: "info@doctorbiology.com", href: "mailto:info@doctorbiology.com" },
              { icon: MessageCircle, label: "WhatsApp", value: "WhatsApp করুন", href: "https://wa.me/8801XXXXXXXXX" },
            ].map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 group">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>

          {/* Message Form */}
          <div data-aos="fade-left" className="bg-card border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">বার্তা পাঠান</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const wa = `https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent("নতুন বার্তা পাঠানো হয়েছে")}`;
                window.open(wa, "_blank");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">আপনার নাম</label>
                <input type="text" required placeholder="নাম লিখুন..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">ফোন নম্বর</label>
                <input type="tel" required placeholder="017XXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">বার্তা</label>
                <textarea rows={4} required placeholder="আপনার প্রশ্ন বা মন্তব্য লিখুন..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition resize-none" />
              </div>
              <Button type="submit" className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl border-0 h-11">
                <Send className="h-4 w-4" />
                WhatsApp-এ পাঠান
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
