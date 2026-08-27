"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  UserX,
  Clock,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import ClassSessionTabs from "@/components/admin/curriculum/ClassSessionTabs";
import { ClassHomeworkBlock } from "@/components/admin/curriculum/ClassHomeworkBlock";
import { ClassSessionCalendar } from "@/components/admin/curriculum/ClassSessionCalendar";
import { cn } from "@/lib/utils";

export default function ClassSessionPage() {
  const params = useParams();
  const id = params.id as string;
  const dateStr = params.date as string;

  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [marking, setMarking] = useState(false);
  const [attSummary, setAttSummary] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  const loadAttendance = useCallback(
    async (batchId: number) => {
      try {
        const res = await fetch(`/api/admin/attendance?batch_id=${batchId}&date=${dateStr}`);
        if (!res.ok) return;
        const data = await res.json();
        const students = data.students || [];
        let present = 0;
        let absent = 0;
        let late = 0;
        for (const s of students) {
          const st = (s.attendance?.status || "").toLowerCase();
          if (st === "present") present++;
          else if (st === "late") late++;
          else if (st === "absent") absent++;
        }
        setAttSummary({ present, absent, late, total: students.length });
      } catch {
        /* ignore */
      }
    },
    [dateStr]
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/curriculum/${id}`);

      if (res.ok) {
        const data = await res.json();
        setCurriculum(data);

        const targetSession = data.sessions?.find((s: any) => {
          const raw = typeof s.date === "string" ? s.date : s.date;
          const sDate = format(
            parseISO(String(raw).includes("T") ? String(raw) : `${String(raw).slice(0, 10)}T00:00:00`),
            "yyyy-MM-dd"
          );
          return sDate === dateStr;
        });

        if (targetSession) {
          setSession(targetSession);
          if (data.batch?.id) await loadAttendance(data.batch.id);
        } else {
          toast({
            title: "Not found",
            description: "No class on this date.",
            variant: "destructive",
          });
          router.push(`/admin/curriculum/${id}`);
        }
      } else {
        toast({
          title: "Error",
          description: "Could not load curriculum.",
          variant: "destructive",
        });
        router.push("/admin/curriculum");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, dateStr, loadAttendance, router, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markDone = async () => {
    if (!session || session.is_completed) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/admin/curriculum/${id}/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: true }),
      });
      if (!res.ok) throw new Error("fail");
      toast({ title: "Done", description: "Class marked as complete." });
      await fetchData();
    } catch {
      toast({ title: "Error", description: "Could not mark done.", variant: "destructive" });
    } finally {
      setMarking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!curriculum || !session) return null;

  const sessionDate = parseISO(
    String(session.date).includes("T")
      ? String(session.date)
      : `${String(session.date).slice(0, 10)}T00:00:00`
  );
  const batch = curriculum.batch;
  const startTime = batch?.start_time || "—";
  const endTime = batch?.end_time || "—";

  const sessionLabel =
    session.session_type === "exam"
      ? "Exam"
      : session.session_type === "holiday"
        ? "Holiday"
        : session.session_type === "skipped"
          ? "Skipped"
          : `Class ${session.session_number}`;

  const presentCount = attSummary.present + attSummary.late;

  return (
    <div className="flex w-full flex-col gap-6 pb-24 sm:pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Link href={`/admin/curriculum/${id}`}>
            <Button variant="outline" size="icon" className="shrink-0 mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 space-y-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {format(sessionDate, "EEEE, d MMMM yyyy")}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base mt-1">
                {curriculum.title} · {curriculum.course?.title} · {batch?.name}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                {sessionLabel}
              </Badge>
              {session.is_completed ? (
                <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </Badge>
              ) : (
                <Badge variant="secondary">In progress</Badge>
              )}
              {(session.session_type === "holiday" || session.is_holiday) && session.holiday_name && (
                <Badge variant="outline" className="gap-1 border-orange-200 bg-orange-50 text-orange-700">
                  <AlertCircle className="h-3 w-3" /> {session.holiday_name}
                </Badge>
              )}
              {session.session_type === "exam" && session.exam_title && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                  {session.exam_title}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:pt-1">
          <Button
            className="hidden gap-2 sm:inline-flex"
            disabled={marking || session.is_completed}
            onClick={markDone}
          >
            {marking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {session.is_completed ? "Already done" : "Mark as done"}
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-none shadow-sm dark:bg-slate-800/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Present</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {presentCount}
                <span className="text-sm font-normal text-muted-foreground">/{attSummary.total}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-slate-800/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Absent</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-400">
                {attSummary.absent}
                <span className="text-sm font-normal text-muted-foreground">/{attSummary.total}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-slate-800/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Time</p>
              <p className="text-sm font-semibold">
                {startTime} – {endTime}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm dark:bg-slate-800/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
              <CalendarDays className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Session</p>
              <p className="text-sm font-semibold">{sessionLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2nd Row: Topics and Homework Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        {/* Topics */}
        <Card className="w-full border-none shadow-sm dark:bg-slate-800/50 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Today&apos;s Topics
            </CardTitle>
            <CardDescription>Topics scheduled for this session</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {session.topics?.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {session.topics.map((topic: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{topic.chapter_name}</p>
                      {topic.topic_name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{topic.topic_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">
                No topics assigned for this session.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Homework */}
        {batch?.id ? (
          <ClassHomeworkBlock
            curriculumId={curriculum.id}
            batchId={batch.id}
            session={session}
            allSessions={curriculum.sessions || []}
          />
        ) : (
          <div />
        )}
      </div>

      {/* 3rd Row: Tabs */}
      <Card className="w-full border-none shadow-sm dark:bg-slate-800/50 overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Class Hub</CardTitle>
          <CardDescription>
            Attendance, notes, books and question bank
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ClassSessionTabs
            session={session}
            curriculum={curriculum}
            dateStr={dateStr}
            onAttendanceChange={() => batch?.id && loadAttendance(batch.id)}
          />
        </CardContent>
      </Card>

      {/* Mobile sticky Done */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        )}
      >
        <Button
          className="h-12 w-full gap-2 text-base"
          disabled={marking || session.is_completed}
          onClick={markDone}
        >
          {marking ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          {session.is_completed ? "Already done" : "Mark as done"}
        </Button>
      </div>
    </div>
  );
}
