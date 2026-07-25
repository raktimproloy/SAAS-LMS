"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle2, XCircle, FileText, AlertTriangle, Play, ChevronRight, GraduationCap } from "lucide-react";
import { AttendanceCalendar } from "@/components/student/attendance-calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardData = {
  attendance: { date: string | Date; status: "present" | "absent" | "late" }[];
  recentResult: { obtained_marks: number; total_marks: number; correct_count?: number; wrong_count?: number; rank?: number; grade?: string; exam: { title: string; type: string; id: number } } | null;
  upcomingExam: { id: number; title: string; start_time: string | Date; duration_minutes: number; total_marks: number } | null;
  paymentStatus: string;
  notices: { id: number; title: string; content: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports?: any[];
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
      <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in duration-500">
        {/* Welcome Section Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 md:w-96 bg-white/10 rounded-2xl" />
            <Skeleton className="h-6 w-48 bg-white/5 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
        </div>

        {/* Top Row Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-xl h-[160px]">
            <Skeleton className="h-6 w-48 mb-4 bg-white/10 rounded-xl" />
            <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
          </div>
          <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-xl h-[160px]">
            <Skeleton className="h-6 w-40 mb-4 bg-white/10 rounded-xl" />
            <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>

        {/* Bottom Row Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-xl h-[350px]">
            <Skeleton className="h-6 w-48 mb-6 bg-white/10 rounded-xl" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-xl h-[350px] flex flex-col gap-4">
            <Skeleton className="h-6 w-40 mb-2 bg-white/10 rounded-xl shrink-0" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-2xl shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentage for the ring chart
  const performancePercentage = data?.recentResult ? Math.round((data.recentResult.obtained_marks / data.recentResult.total_marks) * 100) : 0;
  const strokeDasharray = 283; // 2 * pi * r (r=45)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * performancePercentage) / 100;

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-160px)] overflow-hidden">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-aos="fade-down" data-aos-duration="800">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {student?.name}!
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            {student?.batch?.course?.title} &mdash; {student?.batch?.name}
          </p>
        </div>

        <div className="flex shrink-0">
          <Link href="/student/payments">
            <Button size="lg" className={`rounded-full px-8 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 text-white border-0 transition-transform hover:scale-105 hover:shadow-primary/40 ${data?.paymentStatus === 'paid' ? 'from-emerald-500 to-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40' : ''}`}>
              {data?.paymentStatus === 'paid' ? (
                <><CheckCircle2 className="w-5 h-5 mr-2" /> Fees Paid</>
              ) : (
                <><XCircle className="w-5 h-5 mr-2" /> Fees Due</>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Grid - Naturally Scales */}
      <div className="flex flex-col gap-4 mt-1 flex-1 min-h-0">
        
        {/* Top Row: Course & Next Exam */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:shrink-0">
          
          {/* Enrolled Courses / Batches */}
          <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col h-full" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-base font-semibold text-foreground/90 mb-2 flex items-center gap-2 shrink-0">
              <GraduationCap className="w-4 h-4 text-primary" />
              My Course & Batch
            </h3>
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5 hover:bg-background/80 transition-colors group relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-lg text-foreground truncate">{student?.batch?.course?.title}</h4>
                  <p className="text-muted-foreground text-sm truncate">{student?.batch?.name}</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
          </div>

          {/* Upcoming Exam Card */}
          <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden group flex flex-col h-full" data-aos="fade-up" data-aos-delay="200">
            {/* Decorative Glowing Circle */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
            
            <div className="absolute top-6 right-6 w-14 h-14 bg-background/50 rounded-full backdrop-blur-md border border-white/5 flex items-center justify-center shadow-sm">
              <CalendarClock className="w-6 h-6 text-primary/80" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col min-h-0">
              <p className="text-muted-foreground font-bold mb-1 uppercase tracking-wider text-xs shrink-0">Next Exam</p>
              <h3 className="text-xl font-bold mb-3 text-foreground truncate shrink-0">{data?.upcomingExam ? data.upcomingExam.title : "No Exams Scheduled"}</h3>
              
              {data?.upcomingExam ? (
                <div className="flex-1 flex flex-col justify-end min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                  <div className="space-y-1 mb-3 text-muted-foreground text-xs bg-background/50 p-3 rounded-xl backdrop-blur-sm border border-white/5 w-max max-w-full shrink-0">
                    <div className="flex items-center gap-2 font-medium truncate">
                      <CalendarClock className="w-4 h-4 text-primary/70 shrink-0" />
                      {new Date(data.upcomingExam.start_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 font-medium truncate">
                      <CheckCircle2 className="w-4 h-4 text-primary/70 shrink-0" />
                      {data.upcomingExam.duration_minutes} Mins • {data.upcomingExam.total_marks} Marks
                    </div>
                  </div>
                  <Link href={`/student/exams/${data.upcomingExam.id}/take`} className="block shrink-0">
                    <Button className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_auto] animate-gradient text-white hover:scale-[1.02] transition-all font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] text-sm border-0">
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      Start Exam
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-end">
                  <Button disabled className="w-full h-12 rounded-2xl bg-background/50 text-muted-foreground border border-white/5 cursor-not-allowed">
                    Relax for now
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Row: Performance + Notices (Left) & Calendar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          
          {/* Left Side: Split into Performance & Notices */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            
            {/* Recent Performance Card */}
            <div className="flex-1 bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden group flex flex-col min-h-0" data-aos="fade-up" data-aos-delay="300">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
              
              <div className="flex justify-between items-center mb-2 relative z-10 shrink-0">
                <h3 className="text-base font-semibold text-foreground/90 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Recent Performance
                </h3>
              </div>
              
              <div className="flex-1 relative z-10 flex items-center justify-center py-2">
                {data?.recentResult ? (
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 w-full h-full">
                    {/* SVG Ring Chart */}
                    <div className="relative w-24 h-24 shrink-0 hover:scale-105 transition-transform duration-500">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted/50" strokeWidth="8" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          className="stroke-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-black text-foreground drop-shadow-md">{data.recentResult.obtained_marks}</div>
                        <div className="text-xs font-medium text-muted-foreground border-t border-border/50 pt-1 mt-1 px-2">/ {data.recentResult.total_marks}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-center sm:text-left min-w-0">
                      <p className="font-medium text-foreground text-sm bg-background/50 px-3 py-1.5 rounded-xl border border-white/5 shadow-sm truncate">
                        {data.recentResult.exam.title}
                      </p>
                      <Link href="/student/results">
                        <Button variant="ghost" className="w-full rounded-xl hover:bg-primary/10 text-primary hover:text-primary flex items-center justify-between group-hover:px-4 transition-all duration-300 border border-transparent text-sm h-8">
                          View All Results
                          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">No performance data yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notices Section */}
            <div className="flex-1 bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-lg relative overflow-hidden flex flex-col min-h-0" data-aos="fade-up" data-aos-delay="400">
              <div className="flex justify-between items-center mb-2 relative z-10 shrink-0">
                <h3 className="text-base font-semibold text-foreground/90 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 drop-shadow-sm" />
                  Recent Notices
                </h3>
                <Link href="/student/notices">
                  <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 text-primary group h-7 text-xs px-2">
                    View All
                    <ChevronRight className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex-1 space-y-2 relative z-10 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                {data?.notices && data.notices.length > 0 ? (
                  data.notices.map((notice, i) => (
                    <div key={notice.id} className="p-3 rounded-xl bg-background/50 border border-white/5 hover:bg-background/80 hover:shadow-md transition-all shrink-0">
                      <h4 className="font-semibold text-foreground mb-1 truncate text-sm">{notice.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notice.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground bg-background/30 rounded-2xl border border-dashed border-white/10 p-4">
                    No new notices available at the moment.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Side: Calendar */}
          <div className="h-full min-h-0 bg-card/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col" data-aos="fade-up" data-aos-delay="400">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <h2 className="text-base font-bold mb-2 text-foreground/90 flex items-center gap-2 shrink-0">
              <CalendarClock className="w-4 h-4 text-primary" />
              Attendance & Schedule
            </h2>
            <div className="relative z-10 flex-1 flex flex-col">
              <AttendanceCalendar 
                attendanceData={data?.attendance || []} 
                reports={data?.reports || []}
                readOnly={true}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
