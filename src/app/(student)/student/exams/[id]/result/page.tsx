/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Medal } from "lucide-react";

export default function StudentExamResultPage() {
  const params = useParams();
  const examId = params.id as string;
  
  const [data, setData] = useState<{ result: any; leaderboard: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Track expanded state for explanations
  // Track expanded state for explanations
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch(`/api/student/exams/${examId}/result`)
      .then(res => res.json())
      .then(resData => {
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
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

  const { result } = data;
  const exam = result.exam;

  const toggleExplanation = (qId: number) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* Header Summary */}
      <div className="bg-card/80 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{exam.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" /> Time Taken: {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
          </p>
        </div>
        
        <div className="flex gap-8 text-center items-center">
          <Link href={`/student/exams/${examId}/leaderboard`}>
            <Button variant="outline" className="h-12 rounded-2xl bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 text-amber-500 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold px-6">
              <Medal className="w-4 h-4 mr-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> View Leaderboard
            </Button>
          </Link>
          <div className="w-px h-12 bg-border"></div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Score</div>
            <div className="text-4xl font-bold text-primary">{result.obtained_marks} <span className="text-lg text-muted-foreground/70">/ {result.total_marks}</span></div>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rank</div>
            <div className="text-4xl font-bold text-amber-500">#{result.rank || '-'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Full Width: Breakdown & Answers */}
        <div className="space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50 shadow-sm">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">{result.correct_count}</div>
                <div className="text-sm text-green-600 dark:text-green-500 font-medium">Correct</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 shadow-sm">
              <CardContent className="p-6 text-center">
                <XCircle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-700 dark:text-red-400">{result.wrong_count}</div>
                <div className="text-sm text-red-600 dark:text-red-500 font-medium">Wrong</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50 border-border shadow-sm">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-foreground">{result.skipped_count}</div>
                <div className="text-sm text-muted-foreground font-medium">Skipped</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground px-1">Review Answers</h2>
            
            <div className="space-y-6">
              {(() => {
                let globalQuestionCounter = 1;
                const rootQuestions = exam.questions.filter((q: any) => !q.parent_id);
                const childrenMap: Record<number, any[]> = {};
                
                exam.questions.forEach((q: any) => {
                  if (q.parent_id) {
                    if (!childrenMap[q.parent_id]) childrenMap[q.parent_id] = [];
                    childrenMap[q.parent_id].push(q);
                  }
                });

                const renderResultMCQ = (q: any, qNumber: number, isChild: boolean = false) => {
                  const studentAns = result.answers[q.id];
                  const correctAns = q.correct_option;
                  const isCorrect = studentAns === correctAns;
                  const isSkipped = !studentAns;
                  
                  const isExplanationExpanded = !!expandedExplanations[q.id];

                  let optionsList: any[] = [];
                  if (Array.isArray(q.options)) {
                    optionsList = q.options;
                  } else if (typeof q.options === 'object' && q.options !== null) {
                    optionsList = Object.values(q.options);
                  }

                  return (
                    <div key={q.id} className={`rounded-xl border shadow-sm transition-all overflow-hidden bg-card ${
                      isCorrect ? 'border-green-200 dark:border-green-900/50' : isSkipped ? 'border-amber-200 dark:border-amber-900/50' : 'border-red-200 dark:border-red-900/50'
                    } ${isChild ? 'mb-4' : ''}`}>
                      {/* Question Header */}
                      <div 
                        className={`p-5 flex gap-4 ${
                          isCorrect ? 'bg-green-50/30 dark:bg-green-900/10' : isSkipped ? 'bg-amber-50/30 dark:bg-amber-900/10' : 'bg-red-50/30 dark:bg-red-900/10'
                        }`}
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
                            <span className="text-sm font-bold text-muted-foreground">Question {qNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : isSkipped ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {isCorrect ? `+${q.marks}` : isSkipped ? '0' : `-${exam.negative_marking}`} Marks
                            </span>
                          </div>
                          <p className="text-lg font-medium text-foreground leading-snug">
                            {q.question_text}
                          </p>
                          {q.image_url && (!q.image_urls || q.image_urls.length === 0) && (
                            <img src={q.image_url} alt="Question image" className="mt-4 max-h-64 rounded-md object-contain border bg-muted/20" />
                          )}
                          {q.image_urls && q.image_urls.length > 0 && (
                            <div className="flex flex-col gap-4 mt-4">
                              {q.image_urls.map((url: string, imgIdx: number) => (
                                <img key={imgIdx} src={url} alt={`Question image ${imgIdx + 1}`} className="max-h-64 rounded-md object-contain border bg-muted/20 self-start" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Options & Solution Area */}
                      <div className="p-5 border-t border-border bg-card/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          {optionsList.map((opt: any, optIdx: number) => {
                            const optId = typeof opt === 'string' ? opt : opt.id || String(optIdx);
                            const optText = typeof opt === 'string' ? opt : opt.text || opt.value || String(opt);
                            const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                            
                            // Use optId to compare with correctAns since DB saves the ID, not the text
                            const isThisCorrect = String(optId) === String(correctAns);
                            const isThisStudentSelected = String(optId) === String(studentAns);

                              let bgColor = "bg-muted/50 border-border";
                              let icon = null;
                              let letterBgColor = "bg-muted-foreground/20 text-muted-foreground";

                              if (isSkipped && isThisCorrect) {
                                bgColor = "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-100 shadow-sm ring-1 ring-amber-300";
                                icon = <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 ml-auto" />;
                                letterBgColor = "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100";
                              } else if (!isSkipped && isThisCorrect) {
                                bgColor = "bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100 shadow-sm ring-1 ring-green-300";
                                icon = <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />;
                                letterBgColor = "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100";
                              } else if (isThisStudentSelected && !isThisCorrect) {
                                bgColor = "bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-100 shadow-sm";
                                icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 ml-auto" />;
                                letterBgColor = "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100";
                              }

                            return (
                              <div key={optIdx} className={`p-4 rounded-xl border flex items-center gap-3 ${bgColor}`}>
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${letterBgColor}`}>
                                  {letter}
                                </div>
                                <div className="flex flex-col flex-1 gap-2 py-1">
                                  <span className="font-medium text-sm">{optText}</span>
                                  {opt.image_url && (
                                    <img src={opt.image_url} alt="Option image" className="max-h-32 object-contain rounded border bg-muted/20 self-start" />
                                  )}
                                </div>
                                {icon}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Solution / Explanation Box */}
                          {!isExplanationExpanded ? (
                            <button 
                              onClick={() => toggleExplanation(q.id)}
                              className="w-full bg-green-50/50 hover:bg-green-100/50 dark:bg-green-900/10 dark:hover:bg-green-900/20 rounded-xl p-4 border border-dashed border-green-200 dark:border-green-900/30 flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium transition-colors cursor-pointer"
                            >
                              <ChevronDown className="w-4 h-4" /> View Solution Explanation
                            </button>
                          ) : (
                            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-900/50 relative">
                              <button 
                                onClick={() => toggleExplanation(q.id)}
                                className="absolute top-4 right-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <h4 className="font-bold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                                Solution Explanation
                              </h4>
                              <p className="text-green-900/80 dark:text-green-100/70 text-sm leading-relaxed pr-6">
                                {q.explanation || "No explanation provided for this question."}
                              </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                };

                return rootQuestions.map((q: any) => {
                  if (q.type === 'passage') {
                    const childQuestions = childrenMap[q.id] || [];
                    return (
                      <div key={q.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-8">
                        <div className="p-6 bg-muted/40 border-b border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 text-xs font-bold rounded-full uppercase tracking-wider">
                              Read The Passage
                            </span>
                          </div>
                          <div className="text-lg text-foreground leading-relaxed font-medium">
                            {q.question_text}
                          </div>
                          {q.image_url && (!q.image_urls || q.image_urls.length === 0) && (
                            <img src={q.image_url} alt="Passage image" className="mt-4 max-h-64 rounded-md object-contain border bg-muted/20" />
                          )}
                          {q.image_urls && q.image_urls.length > 0 && (
                            <div className="flex flex-col gap-4 mt-4">
                              {q.image_urls.map((url: string, imgIdx: number) => (
                                <img key={imgIdx} src={url} alt={`Passage image ${imgIdx + 1}`} className="max-h-64 rounded-md object-contain border bg-muted/20 self-start" />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-6 bg-background/50 space-y-6">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                            Questions in this passage
                          </h4>
                          {childQuestions.map(cq => {
                            const qNum = globalQuestionCounter++;
                            return renderResultMCQ(cq, qNum, true);
                          })}
                        </div>
                      </div>
                    );
                  } else {
                    const qNum = globalQuestionCounter++;
                    return renderResultMCQ(q, qNum, false);
                  }
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
