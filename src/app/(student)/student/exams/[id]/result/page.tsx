/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Leaderboard } from "@/components/student/leaderboard";
import { CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function StudentExamResultPage() {
  const params = useParams();
  const examId = params.id as string;
  
  const [data, setData] = useState<{ result: any; leaderboard: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Track expanded state for each question
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch(`/api/student/exams/${examId}/result`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
          
          // Auto-expand wrong and skipped questions
          const initialExpanded: Record<number, boolean> = {};
          if (resData.result && resData.result.exam && resData.result.exam.questions) {
            resData.result.exam.questions.forEach((q: any) => {
              const studentAns = resData.result.answers[q.id];
              const isCorrect = studentAns === q.correct_option;
              if (!isCorrect) {
                initialExpanded[q.id] = true;
              }
            });
          }
          setExpandedQuestions(initialExpanded);
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

  const { result, leaderboard } = data;
  const exam = result.exam;

  const toggleQuestion = (qId: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* Header Summary */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-8">
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
            <Card className="bg-green-50/50 border-green-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-700">{result.correct_count}</div>
                <div className="text-sm text-green-600 font-medium">Correct</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50/50 border-red-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-700">{result.wrong_count}</div>
                <div className="text-sm text-red-600 font-medium">Wrong</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">{result.skipped_count}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Skipped</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white px-1">Review Answers</h2>
            
            <div className="space-y-6">
              {exam.questions.map((q: any, idx: number) => {
                const studentAns = result.answers[q.id];
                const correctAns = q.correct_option;
                const isCorrect = studentAns === correctAns;
                const isSkipped = !studentAns;
                
                const isExpanded = !!expandedQuestions[q.id];

                let optionsList: any[] = [];
                if (Array.isArray(q.options)) {
                  optionsList = q.options;
                } else if (typeof q.options === 'object' && q.options !== null) {
                  optionsList = Object.values(q.options);
                }

                return (
                  <div key={q.id} className={`rounded-xl border shadow-sm transition-all overflow-hidden ${
                    isCorrect ? 'border-green-200' : isSkipped ? 'border-amber-200' : 'border-red-200'
                  }`}>
                    {/* Question Header - Clickable for expand/collapse */}
                    <div 
                      className={`p-5 cursor-pointer flex gap-4 ${
                        isCorrect ? 'bg-green-50/30' : isSkipped ? 'bg-amber-50/30' : 'bg-red-50/30'
                      }`}
                      onClick={() => toggleQuestion(q.id)}
                    >
                      <div className="flex-none pt-1">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : isSkipped ? (
                          <AlertCircle className="w-6 h-6 text-amber-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-slate-500">Question {idx + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isCorrect ? 'bg-green-100 text-green-700' : isSkipped ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isCorrect ? `+${q.marks}` : isSkipped ? '0' : `-${exam.negative_marking}`} Marks
                          </span>
                        </div>
                        <p className="text-lg font-medium text-slate-900 dark:text-white leading-snug">
                          {q.question_text}
                        </p>
                      </div>
                      
                      <div className="flex-none pt-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Expandable Options & Solution Area */}
                    {isExpanded && (
                      <div className="p-5 border-t bg-white dark:bg-slate-900">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          {optionsList.map((opt: any, optIdx: number) => {
                            const optValue = typeof opt === 'string' ? opt : opt.value || opt.text || String(opt);
                            const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                            
                            const isThisCorrect = optValue === correctAns;
                            const isThisStudentSelected = optValue === studentAns;

                            let bgColor = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800";
                            let icon = null;

                            if (isThisCorrect) {
                              bgColor = "bg-green-50 border-green-300 text-green-900 dark:text-green-100 shadow-sm ring-1 ring-green-300";
                              icon = <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />;
                            } else if (isThisStudentSelected && !isThisCorrect) {
                              bgColor = "bg-red-50 border-red-300 text-red-900 shadow-sm";
                              icon = <XCircle className="w-5 h-5 text-red-600 ml-auto" />;
                            }

                            return (
                              <div key={optIdx} className={`p-4 rounded-xl border flex items-center gap-3 ${bgColor}`}>
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isThisCorrect ? 'bg-green-200 text-green-800' : 
                                  (isThisStudentSelected ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600')
                                }`}>
                                  {letter}
                                </div>
                                <span className="font-medium text-sm">{optValue}</span>
                                {icon}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Solution / Explanation Box */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            Solution Explanation
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            {q.explanation || "No explanation provided for this question."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Leaderboard */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Leaderboard entries={leaderboard} currentStudentId={result.student_id} />
          </div>
        </div>
      </div>
    </div>
  );
}
