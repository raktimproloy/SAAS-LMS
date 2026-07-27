"use client";

import { MapPin, Phone, Mail, Send, Navigation, Clock } from "lucide-react";

export function ContactSection() {
  // Replace this with the actual coordinates or name of the coaching center
  const destination = "Farmgate, Dhaka, Bangladesh";
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20">
            <Phone className="w-4 h-4" />
            যোগাযোগ করুন
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            অ্যাডমিশন ও কন্টাক্ট
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            যেকোনো জিজ্ঞাসা বা নতুন ব্যাচে ভর্তি সংক্রান্ত তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা দ্রুত আপনার সাথে যোগাযোগ করবো।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16">
          
          {/* Left Side: Contact Info */}
          <div className="lg:col-span-5 flex flex-col gap-5" data-aos="fade-right">
            
            {/* Phone Card */}
            <a href="tel:+8801987654321" className="group flex items-center gap-5 p-5 sm:p-6 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-1">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <Phone className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-indigo-400 transition-colors">কল করুন</h4>
                <p className="text-muted-foreground text-sm font-medium">+880 1987-654321</p>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a href="https://wa.me/8801987654321" target="_blank" rel="noreferrer" className="group flex items-center gap-5 p-5 sm:p-6 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-1">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                <Send className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-green-500 transition-colors">হোয়াটসঅ্যাপ</h4>
                <p className="text-muted-foreground text-sm font-medium">+880 1987-654321</p>
              </div>
            </a>

            {/* Email Card */}
            <a href="mailto:support@doctorbiology.com" className="group flex items-center gap-5 p-5 sm:p-6 rounded-3xl bg-card/40 backdrop-blur-md border border-white/10 hover:bg-card/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] hover:-translate-y-1">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-pink-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                <Mail className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-pink-400 transition-colors">ইমেইল করুন</h4>
                <p className="text-muted-foreground text-sm font-medium">support@doctorbiology.com</p>
              </div>
            </a>

            {/* Office Address Card */}
            <div className="bg-card/40 backdrop-blur-sm border border-border rounded-3xl p-6 sm:p-8 flex items-start gap-4 mt-auto">
              <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-foreground font-semibold text-lg mb-1">প্রধান শাখা</h4>
                <p className="text-muted-foreground leading-relaxed">৩য় তলা, ফার্মগেট মেইন রোড<br/>ঢাকা, বাংলাদেশ</p>
              </div>
            </div>
            
          </div>

          {/* Right Side: Admission / Contact Form */}
          <div className="lg:col-span-7" data-aos="fade-left">
            <div className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-black/5 relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px]" />

              <h3 className="text-2xl font-bold text-foreground mb-2">অনলাইনে ভর্তি / যোগাযোগ ফর্ম</h3>
              <p className="text-muted-foreground text-sm mb-8">নিচের ফর্মটি পূরণ করুন। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।</p>

              <form className="space-y-5 relative z-10" onSubmit={(e) => e.preventDefault()}>
                
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

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">মেসেজ বা জিজ্ঞাসা (যদি থাকে)</label>
                  <textarea 
                    rows={4}
                    placeholder="আপনার কিছু জানার থাকলে এখানে লিখুন..." 
                    className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 mt-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
                >
                  <Send className="w-5 h-5" />
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
