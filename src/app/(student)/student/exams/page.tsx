/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, CheckCircle, Play } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function StudentExamsPage() {
  const [exams, setExams] = useState<{
    id: number;
    title: string;
    start_time: string | Date;
    end_time: string | Date;
    duration_minutes: number;
    total_marks: number;
    results?: any[];
  }[]>([]);
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
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  const getStatus = (exam: {
    id: number;
    title: string;
    start_time: string | Date;
    end_time: string | Date;
    duration_minutes: number;
    total_marks: number;
    results?: any[];
  }) => {
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    if (exam.results && exam.results.length > 0) return "completed";
    if (now < startTime) return "upcoming";
    if (now > endTime) return "missed";
    return "active";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Exams</h1>
      </div>

      {exams.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 border-dashed">
          <p>No exams assigned to your batch yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const status = getStatus(exam);
            return (
              <Card key={exam.id} className={`overflow-hidden transition-all hover:shadow-md ${
                status === 'active' ? 'border-primary ring-1 ring-primary/20' : ''
              }`}>
                <CardHeader className={`${
                  status === 'active' ? 'bg-primary/5' : 'bg-slate-50 dark:bg-slate-950'
                } border-b p-5`}>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`capitalize
                      ${status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                      ${status === 'active' ? 'bg-primary text-white border-primary animate-pulse' : ''}
                      ${status === 'missed' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                      ${status === 'upcoming' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                    `}>
                      {status}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-500">{exam.total_marks} Marks</span>
                  </div>
                  <CardTitle className="line-clamp-2 leading-snug">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{format(new Date(exam.start_time), "MMM d, yyyy • h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{exam.duration_minutes} Minutes</span>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  {status === 'completed' && (
                    <Link href={`/student/exams/${exam.id}/result`} className="w-full">
                      <Button variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50">
                        <CheckCircle className="w-4 h-4 mr-2" /> View Result
                      </Button>
                    </Link>
                  )}
                  {status === 'active' && (
                    <Link href={`/student/exams/${exam.id}/take`} className="w-full">
                      <Button className="w-full group">
                        Start Exam 
                        <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  )}
                  {status === 'missed' && (
                    <Button variant="secondary" className="w-full opacity-50 cursor-not-allowed" disabled>
                      Missed
                    </Button>
                  )}
                  {status === 'upcoming' && (
                    <Button variant="secondary" className="w-full cursor-not-allowed" disabled>
                      Not Started Yet
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
