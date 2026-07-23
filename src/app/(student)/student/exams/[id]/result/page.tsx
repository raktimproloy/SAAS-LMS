/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaderboard } from "@/components/student/leaderboard";
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";

export default function StudentExamResultPage() {
  const params = useParams();
  const examId = params.id as string;
  
  const [data, setData] = useState<{ result: any; leaderboard: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/student/exams/${examId}/result`)
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
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-red-50 border rounded-xl max-w-2xl mx-auto">{error}</div>;
  }

  if (!data) return null;

  const { result, leaderboard } = data;
  const exam = result.exam;

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Summary */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{exam.title}</h1>
          <p className="text-slate-500 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Time Taken: {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
          </p>
        </div>
        
        <div className="flex gap-8 text-center">
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Score</div>
            <div className="text-4xl font-bold text-primary">{result.obtained_marks} <span className="text-lg text-slate-400">/ {exam.total_marks}</span></div>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Rank</div>
            <div className="text-4xl font-bold text-amber-500">#{result.rank || '-'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Breakdown & Answers */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{result.correct_count}</div>
                <div className="text-sm text-green-600 font-medium">Correct</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{result.wrong_count}</div>
                <div className="text-sm text-red-600 font-medium">Wrong</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{result.skipped_count}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Skipped</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Answer Sheet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {exam.questions.map((q: { id: number; question_text: string; [key: string]: any }, idx: number) => {
                const studentAns = result.answers[q.id];
                const correctAns = q.correct_option;
                const isCorrect = studentAns === correctAns;

                return (
                  <div key={q.id} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex gap-3">
                      <div className="font-bold text-slate-500 mt-1">{idx + 1}.</div>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-slate-900 dark:text-white mb-4">{q.question_text}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {["a", "b", "c", "d"].map(opt => {
                            const optText = q[`option_${opt}`];
                            let bgColor = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                            let icon = null;

                            if (opt === correctAns) {
                              bgColor = "bg-green-100 border-green-300 text-green-900 dark:text-green-100 font-semibold";
                              icon = <CheckCircle2 className="w-4 h-4 text-green-600 inline ml-2" />;
                            } else if (opt === studentAns && !isCorrect) {
                              bgColor = "bg-red-100 border-red-300 text-red-900 font-semibold";
                              icon = <XCircle className="w-4 h-4 text-red-600 inline ml-2" />;
                            }

                            return (
                              <div key={opt} className={`p-3 rounded-lg border ${bgColor} flex justify-between items-center`}>
                                <span><span className="uppercase font-bold mr-2">{opt}.</span> {optText}</span>
                                {icon}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Leaderboard */}
        <div className="lg:col-span-1">
          <Leaderboard entries={leaderboard} currentStudentId={result.student_id} />
        </div>
      </div>
    </div>
  );
}
