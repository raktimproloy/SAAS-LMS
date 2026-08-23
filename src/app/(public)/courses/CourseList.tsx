"use client";

import { useState } from "react";
import { MapPin, Calendar, Clock, ArrowRight, Loader2, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { submitContactForm } from "@/components/public/home/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function CourseList({ courses }: { courses: any[] }) {
  // Form State
  const [formData, setFormData] = useState({ name: "", phone: "", course_id: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openDialogCourseId, setOpenDialogCourseId] = useState<number | null>(null);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
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
      setTimeout(() => {
        setSuccess(false);
        setOpenDialogCourseId(null);
      }, 3000);
    } else {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No courses available at the moment. Please check back later.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative ${index !== courses.length - 1 ? "pb-12 lg:pb-16 mb-12 lg:mb-16 border-b border-border" : ""
            }`}
        >
          {/* Course Info (Sticky on Desktop) */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 shrink-0 z-10 bg-background/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none py-2 lg:py-0">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">{course.title}</h3>
            <p className="text-foreground text-base sm:text-lg leading-relaxed">
              {course.details || "এই কোর্সের বিস্তারিত বিবরণ শীঘ্রই যোগ করা হবে।"}
            </p>
          </div>

          {/* Batches List */}
          <div className="lg:w-2/3 w-full flex flex-col gap-4">
            {course.batches && course.batches.length > 0 ? (
              course.batches.map((batch: any, bIndex: number) => (
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
                      <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shrink-0 border ${batch.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          batch.status === 'filling_fast' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                        {batch.status === 'active' ? 'Open' : batch.status === 'filling_fast' ? 'Filling Fast' : 'House Full'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 sm:gap-6 text-sm text-foreground/90">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-foreground/50" />
                        <span className="font-medium text-foreground/80">{batch.class_days || 'TBA'}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-foreground/50" />
                        {batch.start_time} - {batch.end_time}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center sm:border-l border-border sm:pl-6 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0">
                    <Dialog 
                      open={openDialogCourseId === batch.id} 
                      onOpenChange={(open) => {
                        if (open) {
                          setFormData({ ...formData, course_id: course.id.toString() });
                          setOpenDialogCourseId(batch.id);
                        } else {
                          setOpenDialogCourseId(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="w-full sm:w-auto rounded-xl font-bold bg-muted text-foreground hover:bg-primary hover:text-primary-foreground border-0 transition-colors group/btn flex items-center gap-2"
                        >
                          ভর্তি হোন
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>ভর্তির জন্য যোগাযোগ করুন</DialogTitle>
                        </DialogHeader>
                        
                        {success ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
                            <h4 className="text-xl font-bold text-foreground">ধন্যবাদ!</h4>
                            <p className="text-muted-foreground">আপনার তথ্য সফলভাবে জমা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
                          </div>
                        ) : (
                          <form className="space-y-4 mt-4" onSubmit={handleEnrollSubmit}>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">শিক্ষার্থীর নাম *</label>
                              <input
                                type="text"
                                placeholder="আপনার পূর্ণ নাম"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">ফোন নম্বর *</label>
                              <input
                                type="tel"
                                placeholder="01XXXXXXXXX"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">মেসেজ (ঐচ্ছিক)</label>
                              <textarea
                                rows={2}
                                placeholder="আপনার কিছু জানার থাকলে এখানে লিখুন..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                              {submitting ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
                            </button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No batches scheduled currently.</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
