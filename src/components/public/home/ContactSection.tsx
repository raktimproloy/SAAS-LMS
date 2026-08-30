"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Send, Navigation, Loader2, CheckCircle2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/svg";
import { getContactConfig, submitContactForm } from "./actions";

export function ContactSection() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<{id: number, title: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    course_id: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getContactConfig().then(data => {
      setConfig(data.config);
      setCourses(data.courses);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitContactForm({
      name: formData.name,
      phone: formData.phone,
      course_id: formData.course_id ? parseInt(formData.course_id) : undefined,
      message: formData.message
    });
    
    if (res.success) {
      setSuccess(true);
      setFormData({ name: "", phone: "", course_id: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } else {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const address = config.contact_address || "Farmgate, Dhaka, Bangladesh";
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10" data-aos="fade-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {config.contact_section_title || "অ্যাডমিশন ও কন্টাক্ট"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          {/* Left Side: Contact Info */}
          <div className="lg:col-span-5" data-aos="fade-right">
            <div className="h-full flex flex-col justify-center gap-6 sm:gap-8">
              
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary/50" /></div>
              ) : (
                <>
                  {/* Phone */}
                  {(config.contact_phone || "+880 1XXXXXXXXX") && (
                    <a href={`tel:${config.contact_phone}`} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground/90 mb-1">কল করুন</h4>
                        <p className="text-foreground font-bold text-base sm:text-lg group-hover:text-primary transition-colors">{config.contact_phone || "+880 1XXXXXXXXX"}</p>
                      </div>
                    </a>
                  )}

                  {/* WhatsApp */}
                  {(config.contact_whatsapp || "+880 1XXXXXXXXX") && (
                    <a href={`https://wa.me/${config.contact_whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                        <WhatsAppIcon className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground/90 mb-1">হোয়াটসঅ্যাপ</h4>
                        <p className="text-foreground font-bold text-base sm:text-lg group-hover:text-green-500 transition-colors">{config.contact_whatsapp || "+880 1XXXXXXXXX"}</p>
                      </div>
                    </a>
                  )}

                  {/* Email */}
                  {(config.contact_email || "info@example.com") && (
                    <a href={`mailto:${config.contact_email}`} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
                        <Mail className="w-5 h-5 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground/90 mb-1">ইমেইল করুন</h4>
                        <p className="text-foreground font-bold text-base sm:text-lg group-hover:text-pink-500 transition-colors">{config.contact_email || "info@example.com"}</p>
                      </div>
                    </a>
                  )}

                  {/* Office Address */}
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold text-lg mb-1">অফিস ঠিকানা</h4>
                      <p className="text-foreground leading-relaxed mb-3 text-sm whitespace-pre-wrap">{address}</p>
                      <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                        <Navigation className="w-4 h-4" />
                        ডিরেকশন দেখুন
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side: Admission / Contact Form */}
          <div className="lg:col-span-7" data-aos="fade-left">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-xl shadow-black/5 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px]" />

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {config.contact_form_title || "অনলাইনে ভর্তি / যোগাযোগ ফর্ম"}
              </h3>
              <p className="text-foreground text-sm mb-6">
                {config.contact_form_description || "নিচের ফর্মটি পূরণ করুন। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।"}
              </p>

              {success ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">ধন্যবাদ!</h4>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    আপনার তথ্য সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।
                  </p>
                </div>
              ) : (
                <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">শিক্ষার্থীর নাম *</label>
                      <input
                        type="text"
                        placeholder="আপনার পূর্ণ নাম"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">ফোন নম্বর *</label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">কোন ব্যাচে ভর্তি হতে ইচ্ছুক?</label>
                    <select 
                      value={formData.course_id}
                      onChange={e => setFormData({...formData, course_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                      <option value="">অন্যান্য বিষয়ে জানতে চাই</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">মেসেজ বা জিজ্ঞাসা (যদি থাকে)</label>
                    <textarea
                      rows={3}
                      placeholder="আপনার কিছু জানার থাকলে এখানে লিখুন..."
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 mt-3 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {submitting ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
