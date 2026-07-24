/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, ChevronUp, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentViewQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  
  const [data, setData] = useState<{ result: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

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

  const exam = data.result.exam;

  const toggleExplanation = (qId: number) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      
      <div className="bg-card/80 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{exam.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <FileQuestion className="w-4 h-4" /> Exam Questions & Solutions
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/student/exams')}>
          Back to My Exams
        </Button>
      </div>

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

          const renderQuestionMCQ = (q: any, qNumber: number, isChild: boolean = false) => {
            const correctAns = q.correct_option;
            const isExplanationExpanded = !!expandedExplanations[q.id];

            let optionsList: any[] = [];
            if (Array.isArray(q.options)) {
              optionsList = q.options;
            } else if (typeof q.options === 'object' && q.options !== null) {
              optionsList = Object.values(q.options);
            }

            return (
              <div key={q.id} className={`rounded-xl border border-border shadow-sm transition-all overflow-hidden bg-card ${isChild ? 'mb-4' : ''}`}>
                <div className="p-5 flex gap-4 bg-muted/30">
                  <div className="flex-none pt-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm shadow-inner">
                      {qNumber}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-muted-foreground">Question {qNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        {q.marks} Marks
                      </span>
                    </div>
                    <p className="text-lg font-medium text-foreground leading-snug">
                      {q.question_text}
                    </p>
                  </div>
                </div>

                <div className="p-5 border-t border-border bg-card/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {optionsList.map((opt: any, optIdx: number) => {
                      const optId = typeof opt === 'string' ? opt : opt.id || String(optIdx);
                      const optText = typeof opt === 'string' ? opt : opt.text || opt.value || String(opt);
                      const letter = String.fromCharCode(65 + optIdx);
                      
                      const isThisCorrect = String(optId) === String(correctAns);

                      let bgColor = "bg-muted/50 border-border";
                      let icon = null;
                      let letterBgColor = "bg-muted-foreground/20 text-muted-foreground";

                      if (isThisCorrect) {
                        bgColor = "bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100 shadow-sm ring-1 ring-green-300";
                        icon = <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />;
                        letterBgColor = "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100";
                      }

                      return (
                        <div key={optIdx} className={`p-4 rounded-xl border flex items-center gap-3 ${bgColor}`}>
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${letterBgColor}`}>
                            {letter}
                          </div>
                          <span className="font-medium text-sm">{optText}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!isExplanationExpanded ? (
                    <button 
                      onClick={() => toggleExplanation(q.id)}
                      className="w-full bg-muted/50 hover:bg-muted rounded-xl p-4 border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground font-medium transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" /> View Solution Explanation
                    </button>
                  ) : (
                    <div className="bg-muted/50 rounded-xl p-4 border border-border relative">
                      <button 
                        onClick={() => toggleExplanation(q.id)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                        Solution Explanation
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed pr-6">
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
                  </div>
                  <div className="p-6 bg-background/50 space-y-6">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                      Questions in this passage
                    </h4>
                    {childQuestions.map(cq => {
                      const qNum = globalQuestionCounter++;
                      return renderQuestionMCQ(cq, qNum, true);
                    })}
                  </div>
                </div>
              );
            } else {
              const qNum = globalQuestionCounter++;
              return renderQuestionMCQ(q, qNum, false);
            }
          });
        })()}
      </div>
    </div>
  );
}
