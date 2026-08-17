/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OfflineExamResultView } from "@/components/student/OfflineExamResultView";
import { isOfflineExamType } from "@/lib/exam-type";

export default function StudentExamResultPage() {
  const params = useParams();
  const examId = params.id as string;

  const [data, setData] = useState<{
    result: any;
    leaderboard: any[];
    classResults?: any[];
    isOffline?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!examId || examId === "undefined") {
      setError("Invalid exam");
      setLoading(false);
      return;
    }

    fetch(`/api/student/exams/${examId}/result`)
      .then((res) => res.json())
      .then((resData) => {
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
      <div className="mx-auto max-w-6xl space-y-8 pb-20">
        <div className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur-xl md:flex-row">
          <div className="w-full space-y-3 md:w-auto">
            <Skeleton className="h-9 w-64 rounded-lg bg-muted md:w-96" />
            <Skeleton className="h-5 w-48 rounded-md bg-muted/50" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border bg-red-50 p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { result } = data;
  const exam = result.exam;
  const isOffline = data.isOffline || isOfflineExamType(exam?.type);

  if (isOffline) {
    return (
      <OfflineExamResultView
        result={result}
        classResults={data.classResults || data.leaderboard || []}
        examId={examId}
      />
    );
  }

  const toggleExplanation = (qId: number) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const answers = result.answers || {};
  const questions = exam.questions || [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      <div className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur-xl md:flex-row">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">{exam.title}</h1>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" /> Time Taken:{" "}
            {Math.floor((result.time_taken_seconds || 0) / 60)}m {(result.time_taken_seconds || 0) % 60}s
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 md:mt-0 md:w-auto">
          <Link
            href={`/student/exams/${examId}/leaderboard`}
            className="order-last w-full sm:order-first sm:w-auto"
          >
            <Button
              variant="outline"
              className="h-12 w-full rounded-2xl border-amber-500/20 bg-amber-500/10 px-6 font-semibold text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-md transition-all hover:border-amber-500/40 hover:bg-amber-500/20 sm:w-auto"
            >
              <Medal className="mr-2 h-4 w-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> View
              Leaderboard
            </Button>
          </Link>
          <div className="hidden h-12 w-px bg-border sm:block" />
          <div className="flex w-full items-center justify-center gap-6 sm:w-auto sm:gap-8">
            <div>
              <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Score
              </div>
              <div className="text-4xl font-bold text-primary">
                {result.obtained_marks}{" "}
                <span className="text-lg text-muted-foreground/70">/ {result.total_marks}</span>
              </div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Rank
              </div>
              <div className="text-4xl font-bold text-amber-500">#{result.rank || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50/50 shadow-sm dark:border-green-900/50 dark:bg-green-900/10">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500 dark:text-green-400" />
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {result.correct_count}
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-500">Correct</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50 shadow-sm dark:border-red-900/50 dark:bg-red-900/10">
            <CardContent className="p-6 text-center">
              <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500 dark:text-red-400" />
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                {result.wrong_count}
              </div>
              <div className="text-sm font-medium text-red-600 dark:text-red-500">Wrong</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-muted/50 shadow-sm">
            <CardContent className="p-6 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-500 dark:text-amber-400" />
              <div className="text-3xl font-bold text-foreground">{result.skipped_count}</div>
              <div className="text-sm font-medium text-muted-foreground">Skipped</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="px-1 text-xl font-bold text-foreground">Review Answers</h2>
          <div className="space-y-6">
            {(() => {
              let globalQuestionCounter = 1;
              const rootQuestions = questions.filter((q: any) => !q.parent_id);
              const childrenMap: Record<number, any[]> = {};

              questions.forEach((q: any) => {
                if (q.parent_id) {
                  if (!childrenMap[q.parent_id]) childrenMap[q.parent_id] = [];
                  childrenMap[q.parent_id].push(q);
                }
              });

              const renderResultMCQ = (q: any, qNumber: number, isChild = false) => {
                const studentAns = answers[q.id];
                const correctAns = q.correct_option;
                const isCorrect = studentAns === correctAns;
                const isSkipped = !studentAns;
                const isExplanationExpanded = !!expandedExplanations[q.id];

                let optionsList: any[] = [];
                if (Array.isArray(q.options)) {
                  optionsList = q.options;
                } else if (typeof q.options === "object" && q.options !== null) {
                  optionsList = Object.values(q.options);
                }

                return (
                  <div
                    key={q.id}
                    className={`overflow-hidden rounded-xl border bg-card shadow-sm transition-all ${
                      isCorrect
                        ? "border-green-200 dark:border-green-900/50"
                        : isSkipped
                          ? "border-amber-200 dark:border-amber-900/50"
                          : "border-red-200 dark:border-red-900/50"
                    } ${isChild ? "mb-4" : ""}`}
                  >
                    <div
                      className={`flex gap-4 p-5 ${
                        isCorrect
                          ? "bg-green-50/30 dark:bg-green-900/10"
                          : isSkipped
                            ? "bg-amber-50/30 dark:bg-amber-900/10"
                            : "bg-red-50/30 dark:bg-red-900/10"
                      }`}
                    >
                      <div className="flex-none pt-1">
                        {isCorrect ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : isSkipped ? (
                          <AlertCircle className="h-6 w-6 text-amber-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground">
                            Question {qNumber}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              isCorrect
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : isSkipped
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            }`}
                          >
                            {isCorrect
                              ? `+${q.marks}`
                              : isSkipped
                                ? "0"
                                : `-${exam.negative_marking}`}{" "}
                            Marks
                          </span>
                        </div>
                        <p className="text-lg font-medium leading-snug text-foreground">
                          {q.question_text}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border bg-card/50 p-5">
                      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {optionsList.map((opt: any, optIdx: number) => {
                          const optId = typeof opt === "string" ? opt : opt.id || String(optIdx);
                          const optText =
                            typeof opt === "string"
                              ? opt
                              : opt.text || opt.value || String(opt);
                          const letter = String.fromCharCode(65 + optIdx);
                          const isThisCorrect = String(optId) === String(correctAns);
                          const isThisStudentSelected = String(optId) === String(studentAns);

                          let bgColor = "bg-muted/50 border-border";
                          let icon = null;
                          let letterBgColor = "bg-muted-foreground/20 text-muted-foreground";

                          if (isSkipped && isThisCorrect) {
                            bgColor =
                              "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-100 shadow-sm ring-1 ring-amber-300";
                            icon = (
                              <CheckCircle2 className="ml-auto h-5 w-5 text-amber-600 dark:text-amber-400" />
                            );
                            letterBgColor =
                              "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100";
                          } else if (!isSkipped && isThisCorrect) {
                            bgColor =
                              "bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100 shadow-sm ring-1 ring-green-300";
                            icon = (
                              <CheckCircle2 className="ml-auto h-5 w-5 text-green-600 dark:text-green-400" />
                            );
                            letterBgColor =
                              "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100";
                          } else if (isThisStudentSelected && !isThisCorrect) {
                            bgColor =
                              "bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-100 shadow-sm";
                            icon = (
                              <XCircle className="ml-auto h-5 w-5 text-red-600 dark:text-red-400" />
                            );
                            letterBgColor =
                              "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100";
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-3 rounded-xl border p-4 ${bgColor}`}
                            >
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${letterBgColor}`}
                              >
                                {letter}
                              </div>
                              <span className="flex-1 text-sm font-medium">{optText}</span>
                              {icon}
                            </div>
                          );
                        })}
                      </div>

                      {!isExplanationExpanded ? (
                        <button
                          onClick={() => toggleExplanation(q.id)}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-green-200 bg-green-50/50 p-4 font-medium text-green-700 transition-colors hover:bg-green-100/50 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          <ChevronDown className="h-4 w-4" /> View Solution Explanation
                        </button>
                      ) : (
                        <div className="relative rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-900/50 dark:bg-green-900/10">
                          <button
                            onClick={() => toggleExplanation(q.id)}
                            className="absolute right-4 top-4 text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <h4 className="mb-2 flex items-center gap-2 font-bold text-green-800 dark:text-green-400">
                            Solution Explanation
                          </h4>
                          <p className="pr-6 text-sm leading-relaxed text-green-900/80 dark:text-green-100/70">
                            {q.explanation || "No explanation provided for this question."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              };

              if (rootQuestions.length === 0) {
                return (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    No questions available for review.
                  </div>
                );
              }

              return rootQuestions.map((q: any) => {
                if (q.type === "passage") {
                  const childQuestions = childrenMap[q.id] || [];
                  return (
                    <div
                      key={q.id}
                      className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <div className="border-b border-border bg-muted/40 p-6">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:bg-primary/20">
                            Read The Passage
                          </span>
                        </div>
                        <div className="text-lg font-medium leading-relaxed text-foreground">
                          {q.question_text}
                        </div>
                      </div>
                      <div className="space-y-6 bg-background/50 p-6">
                        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Questions in this passage
                        </h4>
                        {childQuestions.map((cq) => {
                          const qNum = globalQuestionCounter++;
                          return renderResultMCQ(cq, qNum, true);
                        })}
                      </div>
                    </div>
                  );
                }
                const qNum = globalQuestionCounter++;
                return renderResultMCQ(q, qNum, false);
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
