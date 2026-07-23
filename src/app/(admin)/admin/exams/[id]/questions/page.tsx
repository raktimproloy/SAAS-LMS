"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  explanation: string;
  sort_order: number;
}

export default function ExamQuestionsPage({ params }: { params: { id: string } }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("a");
  const [marks, setMarks] = useState("1");
  const [explanation, setExplanation] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/exams/${params.id}/questions`);
      if (res.ok) setQuestions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch(`/api/admin/exams/${params.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_option: correctOption,
          marks,
          explanation
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add question");
      }

      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectOption("a");
      setMarks("1");
      setExplanation("");
      setIsDialogOpen(false);
      
      fetchQuestions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/exams">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Questions</h1>
            <p className="text-muted-foreground mt-1">Add or edit MCQ questions for this exam.</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* @ts-expect-error - Radix UI type mismatch for asChild */}
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                  {formError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea 
                  value={questionText} 
                  onChange={(e) => setQuestionText(e.target.value)} 
                  required 
                  placeholder="Enter the main question..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Option A</Label>
                  <Input value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Option B</Label>
                  <Input value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Option C</Label>
                  <Input value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Option D</Label>
                  <Input value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Correct Option</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={correctOption} 
                    onChange={(e) => setCorrectOption(e.target.value)}
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input type="number" step="0.25" value={marks} onChange={(e) => setMarks(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Explanation (Optional)</Label>
                <Textarea 
                  value={explanation} 
                  onChange={(e) => setExplanation(e.target.value)} 
                  placeholder="Explain why the correct answer is right..."
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Question"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading questions...</p>
        ) : questions.length === 0 ? (
          <Card className="border-none shadow-sm dark:bg-slate-800/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              No questions have been added to this exam yet.
            </CardContent>
          </Card>
        ) : (
          questions.map((q, index) => (
            <Card key={q.id} className="border-none shadow-sm dark:bg-slate-800/50 relative group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono">Q{index + 1}</Badge>
                      <Badge variant="secondary" className="font-mono">{q.marks} Marks</Badge>
                    </div>
                    <p className="text-lg font-medium whitespace-pre-wrap mb-4">{q.question_text}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className={`p-3 rounded-md border ${q.correct_option === 'a' ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' : 'bg-background'}`}>
                        <span className="font-bold mr-2">A.</span> {q.option_a}
                      </div>
                      <div className={`p-3 rounded-md border ${q.correct_option === 'b' ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' : 'bg-background'}`}>
                        <span className="font-bold mr-2">B.</span> {q.option_b}
                      </div>
                      <div className={`p-3 rounded-md border ${q.correct_option === 'c' ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' : 'bg-background'}`}>
                        <span className="font-bold mr-2">C.</span> {q.option_c}
                      </div>
                      <div className={`p-3 rounded-md border ${q.correct_option === 'd' ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' : 'bg-background'}`}>
                        <span className="font-bold mr-2">D.</span> {q.option_d}
                      </div>
                    </div>
                    
                    {q.explanation && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground border">
                        <span className="font-semibold block mb-1 text-foreground">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
