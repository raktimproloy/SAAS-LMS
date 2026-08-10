"use client";

import { useEffect, useState, useRef } from "react";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allResults?: any[];
};

const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ease-out fill-mode-both ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} ${className}`}
    >
      {children}
    </div>
  );
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
      <div className="flex flex-col gap-4 w-full lg:h-[calc(100vh-150px)] lg:overflow-hidden">
        {/* Welcome Section Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 md:w-80 bg-white/10 rounded-lg" />
            <Skeleton className="h-5 w-48 bg-white/5 rounded-md" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full bg-white/10" />
        </div>

        {/* Main Content Grid Skeletons */}
        <div className="flex flex-col gap-4 lg:flex-1">
          {/* Top Row: Course & Next Exam */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 md:p-5 shadow-xl h-[140px] flex flex-col">
              <Skeleton className="h-6 w-40 mb-3 bg-white/10 rounded-md shrink-0" />
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-white/5">
                <Skeleton className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-white/10 rounded-md" />
                  <Skeleton className="h-4 w-1/2 bg-white/5 rounded-md" />
                </div>
              </div>
            </div>
            <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 md:p-5 shadow-xl h-[200px] lg:h-[140px] flex flex-col">
              <Skeleton className="h-5 w-24 mb-1 bg-white/5 rounded-md shrink-0" />
              <Skeleton className="h-7 w-64 mb-3 bg-white/10 rounded-md shrink-0" />
              <div className="flex-1 flex flex-col justify-end gap-3">
                <Skeleton className="h-14 w-full bg-white/5 rounded-xl shrink-0" />
                <Skeleton className="h-9 w-full bg-white/10 rounded-xl shrink-0" />
              </div>
            </div>
          </div>

          {/* Bottom Row: Performance + Notices & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:flex-1 lg:min-h-0">
            {/* Left Side */}
            <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0 order-2 lg:order-1">
              <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 md:p-5 shadow-xl lg:flex-1 lg:min-h-0 min-h-[200px] flex flex-col">
                <Skeleton className="h-6 w-48 mb-4 bg-white/10 rounded-md shrink-0" />
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 justify-center min-h-0 py-2">
                  <Skeleton className="w-20 h-20 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 w-full space-y-3 max-w-[200px] sm:max-w-none">
                    <Skeleton className="h-14 w-full bg-white/5 rounded-xl" />
                    <Skeleton className="h-9 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 md:p-5 shadow-xl lg:flex-1 lg:min-h-0 min-h-[250px] flex flex-col">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <Skeleton className="h-6 w-40 bg-white/10 rounded-md" />
                  <Skeleton className="h-7 w-20 bg-white/10 rounded-xl" />
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl shrink-0" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 md:p-5 shadow-xl lg:flex-1 lg:min-h-0 min-h-[400px] flex flex-col order-1 lg:order-2">
              <Skeleton className="h-6 w-56 mb-4 bg-white/10 rounded-md shrink-0" />
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex justify-between items-center px-2 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                  <Skeleton className="h-6 w-32 rounded-md bg-white/5" />
                  <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                </div>
                <div className="grid grid-cols-7 gap-2 flex-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-full bg-white/5 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
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
    <div className="flex flex-col gap-4 w-full lg:h-[calc(100vh-150px)] lg:overflow-hidden animate-in fade-in duration-300">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 animate-in slide-in-from-top-4 fade-in duration-500">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {student?.name}!
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            {student?.batch?.course?.title} &mdash; {student?.batch?.name}
          </p>
        </div>

        <div className="flex shrink-0">
          <Link href="/student/payments">
            <Button size="default" className={`rounded-full px-6 shadow-lg text-white border-0 transition-transform hover:scale-105 ${data?.paymentStatus === 'paid' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40' : 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-rose-500/20 hover:shadow-rose-500/40'}`}>
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
      <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0">
        
        {/* Top Row: Course & Next Exam */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:shrink-0">
          
          <ScrollReveal delay={100} className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden flex flex-col">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 shrink-0">
              <GraduationCap className="w-5 h-5 text-primary" />
              My Course & Batch
            </h3>
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5 hover:bg-background/80 transition-colors group relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-base md:text-lg text-foreground truncate">{student?.batch?.course?.title}</h4>
                  <p className="text-muted-foreground text-xs md:text-sm truncate">{student?.batch?.name}</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
          </ScrollReveal>

          <ScrollReveal delay={200} className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden group flex flex-col">
            {/* Decorative Glowing Circle */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />

            <div className="relative z-10 flex-1 flex flex-col min-h-0">
              <p className="text-muted-foreground font-bold mb-1 uppercase tracking-wider text-sm shrink-0">Next Exam</p>
              <h3 className="text-lg font-bold mb-3 text-foreground truncate shrink-0">{data?.upcomingExam ? data.upcomingExam.title : "No Exams Scheduled"}</h3>
              
              {data?.upcomingExam ? (
                <div className="flex-1 flex flex-col justify-end min-h-0">
                  <div className="space-y-1 mb-3 text-white text-xs bg-background/50 p-3 rounded-xl backdrop-blur-sm border border-white/5 w-full shrink-0">
                    <div className="flex items-center gap-3 font-medium">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <CalendarClock className="w-4 h-4 shrink-0" />
                      </div>
                      <span className="truncate">{new Date(data.upcomingExam.start_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3 font-medium">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      </div>
                      <span className="truncate">{data.upcomingExam.duration_minutes} Mins • {data.upcomingExam.total_marks} Marks</span>
                    </div>
                  </div>
                  <Link href={`/student/exams/${data.upcomingExam.id}/take`} className="block shrink-0">
                    <Button className="w-full h-9 rounded-xl animated-premium-glass hover:scale-[1.02] transition-all font-bold shadow-md shadow-primary/20 text-sm border-0">
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        <span>Start Exam</span>
                      </div>
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
          </ScrollReveal>

        </div>

        {/* Bottom Row: Performance + Notices (Left) & Calendar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:flex-1 lg:min-h-0">
          
          {/* Left Side: Split into Performance & Notices */}
          <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0 order-2 lg:order-1">
            
            <ScrollReveal delay={300} className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden group flex flex-col lg:flex-1 lg:min-h-0 min-h-[200px]">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
              
              <div className="flex justify-between items-center mb-2 relative z-10 shrink-0">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Performance
                </h3>
              </div>
              
              <div className="flex-1 relative z-10 flex items-center justify-center py-2">
                {data?.recentResult ? (
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 w-full h-full">
                    {/* SVG Ring Chart */}
                    <div className="relative w-20 h-20 shrink-0 hover:scale-105 transition-transform duration-500">
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                        <div className="text-2xl font-black text-foreground drop-shadow-md leading-none h-7 flex items-center justify-center">{data.recentResult.obtained_marks}</div>
                        <div className="text-[10px] font-bold text-muted-foreground border-t border-border/50 pt-1 mt-1 px-2 leading-none flex items-center justify-center">/ {data.recentResult.total_marks}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-center sm:text-left min-w-0 w-full sm:w-auto flex-1">
                      <div className="bg-background/40 p-3 rounded-xl border border-white/5 shadow-inner">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                          {data.recentResult.exam.type || 'EXAM'}
                        </p>
                        <p className="font-bold text-foreground text-sm line-clamp-2 leading-tight">
                          {data.recentResult.exam.title}
                        </p>
                      </div>
                      <Link href="/student/results">
                        <Button variant="default" className="w-full rounded-xl animated-premium-glass flex items-center justify-center group transition-all duration-300 shadow-md shadow-primary/20 h-9 text-xs font-bold border-0">
                          <div className="flex items-center justify-center">
                            <span>View All Results</span>
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
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
            </ScrollReveal>

            <ScrollReveal delay={500} className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden flex flex-col lg:flex-1 lg:min-h-0 min-h-[250px]">
              <div className="flex justify-between items-center mb-2 relative z-10 shrink-0">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
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
              
              <div className="flex-1 space-y-2 relative z-10 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                {data?.notices && data.notices.length > 0 ? (
                  data.notices.map((notice, i) => (
                    <div key={notice.id} className="p-3 rounded-xl bg-background/50 border border-white/5 hover:bg-background/80 hover:shadow-md transition-all shrink-0">
                      <h4 className="font-bold text-foreground mb-1 truncate text-base">{notice.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground bg-background/30 rounded-2xl border border-dashed border-white/10 p-4">
                    No new notices available at the moment.
                  </div>
                )}
              </div>
            </ScrollReveal>

          </div>

          <ScrollReveal delay={400} className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden flex flex-col lg:flex-1 lg:min-h-0 min-h-[400px] order-1 lg:order-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <h2 className="text-sm md:text-base font-bold mb-2 text-white flex items-center gap-2 shrink-0">
              <CalendarClock className="w-4 h-4 text-primary" />
              Attendance & Schedule
            </h2>
            <div className="relative z-10 flex-1 flex flex-col">
              <AttendanceCalendar 
                attendanceData={data?.attendance || []} 
                reports={data?.reports || []}
                allResults={data?.allResults || []}
                readOnly={true}
              />
            </div>
          </ScrollReveal>

        </div>

      </div>
    </div>
  );
}
