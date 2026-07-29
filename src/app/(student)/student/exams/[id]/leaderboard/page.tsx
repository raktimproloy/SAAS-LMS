/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Leaderboard } from "@/components/student/leaderboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function StudentExamLeaderboardPage() {
  const params = useParams();
  const examId = params.id as string;
  
  const [data, setData] = useState<{ exam: { title: string }, leaderboard: any[], currentStudentId: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/student/exams/${examId}/leaderboard`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  }, [examId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-red-50 border rounded-xl max-w-2xl mx-auto">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-4">
        <Link href="/student/exams">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Leaderboard</h1>
          <p className="text-slate-500">{data.exam.title}</p>
        </div>
      </div>

      <Leaderboard entries={data.leaderboard} currentStudentId={data.currentStudentId} />
    </div>
  );
}
