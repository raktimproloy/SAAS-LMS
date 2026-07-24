/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  question_text: string;
  options: any; // e.g. ["A option", "B option", "C option"] or [{id:"a", text:"..."}]
  marks: number;
}

interface ExamInterfaceProps {
  examId: number;
  title: string;
  durationMinutes: number;
  questions: Question[];
}

export function ExamInterface({ examId, title, durationMinutes, questions }: ExamInterfaceProps) {
  const router = useRouter();
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

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
        handleSubmit(true); // auto-submit
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timerId);
          if (!autoSubmitTriggered.current) {
            autoSubmitTriggered.current = true;
            handleSubmit(true);
          }
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isReady, isSubmitting]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    if (!isAutoSubmit && !confirm("Are you sure you want to submit the exam? You cannot change your answers after submission.")) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Calculate real time taken based on start time
      const startTimeStr = localStorage.getItem(`lms_exam_${examId}_start`);
      const startTime = startTimeStr ? parseInt(startTimeStr) : Date.now();
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const timeTaken = Math.min(elapsedSeconds, durationMinutes * 60);

      const res = await fetch(`/api/student/exams/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          time_taken_seconds: timeTaken
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Cleanup local storage
        localStorage.removeItem(`lms_exam_${examId}_answers`);
        localStorage.removeItem(`lms_exam_${examId}_start`);
        router.push(`/student/exams/${examId}/result`);
      } else {
        alert(data.error || "Failed to submit exam");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission.");
      setIsSubmitting(false);
    }
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

  const attemptedCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-28">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">Select an option to lock your answer. You cannot change it later.</p>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {questions.map((q, index) => {
          const isAnswered = !!answers[q.id];
          const selectedValue = answers[q.id];
          let optionsList: any[] = [];
          
          if (Array.isArray(q.options)) {
            optionsList = q.options;
          } else if (typeof q.options === 'object' && q.options !== null) {
            optionsList = Object.values(q.options);
          }

          return (
            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="flex-none">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-lg text-slate-800 dark:text-slate-200 font-medium mb-6">
                    {q.question_text}
                  </div>
                  
                  <div className="space-y-3">
                    {optionsList.map((opt: any, optIdx: number) => {
                      const optValue = typeof opt === 'string' ? opt : opt.value || opt.text || String(opt);
                      const isThisSelected = selectedValue === optValue;
                      const letter = String.fromCharCode(65 + optIdx); // A, B, C, D...
                      
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(q.id, optValue)}
                          disabled={isAnswered}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                            isThisSelected 
                              ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                              : isAnswered
                                ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                            isThisSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {letter}
                          </div>
                          <span className="text-base font-medium">{optValue}</span>
                          {isThisSelected && <CheckCircle2 className="w-5 h-5 ml-auto text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)] p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl border ${
              timeLeft <= 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Attempted: {attemptedCount} / {questions.length}
              </span>
              <span className="text-xs text-slate-500">
                {questions.length - attemptedCount} remaining
              </span>
            </div>
          </div>

          <Button 
            size="lg"
            className="px-8 font-bold text-base shadow-md group"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Submitting...</span>
            ) : (
              <span className="flex items-center gap-2">Submit Exam <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" /></span>
            )}
          </Button>

        </div>
      </div>
    </div>
  );
}
