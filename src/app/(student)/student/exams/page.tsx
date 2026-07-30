/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Play, FileQuestion, Target, Trophy, Eye, CheckCircle2, XCircle, Medal } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function StudentExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/exams')
      .then(res => res.json())
      .then(data => {
        setExams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatus = (exam: any) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = exam.end_time ? new Date(exam.end_time) : null;

    if (exam.results && exam.results.length > 0) return "completed";
    if (now < startTime) return "upcoming";
    if (endTime && now > endTime) return "missed";
    return "active";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-10">
      <div className="flex flex-col gap-2 relative z-10" data-aos="fade-down" data-aos-duration="800">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">My Exams</h1>
        <p className="text-muted-foreground text-lg">View and take your assigned exams below.</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-16 text-center text-muted-foreground shadow-lg relative overflow-hidden" data-aos="fade-up">
           <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -ml-20 -mt-20 pointer-events-none" />
          <FileQuestion className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6 relative z-10" />
          <p className="text-xl font-bold text-foreground mb-2 relative z-10">No Exams Available</p>
          <p className="text-md relative z-10">There are currently no exams assigned to your batch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
          {exams.map((exam, index) => {
            const status = getStatus(exam);
            const isAttempted = exam.results && exam.results.length > 0;
            const result = isAttempted ? exam.results[0] : null;

            return (
              <div 
                key={exam.id} 
                className={`group flex flex-col relative rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl bg-card/60 backdrop-blur-3xl border border-white/10 shadow-lg ${
                  status === 'active' ? 'ring-1 ring-primary/50 shadow-primary/20' : ''
                }`}
                data-aos="fade-up" 
              >
                {/* Background Decor */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700 ${status === 'active' ? 'bg-primary/30' : 'bg-white/10'}`} />
                {status === 'active' && <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none animate-pulse" />}

                <CardHeader className="p-6 pb-4 border-b border-white/10 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={`capitalize px-3 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md
                      ${status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : ''}
                      ${status === 'active' ? 'bg-primary/20 text-blue-300 border-primary/40' : ''}
                      ${status === 'missed' ? 'bg-destructive/20 text-red-300 border-destructive/30' : ''}
                      ${status === 'upcoming' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : ''}
                      ${status !== 'active' && status !== 'completed' && status !== 'missed' && status !== 'upcoming' ? 'bg-background/50 text-white border-white/10' : ''}
                    `}>
                      {status}
                    </Badge>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-blue-300 border border-primary/20 backdrop-blur-md shadow-sm">
                      {exam.total_marks} Marks
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2 leading-snug font-bold text-white">
                    {exam.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 flex-1 space-y-6 relative z-10">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0 text-blue-300" />
                      <span className="truncate text-white">{exam.start_time ? format(new Date(exam.start_time), "MMM d, h:mm a") : 'No Start Time'}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-right">
                      <span className="text-white font-semibold">{exam.duration_minutes} Mins</span>
                      <Clock className="w-4 h-4 shrink-0 text-blue-300" />
                    </div>
                    <div className="flex items-center gap-2">
                      <FileQuestion className="w-4 h-4 shrink-0 text-blue-300" />
                      <span className="text-white font-semibold">{exam._count?.questions || 0} Qs</span>
                    </div>
                    {exam.negative_marking > 0 && (
                      <div className="flex items-center justify-end gap-2 text-red-300 font-bold bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 w-fit ml-auto">
                        <span>-{exam.negative_marking} / wrong</span>
                        <Target className="w-4 h-4 shrink-0" />
                      </div>
                    )}
                  </div>

                  {isAttempted && result && (
                    <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-3 backdrop-blur-sm">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Score</p>
                          <p className="text-2xl font-black text-white leading-none">
                            {result.obtained_marks} <span className="text-sm font-bold text-muted-foreground">/ {result.total_marks}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Accuracy</p>
                          <p className="text-lg font-black text-emerald-300 leading-none">
                            {result.correct_count + result.wrong_count > 0 
                              ? Math.round((result.correct_count / (result.correct_count + result.wrong_count)) * 100) 
                              : 0}%
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-3 border-t border-white/10 text-muted-foreground font-medium">
                        <span>Time: {formatTime(result.time_taken_seconds || 0)}</span>
                        <span className="flex gap-3">
                          <span className="text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {result.correct_count}</span>
                          <span className="text-red-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> {result.wrong_count}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-6 pt-0 mt-auto flex flex-col gap-3 relative z-10">
                  {status === 'completed' && (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Link href={`/student/exams/${exam.id}/questions`}>
                        <Button variant="outline" className="w-full h-11 rounded-xl bg-background/50 border-white/10 hover:bg-primary/10 hover:text-blue-300 text-white transition-colors">
                          <FileQuestion className="w-4 h-4 mr-2" /> Questions
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/take`}>
                        <Button variant="outline" className="w-full h-11 rounded-xl bg-background/50 border-white/10 hover:bg-primary/10 hover:text-blue-300 text-white transition-colors">
                          <Play className="w-4 h-4 mr-2" /> Retake
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/result`}>
                        <Button variant="outline" className="w-full h-11 rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-colors">
                          <Eye className="w-4 h-4 mr-2" /> Result
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/leaderboard`}>
                        <Button variant="outline" className="w-full h-11 rounded-xl bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:text-amber-200 transition-all font-semibold shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                          <Medal className="w-4 h-4 mr-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> Rank
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {status === 'active' && (
                    <>
                      <Link href={`/student/exams/${exam.id}/take`} className="w-full">
                        <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_auto] animate-gradient text-white hover:scale-[1.02] transition-all font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] text-lg border-0 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                          {isAttempted ? "Take Exam Again" : "Start Exam"} 
                          <Play className="w-5 h-5 ml-2 fill-current" />
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/leaderboard`} className="w-full">
                        <Button variant="outline" className="w-full h-12 rounded-2xl bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:text-amber-200 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold">
                          <Medal className="w-4 h-4 mr-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> View Leaderboard
                        </Button>
                      </Link>
                    </>
                  )}

                  {status === 'missed' && (
                    <Button variant="secondary" className="w-full h-12 rounded-xl bg-destructive/10 text-red-300 hover:bg-destructive/10 cursor-not-allowed border border-destructive/20" disabled>
                      Missed Time Limit
                    </Button>
                  )}
                  {status === 'upcoming' && (
                    <Button variant="secondary" className="w-full h-12 rounded-xl bg-background/50 text-muted-foreground border border-white/5 cursor-not-allowed" disabled>
                      Starts {exam.start_time ? format(new Date(exam.start_time), "MMM d, h:mm a") : 'Soon'}
                    </Button>
                  )}
                </CardFooter>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
