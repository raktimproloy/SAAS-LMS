"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Search,
  Printer,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: number;
  title: string;
}

interface Batch {
  id: number;
  name: string;
  course: Course;
}

interface StudentResult {
  id?: number;
  obtained_marks: number;
  grade: string | null;
  comment: string | null;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  photo?: string | null;
  exam_results: StudentResult[];
}

type DraftRow = {
  marks: string;
  comment: string;
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

export default function EditOfflineResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [title, setTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [startTime, setStartTime] = useState("");
  const [isGradingEnabled, setIsGradingEnabled] = useState(false);
  const [examId, setExamId] = useState<number | null>(isNew ? null : parseInt(params.id));
  const [detailsOpen, setDetailsOpen] = useState(isNew);

  const [studentSearch, setStudentSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<number, DraftRow>>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const draftStorageKey = examId ? `offline-results-draft-${examId}` : null;

  const readLocalDraft = useCallback((): Record<number, DraftRow> | null => {
    if (!draftStorageKey || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { drafts?: Record<string, DraftRow> };
      if (!parsed?.drafts || typeof parsed.drafts !== "object") return null;
      const out: Record<number, DraftRow> = {};
      Object.entries(parsed.drafts).forEach(([id, row]) => {
        out[Number(id)] = {
          marks: row?.marks ?? "",
          comment: row?.comment ?? "",
        };
      });
      return out;
    } catch {
      return null;
    }
  }, [draftStorageKey]);

  const writeLocalDraft = useCallback(
    (next: Record<number, DraftRow>) => {
      if (!draftStorageKey || typeof window === "undefined") return;
      try {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({ updatedAt: new Date().toISOString(), drafts: next })
        );
        setHasLocalDraft(true);
      } catch (err) {
        console.error("Failed to write draft", err);
      }
    },
    [draftStorageKey]
  );

  const clearLocalDraft = useCallback(() => {
    if (!draftStorageKey || typeof window === "undefined") return;
    localStorage.removeItem(draftStorageKey);
    setHasLocalDraft(false);
  }, [draftStorageKey]);

  const buildDraftsFromStudents = useCallback((list: Student[]) => {
    const next: Record<number, DraftRow> = {};
    list.forEach((s) => {
      const result = s.exam_results[0];
      next[s.id] = {
        marks: result ? String(result.obtained_marks) : "",
        comment: result?.comment || "",
      };
    });
    return next;
  }, []);

  const updateDraft = (studentId: number, patch: Partial<DraftRow>) => {
    setDrafts((prev) => {
      const current = prev[studentId] || { marks: "", comment: "" };
      const next = {
        ...prev,
        [studentId]: { ...current, ...patch },
      };
      writeLocalDraft(next);
      return next;
    });
  };

  useEffect(() => {
    fetchInitialData();
  }, [params.id]);

  useEffect(() => {
    if (examId && batchId) {
      fetchStudents();
    }
  }, [examId, batchId]);

  const syncDrafts = useCallback(
    (list: Student[]) => {
      const fromServer = buildDraftsFromStudents(list);
      const local = readLocalDraft();
      if (local && Object.keys(local).length > 0) {
        const merged: Record<number, DraftRow> = { ...fromServer };
        Object.entries(local).forEach(([id, row]) => {
          const sid = Number(id);
          if (merged[sid] !== undefined || list.some((s) => s.id === sid)) {
            merged[sid] = {
              marks: row.marks ?? "",
              comment: row.comment ?? "",
            };
          }
        });
        setDrafts(merged);
        setHasLocalDraft(true);
      } else {
        setDrafts(fromServer);
        setHasLocalDraft(false);
      }
    },
    [buildDraftsFromStudents, readLocalDraft]
  );

  const fetchInitialData = async () => {
    try {
      const [crsRes, batRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches"),
      ]);
      if (crsRes.ok) setCourses(await crsRes.json());
      if (batRes.ok) setBatches(await batRes.json());

      if (!isNew) {
        const examRes = await fetch(`/api/admin/exams/${params.id}`);
        if (examRes.ok) {
          const exam = await examRes.json();
          setTitle(exam.title);
          setTotalMarks(exam.total_marks.toString());
          setDurationMinutes(exam.duration_minutes.toString());
          if (exam.start_time) {
            setStartTime(new Date(exam.start_time).toISOString().slice(0, 16));
          }
          setCourseId(exam.course_id?.toString() || "");
          setBatchId(exam.batch_id?.toString() || "");
          setIsGradingEnabled(exam.is_grading_enabled ?? false);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    if (!examId) return;
    try {
      const res = await fetch(`/api/admin/exams/offline/${examId}/students`);
      if (res.ok) {
        const list = await res.json();
        setStudents(list);
        syncDrafts(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveExamDetails = async () => {
    if (!title || !courseId || !batchId || !totalMarks || !durationMinutes || !startTime) {
      alert("Please fill all exam details before saving.");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      type: "offline",
      course_id: courseId,
      batch_id: batchId,
      total_marks: totalMarks,
      duration_minutes: durationMinutes,
      start_time: startTime,
      is_grading_enabled: isGradingEnabled,
      is_public: false,
      status: "active",
    };

    try {
      const url = isNew ? "/api/admin/exams" : `/api/admin/exams/${examId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (isNew) {
          router.push(`/admin/offline-results/${data.data.id}`);
        } else {
          alert("Exam details updated!");
        }
      } else {
        alert("Failed to save exam details");
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const calculateGrade = (marks: number, total: number) => {
    if (!isGradingEnabled) return null;
    const p = (marks / total) * 100;
    if (p >= 80) return "A+";
    if (p >= 70) return "A";
    if (p >= 60) return "A-";
    if (p >= 50) return "B";
    if (p >= 40) return "C";
    if (p >= 33) return "D";
    return "F";
  };

  const isRowDirty = (student: Student, draft: DraftRow) => {
    const existing = student.exam_results[0];
    const marksRaw = draft.marks.trim();
    if (!existing) return marksRaw !== "" || draft.comment.trim() !== "";
    const sameMarks = String(existing.obtained_marks) === marksRaw;
    const sameComment = (existing.comment || "") === (draft.comment || "");
    return !(sameMarks && sameComment);
  };

  const saveAllResults = async () => {
    if (!examId) return;
    const total = parseFloat(totalMarks) || 100;
    const dirty = students.filter((s) => isRowDirty(s, drafts[s.id] || { marks: "", comment: "" }));

    if (dirty.length === 0) {
      clearLocalDraft();
      setLastSavedAt(new Date().toLocaleTimeString());
      return;
    }

    for (const student of dirty) {
      const draft = drafts[student.id] || { marks: "", comment: "" };
      const marksRaw = draft.marks.trim();
      if (marksRaw === "") continue;
      const marks = parseFloat(marksRaw);
      if (Number.isNaN(marks)) {
        alert(`Invalid marks for ${student.name}`);
        return;
      }
      if (marks < 0 || marks > total) {
        alert(`Marks for ${student.name} must be between 0 and ${total}`);
        return;
      }
    }

    setBulkSaving(true);
    let failed = 0;

    try {
      for (const student of dirty) {
        const draft = drafts[student.id] || { marks: "", comment: "" };
        const marksRaw = draft.marks.trim();
        if (marksRaw === "") continue;

        const marks = parseFloat(marksRaw);
        const grade = calculateGrade(marks, total);
        const res = await fetch(`/api/admin/exams/offline/${examId}/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student.id,
            obtained_marks: marks,
            grade,
            comment: draft.comment || null,
          }),
        });
        if (!res.ok) failed += 1;
      }

      if (failed > 0) {
        alert(`Failed to save ${failed} student result(s). Local draft kept.`);
        await fetchStudents();
        return;
      }

      clearLocalDraft();
      setLastSavedAt(new Date().toLocaleTimeString());
      await fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to save results. Local draft kept.");
    } finally {
      setBulkSaving(false);
    }
  };

  const filteredStudents = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.student_id.toLowerCase().includes(studentSearch.toLowerCase())
    )
    .sort((a, b) => a.student_id.localeCompare(b.student_id));

  const focusNext = (currentId: number) => {
    const ids = filteredStudents.map((s) => s.id);
    const idx = ids.indexOf(currentId);
    if (idx === -1) return;
    for (let i = idx + 1; i < ids.length; i++) {
      const el = inputRefs.current[ids[i]];
      if (el) {
        el.focus();
        el.select();
        return;
      }
    }
  };

  const dirtyCount = students.filter((s) =>
    isRowDirty(s, drafts[s.id] || { marks: "", comment: "" })
  ).length;
  const gradedCount = students.filter((s) => {
    const draft = drafts[s.id];
    if (draft?.marks?.trim()) return true;
    return s.exam_results.length > 0;
  }).length;
  const total = parseFloat(totalMarks) || 100;

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/offline-results")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? "Publish Offline Result" : "Edit Offline Result"}
            </h1>
          </div>
        </div>
        {!isNew && examId && (
          <Link href={`/admin/offline-results/${examId}/print`} target="_blank">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" /> Print Result
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setDetailsOpen((open) => !open)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2">
                Exam Details
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    detailsOpen ? "rotate-180" : ""
                  }`}
                />
              </CardTitle>
              <CardDescription>
                {detailsOpen
                  ? "Setup the exam information before entering results."
                  : [
                      title || "Untitled exam",
                      courses.find((c) => c.id.toString() === courseId)?.title,
                      batches.find((b) => b.id.toString() === batchId)?.name,
                      totalMarks ? `${totalMarks} marks` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setDetailsOpen((open) => !open);
              }}
            >
              {detailsOpen ? "Collapse" : "Expand"}
            </Button>
          </div>
        </CardHeader>
        {detailsOpen && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Course</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setBatchId("");
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Batch</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  {batches
                    .filter((b) => b.course.id.toString() === courseId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Exam Name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Physics" />
              </div>

              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date Held</Label>
                <DatePicker 
                  value={startTime ? startTime.split('T')[0] : ""} 
                  onChange={(date) => setStartTime(date ? `${date}T00:00` : "")} 
                  className="w-full"
                />
              </div>

              <div className="space-y-2 flex flex-col justify-center">
                <Label className="mb-2">Show Grading System</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="grading"
                    checked={isGradingEnabled}
                    onCheckedChange={(checked) => setIsGradingEnabled(checked === true)}
                  />
                  <Label htmlFor="grading" className="text-sm font-medium cursor-pointer">
                    {isGradingEnabled ? "Enabled (A+ to F)" : "Disabled (Marks only)"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleSaveExamDetails} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isNew ? "Create Exam & Enter Results" : "Update Exam Details"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {!isNew && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm mb-24">
          <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-r from-primary/10 via-violet-500/10 to-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Student Results</h2>
              <p className="text-sm text-muted-foreground">
                {gradedCount} / {students.length} filled ·{" "}
                {hasLocalDraft || dirtyCount > 0 ? (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"} (kept in browser)
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">All synced</span>
                )}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID or name…"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="h-9 bg-background/80 pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/60">
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Student
                  </th>
                  <th className="w-28 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    ID
                  </th>
                  <th className="w-36 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Marks
                    <span className="block font-normal normal-case tracking-normal text-[10px] opacity-70">
                      out of {total}
                    </span>
                  </th>
                  {isGradingEnabled && (
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
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={isGradingEnabled ? 6 : 5} className="px-4 py-12 text-center text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const draft = drafts[student.id] || { marks: "", comment: "" };
                    const marksNum = draft.marks.trim() === "" ? null : parseFloat(draft.marks);
                    const obtained =
                      marksNum != null && !Number.isNaN(marksNum)
                        ? marksNum
                        : student.exam_results[0]
                          ? student.exam_results[0].obtained_marks
                          : null;
                    const tone = scoreTone(obtained, total);
                    const liveGrade =
                      obtained != null ? calculateGrade(obtained, total) : null;
                    const dirty = isRowDirty(student, draft);
                    const isPending = !student.exam_results.length && draft.marks.trim() === "";

                    return (
                      <tr
                        key={student.id}
                        className={`border-b border-border/80 border-l-4 last:border-b-0 transition-colors ${tone.accent} ${tone.row}`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            {student.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={student.photo}
                                alt={student.name}
                                className="h-11 w-11 shrink-0 rounded-full object-cover border-2 border-background shadow-sm ring-1 ring-border"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary border border-primary/20 shadow-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{student.name}</p>
                              {isPending && (
                                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                  Pending
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-xs text-muted-foreground">{student.student_id}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              ref={(el) => {
                                inputRefs.current[student.id] = el;
                              }}
                              type="number"
                              step="0.01"
                              min={0}
                              max={total}
                              placeholder="—"
                              value={draft.marks}
                              onChange={(e) => updateDraft(student.id, { marks: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  focusNext(student.id);
                                }
                              }}
                              className={`h-10 w-[5.5rem] rounded-lg border border-input bg-background text-center text-base font-bold tabular-nums shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.mark}`}
                            />
                            <span className="text-xs text-muted-foreground">/ {total}</span>
                          </div>
                        </td>
                        {isGradingEnabled && (
                          <td className="px-3 py-2.5 text-center">
                            {liveGrade ? (
                              <Badge className={`${tone.badge} px-2.5 py-0.5 text-sm shadow-sm`}>
                                {liveGrade}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Optional note…"
                            value={draft.comment}
                            onChange={(e) => updateDraft(student.id, { comment: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                focusNext(student.id);
                              }
                            }}
                            className="h-9 w-full min-w-[140px] rounded-lg border border-input bg-background/80 px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {dirty ? (
                            <Badge
                              variant="outline"
                              className="border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                            >
                              Draft
                            </Badge>
                          ) : student.exam_results.length > 0 ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            >
                              Graded
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            >
                              Pending
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-border px-4 py-2.5 text-center text-[11px] text-muted-foreground">
            Typing is stored in this browser until you press Save · Enter moves to the next student
          </p>
        </div>
      )}

      {!isNew && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-[220px] lg:left-[260px] print:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {hasLocalDraft || dirtyCount > 0 ? (
                <span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {dirtyCount} unsaved
                  </span>{" "}
                  — safe if you reload; saved to localStorage
                </span>
              ) : lastSavedAt ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  Saved at {lastSavedAt}
                </span>
              ) : (
                <span>No pending changes</span>
              )}
            </div>
            <Button
              size="lg"
              className="min-w-[180px] shadow-lg"
              onClick={() => void saveAllResults()}
              disabled={bulkSaving || (dirtyCount === 0 && !hasLocalDraft)}
            >
              {bulkSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {bulkSaving ? "Saving…" : "Save Results"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
