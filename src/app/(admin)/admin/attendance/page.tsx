"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Printer,
  CalendarDays,
  FileBarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

interface Course {
  id: number;
  title: string;
}

interface Batch {
  id: number;
  name: string;
  course_id: number;
  class_days?: string[] | null;
  course?: { title?: string };
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  photo: string | null;
  attendance?: { id: number; status: string } | null;
}

interface SessionDate {
  day: number;
  weekday: string;
}

interface MonthlyReport {
  students: Student[];
  records: Record<number, Record<number, string>>;
  daysInMonth: number;
  classDays: string[];
  sessionDates: SessionDate[];
  batch?: { id: number; name: string; course: string };
}

function parseClassDays(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  return [];
}

function weekdayShort(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCourses)
      .catch(console.error);
    fetch("/api/admin/batches")
      .then((res) => (res.ok ? res.json() : []))
      .then(setBatches)
      .catch(console.error);
  }, []);

  const filteredBatches = batches.filter((b) => String(b.course_id) === selectedCourse);

  const selectedBatchData = batches.find((b) => b.id.toString() === selectedBatch);
  const classDaysLabel = parseClassDays(selectedBatchData?.class_days).join(", ") || "All days";

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="mt-1 text-muted-foreground">Manage daily attendance and view monthly reports.</p>
        </div>

        {selectedBatch && (
          <div className="flex w-full max-w-sm rounded-lg border border-border bg-muted/50 p-1 md:w-auto print:hidden">
            <button
              type="button"
              onClick={() => setActiveTab("daily")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "daily"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("monthly")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileBarChart2 className="h-4 w-4" />
              Monthly Report
            </button>
          </div>
        )}
      </div>

      <Card className="border border-border bg-card shadow-sm print:hidden">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="course">Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={(val) => {
                  setSelectedCourse(val || "");
                  setSelectedBatch("");
                }}
              >
                <SelectTrigger id="course" className="w-full bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm">
                  <SelectValue placeholder="All / Choose course…">
                    {courses.find((c) => c.id.toString() === selectedCourse)?.title || "All / Choose course…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All / Choose course…</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch">Batch</Label>
              <Select
                disabled={!selectedCourse}
                value={selectedBatch}
                onValueChange={(val) => setSelectedBatch(val || "")}
              >
                <SelectTrigger id="batch" className="w-full bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm">
                  <SelectValue placeholder="Choose batch…">
                    {filteredBatches.find((b) => b.id.toString() === selectedBatch)?.name || "Choose batch…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Choose batch…</SelectItem>
                  {filteredBatches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                      {parseClassDays(b.class_days).length
                        ? ` (${parseClassDays(b.class_days).join("/")})`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedBatchData && (
            <p className="mt-3 text-xs text-muted-foreground">
              Class days: <span className="font-medium text-foreground">{classDaysLabel}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {selectedBatch && (
        <div>
          {activeTab === "daily" && (
            <DailyTab batchId={selectedBatch} date={date} setDate={setDate} batches={batches} />
          )}
          {activeTab === "monthly" && <MonthlyTab batchId={selectedBatch} />}
        </div>
      )}
    </div>
  );
}

function DailyTab({
  batchId,
  date,
  setDate,
  batches,
}: {
  batchId: string;
  date: string;
  setDate: (d: string) => void;
  batches: Batch[];
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Student | null>(null);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?batch_id=${batchId}&date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: number, status: string) => {
    try {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, attendance: { id: s.attendance?.id || 0, status } } : s
        )
      );
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          batch_id: parseInt(batchId),
          date,
          status,
        }),
      });
    } catch (err) {
      console.error(err);
      fetchAttendance();
    }
  };

  const selectedBatchData = batches.find((b) => b.id.toString() === batchId);
  const classDays = parseClassDays(selectedBatchData?.class_days);
  const dayName = weekdayShort(date);
  const isClassDay = classDays.length === 0 || classDays.includes(dayName);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="overflow-hidden border border-border bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Daily Roster</CardTitle>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <DatePicker
                  value={date}
                  onChange={setDate}
                  className="h-9 w-[180px] print:hidden"
                />
                {isClassDay ? (
                  <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Class day ({dayName})
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Not a class day ({dayName})
                  </span>
                )}
                <Button variant="outline" size="sm" className="gap-2 print:hidden ml-auto" onClick={() => window.print()} disabled={!students.length}>
                  <Printer className="w-4 h-4" />
                  Print Roster
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto p-0 print:max-h-none print:overflow-visible">
            {loading ? (
              <div className="flex flex-col items-center gap-3 p-12 text-muted-foreground">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                Loading roster...
              </div>
            ) : students.length === 0 ? (
              <div className="border-t border-border p-12 text-center text-muted-foreground">
                No students found for this batch.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={student.photo || ""} />
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                          {student.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.student_id}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 print:hidden">
                      <Button
                        size="sm"
                        variant={student.attendance?.status === "present" ? "default" : "outline"}
                        className={
                          student.attendance?.status === "present"
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : ""
                        }
                        onClick={() => markAttendance(student.id, "present")}
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> Present
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendance?.status === "late" ? "default" : "outline"}
                        className={
                          student.attendance?.status === "late"
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : ""
                        }
                        onClick={() => markAttendance(student.id, "late")}
                      >
                        <Clock className="mr-1.5 h-4 w-4" /> Late
                      </Button>
                      <Button
                        size="sm"
                        variant={student.attendance?.status === "absent" ? "default" : "outline"}
                        className={
                          student.attendance?.status === "absent"
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : ""
                        }
                        onClick={() => markAttendance(student.id, "absent")}
                      >
                        <XCircle className="mr-1.5 h-4 w-4" /> Absent
                      </Button>
                    </div>
                    <div className="hidden print:block font-bold">
                      {student.attendance?.status === 'present' ? 'Present' : 
                       student.attendance?.status === 'late' ? 'Late' : 
                       student.attendance?.status === 'absent' ? 'Absent' : 'Not marked'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border bg-card shadow-sm print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Makeup Class Entry
          </CardTitle>
          <CardDescription>Add a student from another batch to today’s session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search ID or Name (Enter)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetch(`/api/admin/students/search?q=${searchQuery}`)
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.length > 0) setSearchResult(data[0]);
                    else alert("No student found with that ID or name");
                  });
              }
            }}
          />
          {searchResult && (
            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={searchResult.photo || ""} />
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {searchResult.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{searchResult.name}</div>
                  <div className="text-xs text-muted-foreground">{searchResult.student_id}</div>
                </div>
              </div>
              <Button
                onClick={() => {
                  markAttendance(searchResult.id, "present");
                  setSearchResult(null);
                  setSearchQuery("");
                }}
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Present for Today
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function statusCell(status?: string) {
  if (status === "present") {
    return { label: "P", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold" };
  }
  if (status === "late") {
    return { label: "L", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold" };
  }
  if (status === "absent") {
    return { label: "A", className: "bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold" };
  }
  return { label: "—", className: "text-muted-foreground/40" };
}

function printMonthlyReport(report: MonthlyReport, month: string, year: string, instituteName: string) {
  const sessions = report.sessionDates?.length
    ? report.sessionDates
    : Array.from({ length: report.daysInMonth }, (_, i) => ({
        day: i + 1,
        weekday: "",
      }));

  const monthLabel = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const classDaysText =
    report.classDays?.length > 0 ? report.classDays.join(", ") : "All days";

  const thead = `
    <tr>
      <th style="text-align:left;min-width:160px">Student</th>
      ${sessions
        .map(
          (s) =>
            `<th style="text-align:center;width:36px">${s.day}<div style="font-size:9px;font-weight:500;color:#666">${s.weekday}</div></th>`
        )
        .join("")}
      <th style="text-align:center">P/L</th>
      <th style="text-align:center">A</th>
    </tr>
  `;

  const tbody = report.students
    .map((student) => {
      let present = 0;
      let absent = 0;
      const cells = sessions
        .map((s) => {
          const status = report.records[student.id]?.[s.day];
          let text = "—";
          let bg = "";
          if (status === "present" || status === "late") {
            text = status === "late" ? "L" : "P";
            bg = status === "late" ? "background:#fff7ed;color:#c2410c" : "background:#ecfdf5;color:#047857";
            present++;
          } else if (status === "absent") {
            text = "A";
            bg = "background:#fef2f2;color:#dc2626";
            absent++;
          }
          return `<td style="text-align:center;font-weight:700;${bg}">${text}</td>`;
        })
        .join("");
      return `<tr>
        <td>
          <div style="font-weight:600">${escapeHtml(student.name)}</div>
          <div style="font-size:10px;color:#666">${escapeHtml(student.student_id)}</div>
        </td>
        ${cells}
        <td style="text-align:center;font-weight:700">${present}</td>
        <td style="text-align:center;font-weight:700">${absent}</td>
      </tr>`;
    })
    .join("");

  const win = window.open("", "_blank", "width=1100,height=750");
  if (!win) {
    alert("Please allow popups to print.");
    return;
  }

  win.document.open();
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Attendance — ${escapeHtml(monthLabel)}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; color: #111; margin: 0; }
          h1 { margin: 0 0 4px; font-size: 18px; text-align: center; }
          .meta { text-align: center; color: #555; margin-bottom: 12px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 4px 5px; vertical-align: middle; }
          th { background: #f3f4f6; font-size: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(instituteName)}</h1>
        <div class="meta">
          Monthly Attendance — ${escapeHtml(monthLabel)}
          ${report.batch ? `<br/>${escapeHtml(report.batch.course)} · ${escapeHtml(report.batch.name)}` : ""}
          <br/>Class days: ${escapeHtml(classDaysText)} · Sessions shown: ${sessions.length}
        </div>
        <table>
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
        </table>
        <script>
          window.onload = function () {
            setTimeout(function () { window.print(); window.close(); }, 250);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function MonthlyTab({ batchId }: { batchId: string }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState(siteConfig.instituteName);

  useEffect(() => {
    fetch('/api/admin/content/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_name) setSiteName(data.site_name);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, month, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/attendance/monthly?batch_id=${batchId}&month=${month}&year=${year}`
      );
      if (res.ok) setReport(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sessions =
    report?.sessionDates?.length
      ? report.sessionDates
      : report
        ? Array.from({ length: report.daysInMonth }, (_, i) => ({
            day: i + 1,
            weekday: "",
          }))
        : [];

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="text-xl">Monthly Overview</CardTitle>
          <CardDescription className="mt-1">
            Only class days are shown
            {report?.classDays?.length
              ? ` (${report.classDays.join(", ")})`
              : " (all days — no class days set on batch)"}
            .
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Month</Label>
            <Select value={month} onValueChange={(val) => setMonth(val || "")}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2000, i, 1).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Year</Label>
            <Select value={year} onValueChange={(val) => setYear(val || "")}>
              <SelectTrigger className="h-9 w-24">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            disabled={!report?.students?.length}
            onClick={() => report && printMonthlyReport(report, month, year, siteName)}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto p-0">
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-12 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            Loading report...
          </div>
        ) : report && report.students.length > 0 ? (
          <div className="min-w-[640px]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="sticky left-0 z-10 w-[220px] border-r border-border bg-muted/90 p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                    Student
                  </th>
                  {sessions.map((s) => (
                    <th
                      key={s.day}
                      className="min-w-[40px] border-r border-border p-2 text-center text-xs font-semibold text-muted-foreground"
                      title={s.weekday}
                    >
                      <div>{s.day}</div>
                      <div className="text-[10px] font-medium text-primary/80">{s.weekday.slice(0, 2)}</div>
                    </th>
                  ))}
                  <th className="w-[70px] p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    P/L
                  </th>
                  <th className="w-[60px] p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    A
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.students.map((student) => {
                  let present = 0;
                  let absent = 0;
                  return (
                    <tr key={student.id} className="hover:bg-muted/30">
                      <td className="sticky left-0 z-10 border-r border-border bg-card/95 p-3 backdrop-blur">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.photo || ""} />
                            <AvatarFallback className="bg-muted text-xs">
                              {student.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold" title={student.name}>
                              {student.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{student.student_id}</div>
                          </div>
                        </div>
                      </td>
                      {sessions.map((s) => {
                        const status = report.records[student.id]?.[s.day];
                        if (status === "present" || status === "late") present++;
                        if (status === "absent") absent++;
                        const cell = statusCell(status);
                        return (
                          <td
                            key={s.day}
                            className={cn(
                              "border-r border-border p-2 text-center text-sm",
                              cell.className
                            )}
                          >
                            {cell.label}
                          </td>
                        );
                      })}
                      <td className="bg-emerald-500/10 p-3 text-center text-base font-bold text-emerald-700 dark:text-emerald-400">
                        {present}
                      </td>
                      <td className="bg-rose-500/10 p-3 text-center text-base font-bold text-rose-700 dark:text-rose-400">
                        {absent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="border-t border-border px-4 py-2.5 text-center text-[11px] text-muted-foreground">
              Showing {sessions.length} session
              {sessions.length === 1 ? "" : "s"} for this month based on batch class days
            </p>
          </div>
        ) : (
          <div className="border-t border-border p-16 text-center text-muted-foreground">
            No students found for{" "}
            {new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
            .
          </div>
        )}
      </CardContent>
    </Card>
  );
}
