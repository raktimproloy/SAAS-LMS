"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle2, XCircle, FileText, AlertTriangle } from "lucide-react";
import { AttendanceCalendar } from "@/components/student/attendance-calendar";
import { RankBadge } from "@/components/student/rank-badge";

type DashboardData = {
  attendance: { date: string | Date; status: "present" | "absent" | "late" }[];
  recentResult: { obtained_marks: number; total_marks: number; correct_count: number; wrong_count: number; rank?: number; exam: { title: string } } | null;
  upcomingExam: { title: string; start_time: string | Date; duration_minutes: number; total_marks: number } | null;
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
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {student?.name}!
          </h1>
          <p className="text-muted-foreground">
            {student?.batch?.course?.title} — {student?.batch?.name}
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          {data?.recentResult?.rank && (
            <RankBadge rank={data.recentResult.rank} />
          )}
          <Badge variant="outline" className={`px-4 py-1.5 text-sm ${data?.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {data?.paymentStatus === 'paid' ? (
              <><CheckCircle2 className="w-4 h-4 mr-1.5 inline" /> Fee Paid</>
            ) : (
              <><XCircle className="w-4 h-4 mr-1.5 inline" /> Fee Due</>
            )}
          </Badge>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Calendar & Notices */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceCalendar 
            attendanceData={data?.attendance || []} 
            reports={data?.reports || []}
            readOnly={true}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Recent Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.notices && data.notices.length > 0 ? (
                <div className="space-y-4">
                  {data.notices.map((notice) => (
                    <div key={notice.id} className="p-4 rounded-lg bg-muted/50 border">
                      <h4 className="font-semibold text-foreground">{notice.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No new notices.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upcoming & Recent Results */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <CalendarClock className="w-5 h-5" />
                Upcoming Exam
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.upcomingExam ? (
                <div className="space-y-3">
                  <div className="font-bold text-xl text-foreground">
                    {data.upcomingExam.title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="w-4 h-4" />
                    {new Date(data.upcomingExam.start_time).toLocaleString()}
                  </div>
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Details</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Duration:</div>
                      <div className="font-medium text-right">{data.upcomingExam.duration_minutes} min</div>
                      <div className="text-muted-foreground">Marks:</div>
                      <div className="font-medium text-right">{data.upcomingExam.total_marks}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="bg-muted/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-muted-foreground/70" />
                  </div>
                  No upcoming exams scheduled.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                Recent Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recentResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <FileText className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-sm font-medium text-muted-foreground mb-1">{data.recentResult.exam.title}</p>
                      <div className="text-4xl font-black text-foreground mb-2">
                        {data.recentResult.obtained_marks} <span className="text-lg font-medium text-muted-foreground/70">/ {data.recentResult.total_marks}</span>
                      </div>
                      <div className="flex justify-center gap-4 text-sm mt-4">
                        <div className="text-green-600 font-medium">Correct: {data.recentResult.correct_count}</div>
                        <div className="text-red-500 font-medium">Wrong: {data.recentResult.wrong_count}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No results available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
