"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, XCircle, FileText, AlertTriangle, Play, ChevronRight, TrendingUp, Activity } from "lucide-react";
import { AttendanceCalendar } from "@/components/student/attendance-calendar";
import { StudentCurriculumStrip } from "@/components/student/dashboard/StudentCurriculumStrip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type RecentResultItem = {
  id: number;
  exam_id: number;
  obtained_marks: number;
  total_marks: number;
  rank?: number | null;
  grade?: string | null;
  created_at: string | Date;
  exam: {
    id: number;
    title: string;
    type: string;
    start_time?: string | Date | null;
    total_marks?: number;
  };
};

type DashboardData = {
  attendance: { date: string | Date; status: "present" | "absent" | "late" }[];
  recentResult: RecentResultItem | null;
  recentResults?: RecentResultItem[];
  upcomingExam: { id: number; title: string; start_time: string | Date; duration_minutes: number; total_marks: number } | null;
  paymentStatus: string;
  notices: { id: number; title: string; content: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allResults?: any[];
};



export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [student, setStudent] = useState<{ name: string; batch: { name: string; course: { title: string } } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/student/me').then(res => res.json()),
      fetch('/api/student/dashboard').then(res => res.json())
    ]).then(([me, dashboard]) => {
      setStudent(me);
      setData(dashboard);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <Skeleton className="h-8 w-56 sm:w-72 bg-muted rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-full bg-muted" />
        </div>
        
        {/* Curriculum Strip */}
        <Skeleton className="h-[120px] w-full rounded-2xl bg-card/50 border border-border/50" />

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Skeleton className="h-[260px] w-full rounded-2xl bg-card/50 border border-border/50" />
            <Skeleton className="flex-1 min-h-[260px] w-full rounded-2xl bg-card/50 border border-border/50" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-full min-h-[540px] w-full rounded-2xl bg-card/50 border border-border/50" />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[250px] w-full rounded-2xl bg-card/50 border border-border/50" />
          <Skeleton className="h-[250px] w-full rounded-2xl bg-card/50 border border-border/50" />
        </div>
      </div>
    );
  }

  const recentResults =
    data?.recentResults && data.recentResults.length > 0
      ? data.recentResults
      : data?.recentResult
        ? [data.recentResult]
        : [];

  const attendancePct = data?.attendance?.length 
    ? Math.round((data.attendance.filter(d => d.status === "present" || d.status === "late").length / data.attendance.length) * 100) 
    : 0;

  const resultPct = recentResults.length > 0 
    ? Math.round(recentResults.reduce((acc, r) => acc + (r.obtained_marks / (r.total_marks || 1)) * 100, 0) / recentResults.length) 
    : 0;

  const overallPct = Math.round(
    (attendancePct + resultPct) / 
    ((data?.attendance?.length ? 1 : 0) + (recentResults.length > 0 ? 1 : 0) || 1)
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Welcome */}
      <div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0"
        data-aos="fade-down"
      >
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {student?.name}!
        </h1>
        <Link href="/student/payments" className="shrink-0">
          <Button
            size="default"
            className={`rounded-full px-6 shadow-lg text-white border-0 transition-transform hover:scale-105 ${
              data?.paymentStatus === "paid"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40"
                : "bg-gradient-to-r from-rose-500 to-rose-400 shadow-rose-500/20 hover:shadow-rose-500/40"
            }`}
          >
            {data?.paymentStatus === "paid" ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" /> Fees Paid
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 mr-2" /> Fees Due
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* Curriculum Strip */}
      <div data-aos="fade-right" data-aos-delay="100" className="w-full">
        <StudentCurriculumStrip />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-6" data-aos="fade-up" data-aos-delay="100">
        
        {/* Top Row: Performance & Next Exam (Left) + Calendar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (1 part): Performance, Next Exam */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            
            {/* Performance Overview */}
            <div className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border rounded-2xl p-4 md:p-5 shadow-lg flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Overall Performance</h3>
              </div>
              
              <div className="flex items-center justify-center p-6 bg-background/60 rounded-xl border border-border/50 mb-4 relative">
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0 overflow-visible" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-primary/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="48"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 - (overallPct / 100) * (2 * Math.PI * 48)}
                      className="text-primary drop-shadow-[0_0_12px_rgba(25,170,248,0.6)] transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center justify-center z-10">
                    <span className="text-2xl font-bold text-primary leading-none">{overallPct}%</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Average</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-3 bg-background/40 rounded-xl border border-border/40 text-center">
                  <span className="text-xs text-muted-foreground font-semibold mb-1">Attendance</span>
                  <span className="text-lg font-bold text-emerald-500">
                    {attendancePct}%
                  </span>
                </div>
                <div className="flex flex-col p-3 bg-background/40 rounded-xl border border-border/40 text-center">
                  <span className="text-xs text-muted-foreground font-semibold mb-1">Results</span>
                  <span className="text-lg font-bold text-primary">
                    {resultPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Next Exam (flex-1 to stretch and match Calendar height) */}
            <div className="bg-card/90 dark:bg-card/40 backdrop-blur-3xl border border-border rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden group flex flex-col flex-1 min-h-[250px]">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-1">
                  <p className="text-muted-foreground font-bold mb-1 uppercase tracking-wider text-sm">Next Exam</p>
                  <h3 className="text-lg font-bold mb-3 text-foreground truncate">
                    {data?.upcomingExam ? data.upcomingExam.title : "No Exams Scheduled"}
                  </h3>
                </div>
                {data?.upcomingExam ? (
                  <div className="mt-auto">
                    <div className="space-y-1 mb-3 text-foreground text-xs bg-background/50 p-3 rounded-xl backdrop-blur-sm border border-border/60 w-full">
                      <div className="flex items-center gap-3 font-medium">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <CalendarClock className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="truncate">
                          {new Date(data.upcomingExam.start_time).toLocaleString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-medium">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="truncate">
                          {data.upcomingExam.duration_minutes} Mins • {data.upcomingExam.total_marks} Marks
                        </span>
                      </div>
                    </div>
                    <Link href={`/student/exams/${data.upcomingExam.id}/take`} className="block">
                      <Button className="w-full h-11 rounded-xl animated-premium-glass hover:scale-[1.02] transition-all font-bold shadow-md shadow-primary/20 text-sm border-0">
                        <div className="flex items-center">
                          <Play className="w-4 h-4 mr-2 fill-current" />
                          <span>Start Exam</span>
                        </div>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-auto flex-1 flex items-center justify-center text-muted-foreground/50 italic min-h-[100px]">
                    No upcoming exams
                  </div>
                )}
              </div>
            </div>

          </div>
          
          {/* Right Column (2 parts): Calendar */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="h-full w-full bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border rounded-2xl shadow-lg flex flex-col overflow-hidden">
              <AttendanceCalendar
                attendanceData={data?.attendance || []}
                reports={data?.reports || []}
                allResults={data?.allResults || []}
                readOnly={true}
                className="h-full border-0"
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Results & Notices (Half-Half) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Offline Results */}
          <div className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border rounded-2xl p-4 md:p-5 shadow-lg flex flex-col portal-panel">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Offline Results
              </h3>
              <Link href="/student/results?tab=offline">
                <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 text-primary group h-7 text-xs px-2">
                  View All
                  <ChevronRight className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {recentResults.length > 0 ? (
              <div className="space-y-2">
                {recentResults.map((result) => {
                  const examId = result.exam_id ?? result.exam?.id;
                  const total = result.total_marks || result.exam?.total_marks || 0;
                  const pct = total > 0 ? Math.round((result.obtained_marks / total) * 100) : 0;
                  const resultDate = result.exam?.start_time || result.created_at;
                  const dateLabel = new Date(resultDate).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  const row = (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {result.exam?.title || "Exam"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <CalendarClock className="w-3 h-3 shrink-0" />
                          {dateLabel}
                          {result.exam?.type ? (
                            <span className="uppercase tracking-wide text-[10px] font-semibold text-primary/80">
                              · Offline
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-foreground leading-none">
                          {result.obtained_marks}
                          <span className="text-muted-foreground font-bold text-xs"> / {total}</span>
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground mt-1">{pct}%</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
                    </>
                  );

                  if (!examId) {
                    return (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/60"
                      >
                        {row}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={result.id}
                      href={`/student/exams/${examId}/result`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/60 hover:bg-background/80 hover:border-primary/30 transition-all group"
                    >
                      {row}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 flex-1">
                <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium text-sm">No results yet.</p>
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border rounded-2xl p-4 md:p-5 shadow-lg flex flex-col h-full portal-panel">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 drop-shadow-sm" />
                Recent Notices
              </h3>
              <Link href="/student/notices">
                <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 text-primary group h-7 text-xs px-2">
                  View All
                  <ChevronRight className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar max-h-[280px]">
              {data?.notices && data.notices.length > 0 ? (
                data.notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 rounded-xl bg-background/50 border border-border/60 hover:bg-background/80 hover:shadow-md transition-all shrink-0"
                  >
                    <h4 className="font-bold text-foreground mb-1 truncate text-base">{notice.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                  </div>
                ))
              ) : (
                <div className="h-full min-h-[120px] flex items-center justify-center text-center text-muted-foreground bg-background/30 rounded-2xl border border-dashed border-border p-4">
                  No new notices available at the moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
