"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
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
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Timer logic
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/student/exams/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          time_taken_seconds: durationMinutes * 60 - timeLeft
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
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

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQ].id]: option }));
  };

  const toggleReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [questions[currentQ].id]: !prev[questions[currentQ].id]
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const q = questions[currentQ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto h-[calc(100vh-120px)] animate-in fade-in zoom-in-95 duration-500">
      
      {/* Left side: Question Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500">Question {currentQ + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-mono font-bold text-lg border border-red-100">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          <div className="text-xl text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {q.question_text}
          </div>

          <div className="space-y-3">
            {["a", "b", "c", "d"].map((opt) => {
              const optionKey = `option_${opt}` as keyof Question;
              const isSelected = answers[q.id] === opt;
              
              return (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect(opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <span className="text-lg">{String(q[optionKey])}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          
          <Button 
            variant="outline"
            onClick={toggleReview}
            className={`gap-2 ${markedForReview[q.id] ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' : ''}`}
          >
            <Flag className="w-4 h-4" /> {markedForReview[q.id] ? 'Unmark Review' : 'Mark for Review'}
          </Button>

          <Button 
            onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQ === questions.length - 1}
            className="gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right side: Nav Panel */}
      <div className="w-full lg:w-72 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b font-bold text-slate-700 dark:text-slate-200">
          Question Navigator
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, idx) => {
              const isAnswered = !!answers[question.id];
              const isMarked = !!markedForReview[question.id];
              const isActive = currentQ === idx;

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQ(idx)}
                  className={`
                    h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-all border-2
                    ${isActive ? 'ring-2 ring-primary ring-offset-1 border-transparent' : 'border-slate-200 dark:border-slate-700'}
                    ${isMarked ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                      isAnswered ? 'bg-green-100 text-green-700 border-green-200' : 'hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800'}
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="p-4 border-t space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 border-green-200 border rounded" /> Answered</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-100 border-amber-200 border rounded" /> Marked for Review</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 border-slate-200 border rounded" /> Unanswered</div>
        </div>

        <div className="p-4 border-t bg-slate-50 dark:bg-slate-950">
          <Button 
            className="w-full gap-2 font-bold" 
            size="lg"
            onClick={() => {
              if (confirm("Are you sure you want to submit the exam?")) {
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
          >
            <CheckCircle2 className="w-5 h-5" />
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      </div>

    </div>
  );
}
