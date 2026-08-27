"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoadmapTimeline } from "@/components/admin/curriculum/roadmap/RoadmapTimeline";
import { submitContactForm } from "@/components/public/home/actions";
import type { DraftSession } from "@/lib/curriculum-scheduler";
import { cn } from "@/lib/utils";

export interface BatchCurriculum {
  id: number;
  title: string;
  start_date: string | Date;
  end_date: string | Date;
  class_days: unknown;
  status: string;
  is_public: boolean;
  sessions: DraftSession[];
}

export interface DetailedBatch {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  status: string;
  max_students: number | null;
  class_days: unknown;
  curriculums?: BatchCurriculum[];
}

export interface DetailedCourse {
  id: number;
  title: string;
  fee: number | null;
  discount_fee: number | null;
  details: string | null;
  batches: DetailedBatch[];
}

function EnrollModal({
  courseId,
  courseName,
  batchName,
}: {
  courseId: number;
  courseName: string;
  batchName?: string;
}) {
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitContactForm({
      name: formData.name,
      phone: formData.phone,
      course_id: courseId,
      message: batchName ? `[${batchName}] ${formData.message}` : formData.message,
    });

    if (res.success) {
      setSuccess(true);
      setFormData({ name: "", phone: "", message: "" });
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 3000);
    } else {
      alert("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="font-extrabold text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 gap-2.5 px-7 h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <GraduationCap className="w-5 h-5" />
          ভর্তি হোন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ভর্তির জন্য যোগাযোগ করুন</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {courseName} {batchName ? `(${batchName})` : ""}
          </p>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">ধন্যবাদ!</h4>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
              আপনার তথ্য সফলভাবে জমা হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।
            </p>
          </div>
        ) : (
          <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">শিক্ষার্থীর নাম *</label>
              <input
                type="text"
                placeholder="আপনার পূর্ণ নাম"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3 h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {submitting ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CourseDetailView({
  course,
  initialBatchId,
}: {
  course: DetailedCourse;
  initialBatchId?: number;
}) {
  const batches = course.batches || [];

  // Default to initialBatchId, or first batch with curriculum, or first batch
  const defaultBatchId = useMemo(() => {
    if (initialBatchId && batches.some((b) => b.id === initialBatchId)) {
      return initialBatchId;
    }
    const withCurriculum = batches.find((b) => b.curriculums && b.curriculums.length > 0);
    return withCurriculum ? withCurriculum.id : batches[0]?.id || 0;
  }, [batches, initialBatchId]);

  const selectedBatchId = defaultBatchId;
  const [filter, setFilter] = useState<"all" | "class" | "exam">("all");

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const curriculum = selectedBatch?.curriculums?.[0] || null;

  // Filtered Sessions
  const allSessions: DraftSession[] = useMemo(() => {
    if (!curriculum?.sessions) return [];
    return curriculum.sessions;
  }, [curriculum]);

  const displaySessions = useMemo(() => {
    if (filter === "all") return allSessions;
    if (filter === "class") return allSessions.filter((s) => s.session_type === "class");
    if (filter === "exam") return allSessions.filter((s) => s.session_type === "exam");
    return allSessions;
  }, [allSessions, filter]);

  // Statistics
  const stats = useMemo(() => {
    let classes = 0;
    let exams = 0;
    let topics = 0;
    for (const s of allSessions) {
      if (s.session_type === "class") classes++;
      else if (s.session_type === "exam") exams++;
      topics += s.topics?.length || 0;
    }
    return { classes, exams, topics, total: allSessions.length };
  }, [allSessions]);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          সব কোর্স-এ ফিরে যান
        </Link>
      </div>

      {/* Course Header (Direct Text & Action) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2 pb-1">
        <div className="space-y-3.5 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-foreground leading-snug sm:leading-snug md:leading-[1.35] tracking-normal">
            {course.title}
          </h1>

          {course.details ? (
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl leading-relaxed">
              {course.details}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 self-start md:self-center md:pt-1">
          <EnrollModal
            courseId={course.id}
            courseName={course.title}
            batchName={selectedBatch?.name}
          />
        </div>
      </div>

      {/* Curriculum Roadmap Section */}
      {curriculum ? (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Total Classes */}
            <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 sm:p-7 shadow-sm hover:border-primary/40 transition-all duration-300 flex flex-col justify-center">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-none">
                {stats.classes}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-foreground mt-2 sm:mt-2.5">
                টি ক্লাস
              </span>
            </div>

            {/* Exams */}
            <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 sm:p-7 shadow-sm hover:border-primary/40 transition-all duration-300 flex flex-col justify-center">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-none">
                {stats.exams}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-foreground mt-2 sm:mt-2.5">
                টি মডেল টেস্ট
              </span>
            </div>

            {/* Topics */}
            <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 sm:p-7 shadow-sm hover:border-primary/40 transition-all duration-300 flex flex-col justify-center">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-none">
                {stats.topics}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-foreground mt-2 sm:mt-2.5">
                টি টপিক
              </span>
            </div>
          </div>

          {/* Curriculum Timeline Container */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-base sm:text-lg md:text-xl font-extrabold text-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-muted-foreground font-bold text-sm sm:text-base">শুরু:</span>
                  <span className="text-primary font-black">{format(new Date(curriculum.start_date), "dd MMM yyyy")}</span>
                </span>
                <span className="text-muted-foreground font-normal hidden sm:inline text-lg">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-muted-foreground font-bold text-sm sm:text-base">শেষ:</span>
                  <span className="text-primary font-black">{format(new Date(curriculum.end_date), "dd MMM yyyy")}</span>
                </span>
              </div>

              {/* Filter Buttons */}
              <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 self-start sm:self-auto backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                    filter === "all"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  সব সেশন ({stats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("class")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                    filter === "class"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  ক্লাস ({stats.classes})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("exam")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                    filter === "exam"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  পরীক্ষা ({stats.exams})
                </button>
              </div>
            </div>

            {/* Render Timeline */}
            <RoadmapTimeline readOnly={true} sessions={displaySessions} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/20">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <h4 className="text-lg font-bold text-foreground">
            সিলেবাস শিডিউল শীঘ্রই প্রকাশিত হবে
          </h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            এই ব্যাচের কারিকুলাম ও পূর্ণাঙ্গ ক্লাস রুটিন শীঘ্রই যুক্ত করা হবে। যেকোনো তথ্যের জন্য
            যোগাযোগ করুন।
          </p>
          <div className="pt-2">
            <EnrollModal
              courseId={course.id}
              courseName={course.title}
              batchName={selectedBatch?.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}
