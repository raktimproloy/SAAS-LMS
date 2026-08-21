"use client";

import { MapPin, Phone, Mail, Send, Navigation, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/svg";

export function ContactSection() {
  // Replace this with the actual coordinates or name of the coaching center
  const destination = "Farmgate, Dhaka, Bangladesh";
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-10" data-aos="fade-up">

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            অ্যাডমিশন ও কন্টাক্ট
          </h2>
          <p className="text-foreground max-w-2xl mx-auto text-lg">
            যেকোনো জিজ্ঞাসা বা নতুন ব্যাচে ভর্তি সংক্রান্ত তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা দ্রুত আপনার সাথে যোগাযোগ করবো।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">

          {/* Left Side: Contact Info */}
          <div className="lg:col-span-5" data-aos="fade-right">
            <div className="h-full flex flex-col justify-center gap-6 sm:gap-8">
              {/* Phone */}
              <a href="tel:+8801987654321" className="flex items-center gap-4 group">
                <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground/90 mb-1">কল করুন</h4>
                  <p className="text-foreground font-bold text-base sm:text-lg group-hover:text-primary transition-colors">+880 1987-654321</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a href="https://wa.me/8801987654321" target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                <div className="w-12 h-12 shrink-0 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                  <WhatsAppIcon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground/90 mb-1">হোয়াটসঅ্যাপ</h4>
                  <p className="text-foreground font-bold text-base sm:text-lg group-hover:text-green-500 transition-colors">+880 1987-654321</p>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:support@instituteweb.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 shrink-0 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                  <Mail className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground/90 mb-1">ইমেইল করুন</h4>
                  <p className="text-foreground font-bold text-base sm:text-lg group-hover:text-pink-500 transition-colors">support@instituteweb.com</p>
                </div>
              </a>

              {/* Office Address */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-foreground font-bold text-lg mb-1">প্রধান শাখা</h4>
                  <p className="text-foreground leading-relaxed mb-3 text-sm">৩য় তলা, ফার্মগেট মেইন রোড<br />ঢাকা, বাংলাদেশ</p>
                  <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                    <Navigation className="w-4 h-4" />
                    ডিরেকশন দেখুন
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Admission / Contact Form */}
          <div className="lg:col-span-7" data-aos="fade-left">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-xl shadow-black/5 relative overflow-hidden h-full">

              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px]" />

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">অনলাইনে ভর্তি / যোগাযোগ ফর্ম</h3>
              <p className="text-foreground text-sm mb-6">নিচের ফর্মটি পূরণ করুন। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।</p>

              <form className="space-y-5 relative z-10 flex flex-col h-full" onSubmit={(e) => e.preventDefault()}>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">শিক্ষার্থীর নাম *</label>
                    <input
                      type="text"
                      placeholder="আপনার পূর্ণ নাম"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">ফোন নম্বর *</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">কোন ব্যাচে ভর্তি হতে ইচ্ছুক?</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                    <option value="">নির্বাচন করুন</option>
                    <option value="hsc25">HSC '25 - ফার্স্ট ইয়ার ফুল কোর্স</option>
                    <option value="hsc24">HSC '24 - রিভিশন ও মডেল টেস্ট</option>
                    <option value="medical">মেডিকেল বায়োলজি স্পেশাল</option>
                    <option value="other">অন্যান্য বিষয়ে জানতে চাই</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex-grow flex flex-col">
                  <label className="text-sm font-medium text-foreground">মেসেজ বা জিজ্ঞাসা (যদি থাকে)</label>
                  <textarea
                    rows={4}
                    placeholder="আপনার কিছু জানার থাকলে এখানে লিখুন..."
                    className="w-full flex-grow px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 mt-3 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" />
                  সাবমিট করুন
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
