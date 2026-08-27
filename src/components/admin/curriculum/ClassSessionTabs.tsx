"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { format, parseISO, subDays } from "date-fns";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FilePlus2,
  FileQuestion,
  FileText,
  Loader2,
  NotebookPen,
  Plus,
  StickyNote,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { dateKeyLocal } from "@/lib/curriculum-class-status";
import { ClassSessionCalendar } from "./ClassSessionCalendar";
import { StudentExpandedRow } from "@/components/admin/students/StudentExpandedRow";
import type { Student, Course, Batch } from "@/components/admin/students/types";

type Note = {
  id: number;
  session_id: number;
  title: string | null;
  body: string;
  file_url: string | null;
  created_at: string;
};

type SessionLite = {
  id: number;
  date: string;
  session_number: number;
  session_type: string;
  is_completed: boolean;
  is_cancelled?: boolean;
};

type Homework = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  session_id: number;
};

interface ClassSessionTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  curriculum: any;
  dateStr: string;
  onAttendanceChange?: () => void;
}

function toDateKey(d: string) {
  try {
    return dateKeyLocal(d.includes("T") ? d : `${d}T00:00:00`);
  } catch {
    return d.slice(0, 10);
  }
}

function PlaceholderPanel({
  icon: Icon,
  title,
  blurb,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  blurb: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-14 text-center text-muted-foreground space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-7 h-7 opacity-40" />
        </div>
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm max-w-sm mx-auto">{blurb}</p>
        <Badge variant="secondary">Coming soon</Badge>
      </CardContent>
    </Card>
  );
}

