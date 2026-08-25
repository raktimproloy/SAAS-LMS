/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentBottomNav } from "@/components/student/StudentBottomNav";

interface Question {
  id: number;
  question_text: string;
  options: any; // e.g. ["A option", "B option", "C option"] or [{id:"a", text:"..."}]
  marks: number;
  type?: string;
  parent_id?: number | null;
  image_url?: string | null;
  image_urls?: any;
  explanation?: string | null;
  correct_option?: string | null;
}

interface ExamInterfaceProps {
  examId: number;
  title: string;
  durationMinutes: number;
  questions: Question[];
  isPublic?: boolean;
}

export function ExamInterface({ examId, title, durationMinutes, questions, isPublic }: ExamInterfaceProps) {
  const router = useRouter();
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [practiceResultData, setPracticeResultData] = useState<any>(null);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

  // Lead capture states for public exams
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadLocation, setLeadLocation] = useState("");

  const autoSubmitTriggered = useRef(false);

  // Initialize and persist state
  useEffect(() => {
    const storageKeyAnswers = `lms_exam_${examId}_answers`;
    const storageKeyStart = `lms_exam_${examId}_start`;

    // Load saved answers
    const savedAnswers = localStorage.getItem(storageKeyAnswers);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch {}
    }

    // Load or set start time
    let startTime = localStorage.getItem(storageKeyStart);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(storageKeyStart, startTime);
    }

    const elapsedSeconds = Math.floor((Date.now() - parseInt(startTime)) / 1000);
    const totalDurationSeconds = durationMinutes * 60;
    const remaining = totalDurationSeconds - elapsedSeconds;

    if (remaining <= 0) {
      setTimeLeft(0);
    } else {
      setTimeLeft(remaining);
    }
    
    setIsReady(true);
    
  }, [examId, durationMinutes]);

  // Save answers whenever they change (Auto-save)
  useEffect(() => {
    if (isReady) {
      localStorage.setItem(`lms_exam_${examId}_answers`, JSON.stringify(answers));
    }
  }, [answers, examId, isReady]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || !isReady || isSubmitting) return;

    if (timeLeft <= 0) {
      if (!autoSubmitTriggered.current) {
        autoSubmitTriggered.current = true;
        handleSubmit(); // auto-submit
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timerId);
          if (!autoSubmitTriggered.current) {
            autoSubmitTriggered.current = true;
            handleSubmit();
          }
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isReady, isSubmitting]);

  const handleSubmit = async (skipLeadForm: boolean = false) => {
    if (isSubmitting) return;
    
    // For public exams, intercept submission to show lead form
    if (isPublic && skipLeadForm !== true) {
      setTimeout(() => setShowLeadForm(true), 150);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate real time taken based on start time
      const startTimeStr = localStorage.getItem(`lms_exam_${examId}_start`);
      const startTime = startTimeStr ? parseInt(startTimeStr) : Date.now();
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const timeTaken = Math.min(elapsedSeconds, durationMinutes * 60);

      const endpoint = isPublic ? `/api/public/exams/${examId}/submit` : `/api/student/exams/${examId}`;
      const payload: any = {
        answers,
        time_taken_seconds: timeTaken
      };
      
      if (isPublic) {
        payload.name = leadName;
        payload.phone = leadPhone;
        payload.location = leadLocation;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Cleanup local storage
        localStorage.removeItem(`lms_exam_${examId}_answers`);
        localStorage.removeItem(`lms_exam_${examId}_start`);

        if (data.is_practice && data.practice_result) {
          if (isPublic) setShowLeadForm(false);
          setPracticeResultData(data.practice_result);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        } else {
          router.push(`/student/exams/${examId}/result`);
        }
      } else {
        alert(data.error || "Failed to submit exam");
        setIsSubmitting(false);
        if (isPublic && data.error?.includes("already attempted")) {
          setShowLeadForm(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  const toggleExplanation = (qId: number) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleOptionSelect = (qId: number, optionValue: string) => {
    if (answers[qId]) return; // LOCKING: Cannot change once answered
    setAnswers(prev => ({ ...prev, [qId]: optionValue }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isReady || timeLeft === null) return null;

  if (practiceResultData) {
    const result = practiceResultData;
    return (
      <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          
          <div className="bg-card/80 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Practice Result: {title}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time Taken: {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
              </p>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Score</div>
                <div className="text-4xl font-bold text-primary">{result.obtained_marks} <span className="text-lg text-muted-foreground/70">/ {result.total_marks}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 shadow-sm rounded-xl p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">{result.correct_count}</div>
              <div className="text-sm text-green-600 dark:text-green-500 font-medium">Correct</div>
            </div>
            <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 shadow-sm rounded-xl p-6 text-center">
              <XCircle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">{result.wrong_count}</div>
              <div className="text-sm text-red-600 dark:text-red-500 font-medium">Wrong</div>
            </div>
            <div className="bg-muted/50 border border-border shadow-sm rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-foreground">{result.skipped_count}</div>
              <div className="text-sm text-muted-foreground font-medium">Skipped</div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-bold text-foreground px-1">Review Answers</h2>
            <div className="space-y-6">
              {(() => {
                let globalQuestionCounter = 1;
                const practiceQs = result.questions || [];
                const rootQuestions = practiceQs.filter((q: any) => !q.parent_id);
                const childrenMap: Record<number, any[]> = {};
                practiceQs.forEach((q: any) => {
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
                      <div className={`p-5 flex gap-4 ${
                        isCorrect ? 'bg-green-50/30 dark:bg-green-900/10' : isSkipped ? 'bg-amber-50/30 dark:bg-amber-900/10' : 'bg-red-50/30 dark:bg-red-900/10'
                      }`}>
                        <div className="flex-none pt-1">
                          {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : isSkipped ? <AlertCircle className="w-6 h-6 text-amber-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-muted-foreground">Question {qNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : isSkipped ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {isCorrect ? `+${q.marks}` : isSkipped ? '0' : `Wrong`} Marks
                            </span>
                          </div>
                          <p className="text-lg font-medium text-foreground leading-snug">{q.question_text}</p>
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

                      <div className="p-5 border-t border-border bg-card/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          {optionsList.map((opt: any, optIdx: number) => {
                            const optId = typeof opt === 'string' ? opt : opt.id || String(optIdx);
                            const optText = typeof opt === 'string' ? opt : opt.text || opt.value || String(opt);
                            const letter = String.fromCharCode(65 + optIdx);
                            
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
                        
                        {!isExplanationExpanded ? (
                          <button onClick={() => toggleExplanation(q.id)} className="w-full bg-muted/50 hover:bg-muted rounded-xl p-4 border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground font-medium transition-colors cursor-pointer">
                            <ChevronDown className="w-4 h-4" /> View Solution Explanation
                          </button>
                        ) : (
                          <div className="bg-muted/50 rounded-xl p-4 border border-border relative">
                            <button onClick={() => toggleExplanation(q.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">Solution Explanation</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed pr-6">{q.explanation || "No explanation provided for this question."}</p>
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
                            <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 text-xs font-bold rounded-full uppercase tracking-wider">Read The Passage</span>
                          </div>
                          <div className="text-lg text-foreground leading-relaxed font-medium">{q.question_text}</div>
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
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Questions in this passage</h4>
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
          
          <div className="pt-8 flex justify-center">
            {isPublic ? (
              <Button size="lg" onClick={() => router.push('/')}>
                হোমপেজে ফিরে যান
              </Button>
            ) : (
              <Button size="lg" onClick={() => router.push('/student/exams')}>
                Back to My Exams
              </Button>
            )}
          </div>
        </div>
        {!isPublic && <StudentBottomNav />}
      </div>
    );
  }

  const attemptedCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border shadow-sm dark:shadow-none">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Select an option to lock your answer. You cannot change it later.</p>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {(() => {
          let globalQuestionCounter = 1;
          const rootQuestions = questions.filter(q => !q.parent_id);
          const childrenMap: Record<number, Question[]> = {};
          
          questions.forEach(q => {
            if (q.parent_id) {
              if (!childrenMap[q.parent_id]) childrenMap[q.parent_id] = [];
              childrenMap[q.parent_id].push(q);
            }
          });

          // Helper to render a single MCQ
          const renderMCQ = (q: Question, qNumber: number, isChild: boolean = false) => {
            const isAnswered = !!answers[q.id];
            const selectedValue = answers[q.id];
            let optionsList: any[] = [];
            
            if (Array.isArray(q.options)) {
              optionsList = q.options;
            } else if (typeof q.options === 'object' && q.options !== null) {
              optionsList = Object.values(q.options);
            }

            return (
              <div key={q.id} data-aos="fade-up" className={`rounded-xl border border-border shadow-sm transition-all overflow-hidden bg-card ${isChild ? 'mb-4' : ''}`}>
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

                <div className="p-5 border-t border-border bg-card/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {optionsList.map((opt: any, optIdx: number) => {
                      const optId = typeof opt === 'string' ? opt : opt.id || String(optIdx);
                      const optText = typeof opt === 'string' ? opt : opt.text || opt.value || String(opt);
                      const isThisSelected = String(selectedValue) === String(optId);
                      const letter = String.fromCharCode(65 + optIdx);
                      
                      let bgColor = "bg-muted/50 border-border hover:border-primary/30 hover:bg-muted cursor-pointer";
                      let letterBgColor = "bg-muted-foreground/20 text-muted-foreground";
                      let textStyle = "text-foreground";

                      if (isThisSelected) {
                        bgColor = "bg-primary/5 border-primary text-primary dark:bg-primary/10 dark:border-primary shadow-sm ring-1 ring-primary/20";
                        letterBgColor = "bg-primary text-primary-foreground";
                        textStyle = "text-primary dark:text-primary";
                      } else if (isAnswered) {
                        bgColor = "bg-muted/30 border-border/50 opacity-60 cursor-not-allowed";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(q.id, optId)}
                          disabled={isAnswered}
                          className={`p-4 rounded-xl border flex items-center text-left gap-3 transition-all ${bgColor}`}
                        >
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${letterBgColor}`}>
                            {letter}
                          </div>
                          <div className={`flex flex-col flex-1 gap-2 text-left py-1`}>
                            <span className={`font-medium text-sm ${textStyle}`}>{optText}</span>
                            {opt.image_url && (
                              <img src={opt.image_url} alt="Option image" className="max-h-32 object-contain rounded border bg-muted/20 self-start" />
                            )}
                          </div>
                          {isThisSelected && <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          };

          return rootQuestions.map((q) => {
            if (q.type === 'passage') {
              const childQuestions = childrenMap[q.id] || [];
              return (
                <div key={q.id} data-aos="fade-up" className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
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
                      return renderMCQ(cq, qNum, true);
                    })}
                  </div>
                </div>
              );
            } else {
              const qNum = globalQuestionCounter++;
              return renderMCQ(q, qNum, false);
            }
          });
        })()}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border shadow-sm p-3 sm:p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 sm:gap-6">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono font-bold text-base sm:text-xl border shadow-sm ${
              timeLeft <= 60 ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' : 'bg-muted text-foreground border-border'
            }`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              {formatTime(timeLeft)}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-foreground">
                Attempted: {attemptedCount} / {questions.filter(q => q.type !== 'passage').length}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {questions.filter(q => q.type !== 'passage').length - attemptedCount} remaining
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="sm:hidden flex items-center justify-center font-bold text-sm bg-primary/10 text-primary border border-primary/20 px-2 py-1.5 rounded-lg shadow-sm whitespace-nowrap">
              {attemptedCount}/{questions.filter(q => q.type !== 'passage').length}
            </div>

            <Button 
              size="lg"
              className="px-4 sm:px-8 font-bold text-sm sm:text-base shadow-md group h-10 sm:h-11"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"/> Submit</span>
              ) : (
                <span className="flex items-center gap-1.5 sm:gap-2">Submit <span className="hidden sm:inline">Exam</span> <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" /></span>
              )}
            </Button>
          </div>

        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8 relative">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20 relative z-10">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            
            <DialogHeader className="text-center sm:text-center space-y-2 relative z-10">
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">Submit Exam?</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground/90">
                You have attempted <strong className="text-foreground">{attemptedCount}</strong> out of <strong className="text-foreground">{questions.filter(q => q.type !== 'passage').length}</strong> questions.
                Are you sure you want to submit? You cannot change your answers after submission.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="mt-8 flex-col sm:flex-row gap-3 sm:gap-4 relative z-10">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-1/2 rounded-xl h-12 font-semibold border-border hover:bg-muted"
                onClick={() => setShowConfirmDialog(false)}
              >
                Go Back
              </Button>
              <Button 
                size="lg"
                className="w-full sm:w-1/2 rounded-xl h-12 font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_auto] animate-gradient text-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] border-0"
                onClick={() => {
                  setShowConfirmDialog(false);
                  handleSubmit();
                }}
              >
                Confirm Submit
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Public Exam Lead Capture Form */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
          <div className="bg-background p-6 sm:p-8 relative">
            <DialogHeader className="space-y-2 relative z-10 mb-6">
              <DialogTitle className="text-2xl font-bold text-foreground">পরীক্ষা জমা দিন</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground/90">
                ফলাফল দেখতে আপনার তথ্য প্রদান করুন।
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">আপনার নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={leadName} 
                  onChange={(e) => setLeadName(e.target.value)} 
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1" 
                  placeholder="উদাঃ রাকিব হাসান"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={leadPhone} 
                  onChange={(e) => setLeadPhone(e.target.value.replace(/[^0-9+]/g, ''))} 
                  className={`flex h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    leadPhone && !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(leadPhone) 
                    ? "border-red-500 focus-visible:ring-red-500" 
                    : "border-input focus-visible:ring-primary"
                  }`}
                  placeholder="উদাঃ 01700000000"
                  required
                />
                {leadPhone && !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(leadPhone) ? (
                  <p className="text-xs text-red-500 mt-1">সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">একটি মোবাইল নম্বর দিয়ে একবারই পরীক্ষা দেওয়া যাবে।</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ঠিকানা (ঐচ্ছিক)</label>
                <input 
                  type="text" 
                  value={leadLocation} 
                  onChange={(e) => setLeadLocation(e.target.value)} 
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1" 
                  placeholder="উদাঃ ঢাকা"
                />
              </div>
            </div>

            <DialogFooter className="mt-8 flex-col sm:flex-col sm:space-x-0 gap-3 relative z-10">
              <Button 
                size="lg"
                className="w-full rounded-xl h-12 font-bold shadow-md bg-primary hover:bg-primary/90"
                disabled={isSubmitting || !leadName || !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(leadPhone)}
                onClick={() => {
                  handleSubmit(true);
                }}
              >
                {isSubmitting ? "জমা হচ্ছে..." : "ফলাফল দেখুন"}
              </Button>
              <Button 
                variant="ghost"
                size="lg"
                className="w-full rounded-xl text-muted-foreground"
                onClick={() => setShowLeadForm(false)}
                disabled={isSubmitting}
              >
                ফিরে যান
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
