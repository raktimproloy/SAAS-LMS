"use client";

import Link from "next/link";
import { ArrowLeft, Medal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ClassResultRow = {
  id: number;
  obtained_marks: number;
  total_marks: number;
  grade: string | null;
  comment: string | null;
  rank: number | null;
  student_id: number | null;
  student?: {
    id: number;
    name: string;
    photo?: string | null;
    student_id: string;
  } | null;
};

type OfflineExamResultViewProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  classResults?: ClassResultRow[];
  examId: string;
};

function scoreTone(obtained: number | null, total: number) {
  if (obtained == null || !total) {
    return {
      row: "bg-card hover:bg-muted/40",
      accent: "border-l-muted-foreground/30",
      mark: "text-muted-foreground",
      badge: "border-border bg-muted text-muted-foreground",
    };
  }
  const p = (obtained / total) * 100;
  if (p >= 80) {
    return {
      row: "bg-emerald-50/70 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
      accent: "border-l-emerald-500",
      mark: "text-emerald-700 dark:text-emerald-400",
      badge: "border-emerald-500/30 bg-emerald-500 text-white",
    };
  }
  if (p >= 50) {
    return {
      row: "bg-sky-50/70 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/30",
      accent: "border-l-sky-500",
      mark: "text-sky-700 dark:text-sky-400",
      badge: "border-sky-500/30 bg-sky-500 text-white",
    };
  }
  if (p >= 33) {
    return {
      row: "bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30",
      accent: "border-l-amber-500",
      mark: "text-amber-700 dark:text-amber-400",
      badge: "border-amber-500/30 bg-amber-500 text-white",
    };
  }
  return {
    row: "bg-rose-50/70 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30",
    accent: "border-l-rose-500",
    mark: "text-rose-700 dark:text-rose-400",
    badge: "border-rose-500/30 bg-rose-500 text-white",
  };
}

export function OfflineExamResultView({
  result,
  classResults = [],
  examId,
}: OfflineExamResultViewProps) {
  const exam = result.exam;
  const total = result.total_marks || exam?.total_marks || 0;
  const showGrade = exam?.is_grading_enabled !== false;
  const heldOn = exam?.start_time
    ? new Date(exam.start_time).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const rows =
    classResults.length > 0
      ? classResults
      : [
          {
            id: result.id,
            obtained_marks: result.obtained_marks,
            total_marks: total,
            grade: result.grade,
            comment: result.comment,
            rank: result.rank,
            student_id: result.student_id,
            student: result.student ?? null,
          } as ClassResultRow,
        ];

  const gradedCount = rows.length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/student/results"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-9 w-9 shrink-0")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {exam?.title || "Offline Result"}
            </h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {[exam?.course?.title, exam?.batch?.name, heldOn ? `Held ${heldOn}` : null, `${total} marks`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <Link href={`/student/exams/${examId}/leaderboard`} className="shrink-0">
          <Button
            variant="outline"
            className="h-9 w-full border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 sm:w-auto"
          >
            <Medal className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        </Link>
      </div>

      {/* Same list card as admin offline Student Results */}
      <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border bg-gradient-to-r from-primary/10 via-violet-500/10 to-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Student Results</h2>
            <p className="text-sm text-muted-foreground">
              {gradedCount} student{gradedCount === 1 ? "" : "s"} graded
              <span className="text-emerald-600 dark:text-emerald-400"> · Published</span>
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-primary/30 bg-background/70 text-[10px] uppercase tracking-wider">
            Offline Exam
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/60">
              <tr className="border-b border-border text-left">
                <th className="w-14 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rank
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student
                </th>
                <th className="w-28 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="w-36 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Marks
                  <span className="block text-[10px] font-normal normal-case tracking-normal opacity-70">
                    out of {total}
                  </span>
                </th>
                {showGrade && (
                  <th className="w-24 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Grade
                  </th>
                )}
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Comment
                </th>
                <th className="w-28 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={showGrade ? 7 : 6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No results found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const obtained = row.obtained_marks;
                  const tone = scoreTone(obtained, total);
                  const isMe = row.student_id === result.student_id || row.id === result.id;
                  const name = row.student?.name || "Student";
                  const sid = row.student?.student_id || "—";
                  const photo = row.student?.photo;
                  const displayRank = row.rank ?? index + 1;

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-border/80 border-l-4 last:border-b-0 transition-colors",
                        tone.accent,
                        tone.row,
                        isMe && "ring-2 ring-inset ring-primary/40"
                      )}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          #{displayRank}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex min-w-0 items-center gap-3">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo}
                              alt={name}
                              className="h-11 w-11 shrink-0 rounded-full object-cover border-2 border-background shadow-sm ring-1 ring-border"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary shadow-sm">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {name}
                              {isMe && (
                                <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-primary">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-xs text-muted-foreground">{sid}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex h-10 min-w-[5.5rem] items-center justify-center rounded-lg border border-input bg-background px-2 text-base font-bold tabular-nums shadow-sm",
                              tone.mark
                            )}
                          >
                            {obtained}
                          </span>
                          <span className="text-xs text-muted-foreground">/ {total}</span>
                        </div>
                      </td>
                      {showGrade && (
                        <td className="px-3 py-2.5 text-center">
                          {row.grade ? (
                            <Badge className={`${tone.badge} px-2.5 py-0.5 text-sm shadow-sm`}>
                              {row.grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <div className="min-h-9 w-full min-w-[140px] rounded-lg border border-input bg-background/80 px-2.5 py-2 text-sm text-foreground">
                          {row.comment || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        >
                          Graded
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2.5 text-center text-[11px] text-muted-foreground">
          Your row is highlighted · Color shows score band (green high → red low)
        </p>
      </div>
    </div>
  );
}
