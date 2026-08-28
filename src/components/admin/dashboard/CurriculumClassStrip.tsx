"use client";

import { useCallback, useEffect, useRef, useState, UIEvent, MouseEvent } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export type DashClass = {
  id: number;
  batch_id: number;
  curriculum_id: number | null;
  session_id: number | null;
  session_number: number | null;
  session_type: string;
  date: string;
  is_completed: boolean;
  exam_title: string | null;
  status: "done" | "running" | "upcoming" | "locked";
  has_curriculum: boolean;
  has_session: boolean;
  auto_focus: boolean;
  course: { id: number; title: string };
  batch: { id: number; name: string; start_time: string; end_time: string };
  curriculum_title: string | null;
  topics: { chapter_name: string; topic_name: string | null }[];
  attendance: { present: number; absent: number; late: number; total: number };
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

function localDoneKey(batchId: number, date: string) {
  return `dash-batch-done:${batchId}:${date}`;
}

export function CurriculumClassStrip() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<DashClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [marking, setMarking] = useState(false);
  const [localDone, setLocalDone] = useState<Record<number, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const userPicked = useRef(false);

  // Drag to scroll logic
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (!trackRef.current) return;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1; // 1 to 1 mouse movement to scroll ratio
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const applyLocalDone = (list: DashClass[]) => {
    const map: Record<number, boolean> = {};
    for (const c of list) {
      if (!c.has_curriculum && typeof window !== "undefined") {
        map[c.batch_id] = localStorage.getItem(localDoneKey(c.batch_id, c.date)) === "1";
      }
    }
    setLocalDone(map);
  };

  const pickAutoIndex = (list: DashClass[], locDone: Record<number, boolean>) => {
    const runningCurriculum = list.findIndex((c) => {
      const st = c.has_curriculum ? c.status : (locDone[c.batch_id] ? "done" : c.status);
      return st === "running";
    });
    if (runningCurriculum >= 0) return runningCurriculum;
    
    const upcomingCur = list.findIndex((c) => {
      const st = c.has_curriculum ? c.status : (locDone[c.batch_id] ? "done" : c.status);
      return st === "upcoming";
    });
    if (upcomingCur >= 0) return upcomingCur;
    
    const anyUpcoming = list.findIndex((c) => {
      const st = c.has_curriculum ? c.status : (locDone[c.batch_id] ? "done" : c.status);
      return st === "upcoming" || st === "running";
    });
    if (anyUpcoming >= 0) return anyUpcoming;
    
    if (list.length > 0) return list.length - 1;
    return 0;
  };

  const scrollTo = (idx: number, smooth = true) => {
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
  };

  const load = useCallback(async (opts?: { keepIndex?: boolean }) => {
    try {
      const res = await fetch("/api/admin/dashboard/classes");
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      const list: DashClass[] = data.classes || [];
      setClasses(list);
      
      const locDone: Record<number, boolean> = {};
      for (const c of list) {
        if (!c.has_curriculum && typeof window !== "undefined") {
          locDone[c.batch_id] = localStorage.getItem(localDoneKey(c.batch_id, c.date)) === "1";
        }
      }
      setLocalDone(locDone);

      if (!opts?.keepIndex && !userPicked.current) {
        const autoIdx = list.length ? pickAutoIndex(list, locDone) : 0;
        setIndex(autoIdx);
        setTimeout(() => scrollTo(autoIdx, false), 50);
      } else if (opts?.keepIndex) {
        setIndex((i) => Math.min(i, Math.max(0, list.length - 1)));
      }
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const effectiveStatus = (c: DashClass): DashClass["status"] => {
    if (c.has_curriculum) return c.status;
    if (localDone[c.batch_id]) return "done";
    return c.status;
  };

  const markDone = async (cls: DashClass) => {
    const st = effectiveStatus(cls);
    if (st === "done" || st === "upcoming") return;
    setMarking(true);
    try {
      if (cls.has_session && cls.curriculum_id && cls.session_id) {
        const res = await fetch(
          `/api/admin/curriculum/${cls.curriculum_id}/sessions/${cls.session_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_completed: true }),
          }
        );
        if (!res.ok) throw new Error("fail");
        toast({ title: "Done", description: "Class marked complete." });
        await load({ keepIndex: true });
      } else {
        localStorage.setItem(localDoneKey(cls.batch_id, cls.date), "1");
        setLocalDone((prev) => ({ ...prev, [cls.batch_id]: true }));
        toast({ title: "Done", description: "Batch slot marked for today." });
      }
    } catch {
      toast({ title: "Error", description: "Could not mark done.", variant: "destructive" });
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading today&apos;s classes…
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-0.5">
          Today&apos;s Classes
        </h2>
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-card to-card shadow-sm">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary/40" />
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarPlus className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">No batches scheduled today</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Active batches with today&apos;s class day will appear here in time order.
              </p>
            </div>
            <Link href="/admin/curriculum" className="shrink-0">
              <Button className="w-full sm:w-auto gap-2">
                <BookOpen className="w-4 h-4" />
                Curriculum
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Today&apos;s Classes
        </h2>
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
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-1 px-1 hide-scrollbar",
          isDragging ? "cursor-grabbing snap-none" : "cursor-grab"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {classes.map((c) => {
          const st = effectiveStatus(c);
          const classHref =
            c.has_session && c.curriculum_id
              ? `/admin/curriculum/${c.curriculum_id}/class/${c.date}`
              : null;
          const curriculumHref = c.curriculum_id
            ? `/admin/curriculum/${c.curriculum_id}`
            : "/admin/curriculum";
          const topics = c.topics
            .slice(0, 2)
            .map((t) =>
              t.topic_name ? `${t.chapter_name} — ${t.topic_name}` : t.chapter_name
            )
            .join(" · ");
          const canDone = st === "running";

          return (
            <div
              key={`${c.batch_id}-${c.date}`}
              className={cn(
                "w-[75%] sm:w-[45%] md:w-[32%] lg:w-[28%] shrink-0 snap-start rounded-2xl border bg-card/80 backdrop-blur-sm p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                cardStatusClass(st)
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      statusBadgeClass(st)
                    )}
                  >
                    {statusLabel(st)}
                  </span>
                  {!c.has_curriculum && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      No curriculum
                    </Badge>
                  )}
                  {c.has_curriculum && !c.has_session && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      No session today
                    </Badge>
                  )}
                  {c.session_type === "exam" && c.has_session && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-orange-500/10 text-orange-600 border-orange-200">
                      Exam
                    </Badge>
                  )}
                </div>
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted-foreground/80 mb-0.5 flex items-center gap-1.5">
                    {format(parseISO(c.date + "T00:00:00"), "EEE, d MMM")} • {c.batch.start_time}–{c.batch.end_time}
                  </p>
                  <p className="font-semibold text-base truncate text-foreground">{c.course.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {c.batch.name}
                    {c.session_number != null ? ` • Class ${c.session_number}` : ""}
                  </p>
                </div>
                
                {c.has_session ? (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 min-h-[2rem]">
                    {topics || c.exam_title || c.curriculum_title || "No topics"}
                  </p>
                ) : c.has_curriculum ? (
                  <p className="text-xs text-muted-foreground mt-1.5 min-h-[2rem]">
                    Active curriculum, but no class/exam session for today.
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1.5 min-h-[2rem]">
                    Curriculum not set up — create one to open the class hub.
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5">
                  {classHref ? (
                    <>
                      <Link
                        href={classHref}
                        className="inline-flex items-center gap-1 rounded-md bg-green-500/10 dark:bg-green-500/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <Users className="w-3 h-3" />
                        <span>{c.attendance.present + c.attendance.late}/{c.attendance.total}</span>
                      </Link>
                      <Link
                        href={classHref}
                        className="inline-flex items-center gap-1 rounded-md bg-red-500/10 dark:bg-red-500/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <UserX className="w-3 h-3" />
                        <span>{c.attendance.absent}</span>
                      </Link>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {c.attendance.present + c.attendance.late}/{c.attendance.total}
                    </span>
                  )}
                </div>

                <div className="ml-auto flex gap-2">
                  {canDone && (
                    <Button
                      size="sm"
                      className="h-7 px-2.5 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={marking}
                      onClick={() => markDone(c)}
                    >
                      {marking ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Done
                    </Button>
                  )}
                  {st === "done" && (
                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs opacity-70" disabled>
                      Done
                    </Button>
                  )}
                  {classHref ? (
                    <Link href={classHref}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                        Open
                      </Button>
                    </Link>
                  ) : c.has_curriculum ? (
                    <Link href={curriculumHref}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                        View
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/admin/curriculum">
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1">
                        <BookOpen className="w-3 h-3" />
                        Setup
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
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