function AttendancePanel({
  batchId,
  dateStr,
  courseId,
  onChange,
}: {
  batchId: number;
  dateStr: string;
  courseId?: number;
  onChange?: () => void;
}) {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Add Report Dialog State
  const [reportingStudent, setReportingStudent] = useState<Student | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    try {
      const [res, resC, resB] = await Promise.all([
        fetch(`/api/admin/attendance?batch_id=${batchId}&date=${dateStr}`),
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches"),
      ]);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
      if (resC.ok) setCourses(await resC.json());
      if (resB.ok) setBatches(await resB.json());
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [batchId, dateStr]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingStudent || !reportTitle.trim() || !reportDesc.trim()) return;
    setIsSubmittingReport(true);
    try {
      const res = await fetch(`/api/admin/students/${reportingStudent.id}/reports/by-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reportTitle.trim(),
          description: reportDesc.trim(),
          type: "general",
          date: `${dateStr}T12:00:00.000Z`,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add report");
      }
      toast({
        title: "রিপোর্ট সংরক্ষিত হয়েছে",
        description: `${reportingStudent.name}-এর জন্য রিপোর্ট যুক্ত করা হয়েছে।`,
      });
      setReportingStudent(null);
      setReportTitle("");
      setReportDesc("");
      onChange?.();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: err instanceof Error ? err.message : "Failed to add report",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground rounded-xl border border-border bg-card shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading students…
        </div>
      ) : students.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-border bg-card shadow-sm">
          No active students in this batch.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => {
            const isExpanded = expandedId === student.id;
            return (
              <div
                key={student.id}
                className={cn(
                  "flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all duration-200 overflow-hidden",
                  isExpanded ? "ring-2 ring-primary/20 border-primary/40 shadow-md" : "hover:border-border/80 hover:shadow"
                )}
              >
                <div
                  className={cn(
                    "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer transition-colors select-none",
                    isExpanded ? "bg-muted/30" : "hover:bg-muted/20"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : student.id)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/60 text-muted-foreground shrink-0 transition-transform">
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isExpanded && "rotate-90 text-primary font-bold"
                        )}
                      />
                    </div>
                    <Avatar className="h-10 w-10 border shrink-0">
                      <AvatarImage src={student.photo || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {student.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate text-foreground">{student.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px] font-medium text-foreground/80">
                          {student.student_id}
                        </span>
                        {student.phone && (
                          <>
                            <span>•</span>
                            <span>{student.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-10 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs font-medium bg-background hover:bg-accent border-border"
                      onClick={() => {
                        setReportingStudent(student);
                        setReportTitle("");
                        setReportDesc("");
                      }}
                    >
                      <FilePlus2 className="w-3.5 h-3.5 text-primary" />
                      Add Report
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-slate-50/50 dark:bg-slate-900/40 w-full">
                    <StudentExpandedRow
                      student={student}
                      courses={courses}
                      batches={batches}
                      onRefresh={fetchRoster}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Report Dialog */}
      <Dialog
        open={Boolean(reportingStudent)}
        onOpenChange={(open) => {
          if (!open) setReportingStudent(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Add Student Report
            </DialogTitle>
            <DialogDescription>
              {reportingStudent
                ? `${reportingStudent.name} (${reportingStudent.student_id}) — ${dateStr}`
                : "Add evaluation report for this date"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddReport} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="report-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title *
              </Label>
              <Input
                id="report-title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Class Performance, Discipline, Homework"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description / Remarks *
              </Label>
              <Textarea
                id="report-desc"
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Enter feedback or performance evaluation note..."
                rows={4}
                required
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReportingStudent(null)}
                disabled={isSubmittingReport}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingReport || !reportTitle.trim() || !reportDesc.trim()}
                className="gap-1.5"
              >
                {isSubmittingReport ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FilePlus2 className="w-4 h-4" />
                )}
                {isSubmittingReport ? "Saving..." : "Save Report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotesPanel({
  curriculumId,
  session,
  allSessions,
}: {
  curriculumId: number;
  session: SessionLite;
  allSessions: SessionLite[];
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [dueHw, setDueHw] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [targetSessionId, setTargetSessionId] = useState(String(session.id));
  const [uploading, setUploading] = useState(false);

  const sessionKey = toDateKey(session.date);

  const teachable = allSessions.filter(
    (s) =>
      !s.is_cancelled && (s.session_type === "class" || s.session_type === "exam")
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nRes, hRes] = await Promise.all([
        fetch(`/api/admin/curriculum/${curriculumId}/notes?session_id=${session.id}`),
        fetch(`/api/admin/curriculum/${curriculumId}/homework`),
      ]);
      if (nRes.ok) setNotes(await nRes.json());
      if (hRes.ok) {
        const hw: Homework[] = await hRes.json();
        setDueHw(hw.filter((h) => toDateKey(h.due_date) === sessionKey));
      }
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [curriculumId, session.id, sessionKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setTargetSessionId(String(session.id));
  }, [session.id]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload");
      const data = await res.json();
      const url = data.url || data.urls?.[0] || data.fileUrls?.[0];
      if (url) setFileUrl(url);
      else throw new Error("no url");
    } catch {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!body.trim()) {
      toast({ title: "নোটের লেখা দরকার", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/curriculum/${curriculumId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: parseInt(targetSessionId, 10),
          title: title.trim() || null,
          body: body.trim(),
          file_url: fileUrl || null,
        }),
      });
      if (!res.ok) throw new Error("fail");
      toast({ title: "নোট সেভ হয়েছে" });
      setTitle("");
      setBody("");
      setFileUrl("");
      setOpen(false);
      setTargetSessionId(String(session.id));
      await load();
    } catch {
      toast({ title: "নোট সেভ হয়নি", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {dueHw.length > 0 && (
        <div className="rounded-xl border-2 border-amber-400/70 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5" />
            আজ ডিউ হোমওয়ার্ক
          </p>
          {dueHw.map((h) => (
            <div key={h.id}>
              <p className="font-semibold text-sm">{h.title}</p>
              {h.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">ক্লাসের নোট</h3>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen((v) => !v)}>
          <Plus className="w-4 h-4" />
          নোট যোগ
        </Button>
      </div>

      {open && (
        <Card className="border bg-muted/15">
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1.5">
              <Label>কোন ক্লাসে?</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={targetSessionId}
                onChange={(e) => setTargetSessionId(e.target.value)}
              >
                <option value={session.id}>এই ক্লাস (বর্তমান)</option>
                {teachable
                  .filter((s) => s.id !== session.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      ক্লাস {s.session_number} ·{" "}
                      {format(parseISO(toDateKey(s.date) + "T00:00:00"), "d MMM")}
                      {s.session_type === "exam" ? " · পরীক্ষা" : ""}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>শিরোনাম (ঐচ্ছিক)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>নোট</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="ক্লাসের নোট লিখুন…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>ফাইল (ঐচ্ছিক)</Label>
              <Input
                type="file"
                className="h-11"
                disabled={uploading}
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline"
                >
                  আপলোডেড ফাইল দেখুন
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 h-11" disabled={saving || uploading} onClick={submit}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "সেভ"}
              </Button>
              <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>
                বাতিল
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> নোট লোড…
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 italic">
          এখনো কোনো নোট নেই।
        </p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <Card key={n.id} className="shadow-sm">
              <CardContent className="p-4 space-y-1">
                {n.title && <p className="font-semibold text-sm">{n.title}</p>}
                <p className="text-sm whitespace-pre-wrap">{n.body}</p>
                {n.file_url && (
                  <a
                    href={n.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline inline-block mt-1"
                  >
                    সংযুক্ত ফাইল
                  </a>
                )}
                <p className="text-[10px] text-muted-foreground pt-1">
                  {format(new Date(n.created_at), "d MMM yyyy, h:mm a")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClassSessionTabs({
  session,
  curriculum,
  dateStr,
  onAttendanceChange,
}: ClassSessionTabsProps) {
  const batchId = curriculum?.batch?.id || curriculum?.batch_id;
  const courseId = curriculum?.course?.id || curriculum?.course_id;
  const sessions: SessionLite[] = curriculum?.sessions || [];

  return (
    <Tabs defaultValue="attendance" className="w-full flex-col">
      <div className="mb-6 w-full overflow-x-auto pb-1">
        <TabsList className="grid w-full min-w-[420px] grid-cols-5 h-auto p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg">
          <TabsTrigger
            value="attendance"
            className="flex-1 px-3 py-2 text-sm gap-1.5 whitespace-nowrap"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Attendance</span>
            <span className="sm:hidden">Att.</span>
          </TabsTrigger>
          <TabsTrigger
            value="book"
            className="flex-1 px-3 py-2 text-sm gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Book
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex-1 px-3 py-2 text-sm gap-1.5 whitespace-nowrap"
          >
            <NotebookPen className="w-4 h-4 shrink-0" />
            Notes
          </TabsTrigger>
          <TabsTrigger
            value="qb"
            className="flex-1 px-3 py-2 text-sm gap-1.5 whitespace-nowrap"
          >
            <FileQuestion className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Question Bank</span>
            <span className="sm:hidden">Q.B.</span>
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="flex-1 px-3 py-2 text-sm gap-1.5 whitespace-nowrap"
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Session Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="w-full">
        <TabsContent value="attendance" className="mt-0">
          {batchId ? (
            <AttendancePanel
              batchId={batchId}
              dateStr={dateStr}
              courseId={courseId}
              onChange={onAttendanceChange}
            />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">ব্যাচ পাওয়া যায়নি।</p>
          )}
        </TabsContent>

        <TabsContent value="book" className="mt-0">
          <PlaceholderPanel
            icon={BookOpen}
            title="বই"
            blurb="ক্লাস-সংযুক্ত বই ও পঠন সামগ্রী এখানে দেখা যাবে।"
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-0">
          <NotesPanel
            curriculumId={curriculum.id}
            session={session}
            allSessions={sessions}
          />
        </TabsContent>

        <TabsContent value="qb" className="mt-0">
          <PlaceholderPanel
            icon={FileQuestion}
            title="প্রশ্ন ব্যাংক"
            blurb="প্রশ্ন ব্যাংক ও অনুশীলনী শীঘ্রই এখানে যুক্ত হবে।"
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <div className="rounded-lg border border-border bg-card">
            <ClassSessionCalendar
              curriculumId={curriculum.id}
              sessions={sessions}
              currentDate={dateStr}
            />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
