/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ExamInterface } from "@/components/student/exam-interface";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function StudentTakeExamPage() {
  const params = useParams();
  const examId = params.id as string;
  
  const [exam, setExam] = useState<{
    id: number;
    title: string;
    duration_minutes: number;
    questions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/student/exams/${examId}`)
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
        window.history.back(); // Proceed with going back
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
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Exam Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 text-red-700 rounded-xl max-w-2xl mx-auto mt-12 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Cannot Start Exam</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <ExamInterface 
      examId={exam.id}
      title={exam.title}
      durationMinutes={exam.duration_minutes}
      questions={exam.questions}
    />
  );
}
