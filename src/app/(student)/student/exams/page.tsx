/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Play, FileQuestion, Target, Trophy, Eye } from "lucide-react";
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
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Exams</h1>
        <p className="text-muted-foreground">View and take your assigned exams below.</p>
      </div>

      {exams.length === 0 ? (
        <Card className="p-16 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 border-dashed shadow-none">
          <FileQuestion className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No Exams Available</p>
          <p className="text-sm mt-1">There are currently no exams assigned to your batch.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const status = getStatus(exam);
            const isAttempted = exam.results && exam.results.length > 0;
            const result = isAttempted ? exam.results[0] : null;

            return (
              <Card key={exam.id} className={`flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                status === 'active' ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'border-slate-200 dark:border-slate-800'
              }`}>
                <CardHeader className={`p-5 pb-4 border-b ${
                  status === 'active' ? 'bg-primary/5' : 'bg-slate-50/50 dark:bg-slate-900/50'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={`capitalize px-2.5 py-0.5 text-xs font-semibold
                      ${status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                      ${status === 'active' ? 'bg-primary text-white border-primary animate-pulse' : ''}
                      ${status === 'missed' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                      ${status === 'upcoming' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                    `}>
                      {status}
                    </Badge>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300">
                      {exam.total_marks} Marks
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 leading-snug">{exam.title}</CardTitle>
                </CardHeader>

                <CardContent className="p-5 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="truncate">{exam.start_time ? format(new Date(exam.start_time), "MMM d, h:mm a") : 'No Start Time'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                      <span>{exam.duration_minutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileQuestion className="w-4 h-4 shrink-0 text-slate-400" />
                      <span>{exam._count?.questions || 0} Questions</span>
                    </div>
                    {exam.negative_marking > 0 && (
                      <div className="flex items-center gap-2 text-red-500">
                        <Target className="w-4 h-4 shrink-0" />
                        <span>-{exam.negative_marking} / wrong</span>
                      </div>
                    )}
                  </div>

                  {isAttempted && result && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Score</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                            {result.obtained_marks} <span className="text-sm font-medium text-slate-500">/ {result.total_marks}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Accuracy</p>
                          <p className="text-lg font-bold text-green-600 leading-none">
                            {result.correct_count + result.wrong_count > 0 
                              ? Math.round((result.correct_count / (result.correct_count + result.wrong_count)) * 100) 
                              : 0}%
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-200 dark:border-slate-700 text-slate-500">
                        <span>Time Taken: {formatTime(result.time_taken_seconds || 0)}</span>
                        <span className="flex gap-2">
                          <span className="text-green-600">{result.correct_count} ✓</span>
                          <span className="text-red-500">{result.wrong_count} ✗</span>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto flex gap-3">
                  {status === 'completed' && (
                    <>
                      <Link href={`/student/exams/${exam.id}/result`} className="flex-1">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-md">
                          <Eye className="w-4 h-4 mr-2" /> View Questions
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/leaderboard`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Trophy className="w-4 h-4 mr-2 text-amber-500" /> Rank
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {status === 'active' && (
                    <>
                      <Link href={`/student/exams/${exam.id}/take`} className="flex-1">
                        <Button className="w-full group bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                          Start Exam 
                          <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/leaderboard`} className="flex-none">
                        <Button variant="outline" size="icon" title="Leaderboard">
                          <Trophy className="w-4 h-4 text-amber-500" />
                        </Button>
                      </Link>
                    </>
                  )}

                  {status === 'missed' && (
                    <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed" disabled>
                      Missed Time Limit
                    </Button>
                  )}
                  {status === 'upcoming' && (
                    <Button variant="secondary" className="w-full cursor-not-allowed" disabled>
                      Starts {exam.start_time ? format(new Date(exam.start_time), "MMM d, h:mm a") : 'Soon'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
