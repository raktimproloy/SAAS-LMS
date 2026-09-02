"use client";

import { useEffect, useState } from "react";
import { ExamInterface } from "@/components/student/exam-interface";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, AlertCircle, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicTakeExamPage() {
  const params = useParams();
  const examId = params.id as string;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exam, setExam] = useState<{
    id: number;
    title: string;
    duration_minutes: number;
    questions: any[];
    course?: { title: string };
    batch?: { course?: { title: string } };
    start_time?: string;
    end_time?: string;
    collect_lead?: boolean;
    lead_mandatory?: boolean;
    lead_form_message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/exams/${examId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setExam(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
      
    // Prevent accidental reload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // Prevent back navigation
    const handlePopState = (e: PopStateEvent) => {
      const confirmLeave = window.confirm("You have an ongoing exam. Are you sure you want to leave?");
      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.href);
      } else {
        window.history.back();
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28 pt-20">
        {/* Questions Feed Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="space-y-4 text-center">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
              <div className="p-5 flex gap-4 bg-muted/30">
                <Skeleton className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-20 bg-muted/50 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-3/4 bg-muted rounded-md" />
                </div>
              </div>
              <div className="p-5 border-t border-border bg-card/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((opt) => (
                    <div key={opt} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                      <Skeleton className="w-6 h-6 rounded-md bg-muted shrink-0" />
                      <Skeleton className="h-4 w-32 bg-muted/50 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Cannot Start Exam</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
          <Link href="/">
            <Button size="lg" className="rounded-xl w-full sm:w-auto px-8 font-bold">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="pt-16">
      <div className="bg-primary/5 py-4 border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider">ফ্রি মক টেস্ট</h3>
              <p className="text-xs text-muted-foreground">{exam.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {(exam.course || exam.batch?.course) && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                কোর্স: {exam.course?.title || exam.batch?.course?.title}
              </span>
            )}
            
            {(exam.start_time || exam.end_time) && (
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                {exam.start_time && (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-primary/70" />
                    <span><span className="font-semibold text-slate-700 dark:text-slate-300">শুরু:</span> {new Date(exam.start_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                )}
                {exam.start_time && exam.end_time && (
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                )}
                {exam.end_time && (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-rose-500/70" />
                    <span><span className="font-semibold text-slate-700 dark:text-slate-300">শেষ:</span> {new Date(exam.end_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ExamInterface 
        examId={exam.id}
        title={exam.title}
        durationMinutes={exam.duration_minutes}
        questions={exam.questions}
        isPublic={true}
        collectLead={exam.collect_lead}
        leadMandatory={exam.lead_mandatory}
        leadFormMessage={exam.lead_form_message}
      />
    </div>
  );
}
