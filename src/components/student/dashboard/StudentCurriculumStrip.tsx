"use client";

import { useCallback, useEffect, useRef, useState, UIEvent } from "react";
import Link from "next/link";
import { format, parseISO, isToday } from "date-fns";
import {
  BookOpen,
  CalendarPlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashClass = {
  id: number;
  batch_id: number;
  curriculum_id: number | null;
  session_id: number | null;
  session_number: number | null;
  session_type: string;
  date: string;
  is_completed: boolean;
  exam_title: string | null;
  status: "done" | "running" | "upcoming";
  has_curriculum: boolean;
  has_session: boolean;
  has_homework: boolean;
  course: { id: number; title: string };
  batch: { id: number; name: string; start_time: string; end_time: string };
  curriculum_title: string | null;
  topics: { chapter_name: string; topic_name: string | null }[];
};

function statusLabel(s: DashClass["status"]) {
  if (s === "done") return "Done";
  if (s === "running") return "Running";
  return "Upcoming";
}

function statusBadgeClass(s: DashClass["status"]) {
  if (s === "running") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400";
  if (s === "done") return "bg-slate-500/10 text-slate-600 border-slate-300 dark:text-slate-400";
  return "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-400";
}

function cardStatusClass(s: DashClass["status"]) {
  if (s === "running") return "border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/60 shadow-sm ring-1 ring-emerald-500/20";
  if (s === "done") return "border-slate-200 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/30 opacity-75 grayscale-[0.3]";
  return "border-sky-200 bg-sky-50/30 dark:border-sky-800/50 dark:bg-sky-950/20";
}

export function StudentCurriculumStrip() {
  const [classes, setClasses] = useState<DashClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const userPicked = useRef(false);

  const pickAutoIndex = (list: DashClass[]) => {
    const running = list.findIndex((c) => c.status === "running");
    if (running >= 0) return running;
    const upcoming = list.findIndex((c) => c.status === "upcoming");
    if (upcoming >= 0) return upcoming;
    if (list.length > 0) return list.length - 1;
    return 0;
  };

  const scrollTo = useCallback((idx: number, smooth = true) => {
    if (!trackRef.current || !classes.length) return;
    const container = trackRef.current;
    const item = container.children[idx] as HTMLElement;
    if (item) {
      container.scrollTo({
        left: item.offsetLeft - container.offsetLeft - (container.offsetWidth * 0.05),
        behavior: smooth ? "smooth" : "auto",
      });
    }
    setIndex(idx);
  }, [classes.length]);

  const load = useCallback(async (opts?: { keepIndex?: boolean }) => {
    try {
      const res = await fetch("/api/student/dashboard/curriculum-today");
      const data = await res.json();
      const list: DashClass[] = data.classes || [];
      // Sort classes by date ascending just to be safe
      list.sort((a, b) => a.date.localeCompare(b.date));
      setClasses(list);

      if (!opts?.keepIndex && !userPicked.current) {
        const autoIdx = list.length ? pickAutoIndex(list) : 0;
        setIndex(autoIdx);
        // Scroll immediately
        setTimeout(() => scrollTo(autoIdx, false), 50);
      } else if (opts?.keepIndex) {
        setIndex((i) => Math.min(i, Math.max(0, list.length - 1)));
      }
    } catch (error) {
      console.error(error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [scrollTo]);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (!userPicked.current) load();
      else load({ keepIndex: true });
    }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const go = (next: number) => {
    if (!classes.length) return;
    userPicked.current = true;
    const newIdx = Math.max(0, Math.min(classes.length - 1, next));
    scrollTo(newIdx);
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const container = trackRef.current;
    const scrollLeft = container.scrollLeft;
    let newIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i] as HTMLElement;
      const childCenter = child.offsetLeft - container.offsetLeft;
      const diff = Math.abs(childCenter - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        newIdx = i;
      }
    }
    if (newIdx !== index) {
      setIndex(newIdx);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card shadow-sm p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm h-32">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading schedule…
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4 px-0.5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Schedule
          </h2>
          <Link href="/student/roadmap" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Full Roadmap
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-card to-card shadow-sm">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary/40" />
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarPlus className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">No classes scheduled</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Enjoy your day off or review previous topics!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Schedule (1 Week)
          </h2>
          <Link 
            href={classes.find((c) => c.curriculum_id)?.curriculum_id ? `/student/roadmap/${classes.find((c) => c.curriculum_id)?.curriculum_id}` : "/student/roadmap"} 
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Full Roadmap
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground tabular-nums">
            {index + 1}/{classes.length}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index <= 0}
            onClick={() => go(index - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index >= classes.length - 1}
            onClick={() => go(index + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-1 px-1 hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {classes.map((c) => {
          const topics = c.topics
            .slice(0, 2)
            .map((t) => (t.topic_name ? `${t.chapter_name} — ${t.topic_name}` : t.chapter_name))
            .join(" · ");

          const sessionHref = c.has_session && c.session_id ? `/student/curriculum/${c.session_id}` : null;
          const Wrapper = sessionHref ? Link : "div";
          const isClassToday = isToday(parseISO(c.date + "T00:00:00"));

          return (
            <Wrapper
              key={`${c.id}-${c.date}`}
              href={sessionHref as string}
              className={cn(
                "w-[85%] sm:w-[45%] md:w-[28%] shrink-0 snap-start rounded-2xl border bg-card p-4 sm:p-5 flex flex-col justify-between transition-all duration-200",
                cardStatusClass(c.status),
                sessionHref ? "hover:shadow-md cursor-pointer group relative" : "cursor-default relative opacity-80"
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      statusBadgeClass(c.status)
                    )}
                  >
                    {statusLabel(c.status)}
                  </span>
                  
                  {isClassToday && (
                    <Badge className="text-[10px] h-5 px-2">
                      Today
                    </Badge>
                  )}

                  {c.session_type === "exam" && c.has_session && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400">
                      Exam
                    </Badge>
                  )}
                  {c.has_homework && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400">
                      Homework
                    </Badge>
                  )}
                  {!c.has_session && c.status !== "upcoming" && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-background/50">
                      No topics added
                    </Badge>
                  )}
                </div>
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted-foreground/80 mb-0.5 flex items-center gap-1.5">
                    {format(parseISO(c.date + "T00:00:00"), "EEE, d MMM")} • {c.batch.start_time}
                  </p>
                  <p className="font-semibold text-base truncate text-foreground pr-4">{c.course.title}</p>
                </div>
                
                {c.has_session ? (
                  <p className="text-xs text-foreground/80 mt-1.5 line-clamp-2 min-h-[2rem]">
                    {topics || c.exam_title || c.curriculum_title || "No specific topics added."}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1.5 min-h-[2rem]">
                    No topics or notes have been added by the teacher yet.
                  </p>
                )}
              </div>
              
              {sessionHref && (
                <div className="absolute bottom-4 right-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <ChevronRightIcon className="w-4 h-4 text-primary" />
                </div>
              )}
            </Wrapper>
          );
        })}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
