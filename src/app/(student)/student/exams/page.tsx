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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Exams</h1>
        <p className="text-muted-foreground">View and take your assigned exams below.</p>
      </div>

      {exams.length === 0 ? (
        <Card className="p-16 text-center text-muted-foreground bg-muted/50 border-dashed shadow-none">
          <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No Exams Available</p>
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
                status === 'active' ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'border-border'
              }`}>
                <CardHeader className={`p-5 pb-4 border-b border-border ${
                  status === 'active' ? 'bg-primary/5' : 'bg-muted/30'
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
                    <span className="text-xs font-bold px-2 py-1 bg-muted rounded-md text-muted-foreground">
                      {exam.total_marks} Marks
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 leading-snug">{exam.title}</CardTitle>
                </CardHeader>

                <CardContent className="p-5 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{exam.start_time ? format(new Date(exam.start_time), "MMM d, h:mm a") : 'No Start Time'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 text-muted-foreground/70" />
                      <span>{exam.duration_minutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileQuestion className="w-4 h-4 shrink-0 text-muted-foreground/70" />
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
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Score</p>
                          <p className="text-2xl font-bold text-foreground leading-none">
                            {result.obtained_marks} <span className="text-sm font-medium text-muted-foreground">/ {result.total_marks}</span>
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
                      <div className="flex justify-between items-center text-xs pt-3 border-t border-border text-muted-foreground">
                        <span>Time Taken: {formatTime(result.time_taken_seconds || 0)}</span>
                        <span className="flex gap-2">
                          <span className="text-green-600">{result.correct_count} ✓</span>
                          <span className="text-red-500">{result.wrong_count} ✗</span>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto flex flex-col gap-3">
                  {status === 'completed' && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Link href={`/student/exams/${exam.id}/questions`}>
                        <Button variant="outline" className="w-full h-full text-xs py-2 px-1 shadow-sm border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-900 dark:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/40">
                          <FileQuestion className="w-3.5 h-3.5 mr-1.5 shrink-0" /> View Question
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/take`}>
                        <Button variant="outline" className="w-full h-full text-xs py-2 px-1 shadow-sm border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-900 dark:text-indigo-300 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40">
                          <Play className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Give Exam Again
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/result`}>
                        <Button variant="outline" className="w-full h-full text-xs py-2 px-1 shadow-sm border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900 dark:text-emerald-300 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40">
                          <Eye className="w-3.5 h-3.5 mr-1.5 shrink-0" /> See Result
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/leaderboard`}>
                        <Button variant="outline" className="w-full h-full text-xs py-2 px-1 shadow-sm border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-900 dark:text-amber-300 dark:bg-amber-900/20 dark:hover:bg-amber-900/40">
                          <Trophy className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Rank
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {status === 'active' && (
                    <>
                      <Link href={`/student/exams/${exam.id}/take`} className="w-full">
                        <Button className="w-full group bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                          {isAttempted ? "Take Exam Again (Practice)" : "Start Exam"} 
                          <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href={`/student/exams/${exam.id}/leaderboard`} className="w-full">
                        <Button variant="outline" className="w-full">
                          <Trophy className="w-4 h-4 mr-2 text-amber-500" /> Leaderboard
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
