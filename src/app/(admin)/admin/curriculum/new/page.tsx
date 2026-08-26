"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, Loader2, BookOpen, CalendarDays, Sparkles } from "lucide-react";
import { estimateScheduleStats, resetTempIds } from "@/lib/curriculum-scheduler";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function NewCurriculumPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [nctbBooks, setNctbBooks] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    batch_id: "",
    start_date: "",
    end_date: "",
    class_days: [] as string[],
    is_public: false,
    template_id: "none",
    books: [] as number[],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/courses").then((r) => r.json()),
      fetch("/api/admin/curriculum").then((r) => r.json()),
      fetch("/api/admin/nctb-books").then((r) => r.json()),
    ])
      .then(([coursesData, curriculumsData, booksData]) => {
        if (Array.isArray(coursesData)) setCourses(coursesData);
        if (Array.isArray(curriculumsData)) setCurriculums(curriculumsData);
        if (Array.isArray(booksData)) setNctbBooks(booksData);
      })
      .catch((e) => console.error("Failed to fetch initial data", e));
  }, []);

  useEffect(() => {
    if (formData.course_id) {
      fetch(`/api/admin/batches?course_id=${formData.course_id}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setBatches(data);
        })
        .catch((e) => console.error("Failed to fetch batches", e));
    } else {
      setBatches([]);
    }
  }, [formData.course_id]);

  useEffect(() => {
    if (formData.batch_id && batches.length > 0) {
      const selectedBatch = batches.find((b) => b.id.toString() === formData.batch_id);
      if (
        selectedBatch?.class_days &&
        Array.isArray(selectedBatch.class_days) &&
        selectedBatch.class_days.length > 0
      ) {
        const DAY_MAP: Record<string, string> = {
          Sun: "Sunday",
          Mon: "Monday",
          Tue: "Tuesday",
          Wed: "Wednesday",
          Thu: "Thursday",
          Fri: "Friday",
          Sat: "Saturday",
        };
        const mappedDays = selectedBatch.class_days.map((d: string) => DAY_MAP[d] || d);
        setFormData((prev) => ({ ...prev, class_days: mappedDays }));
      }
    }
  }, [formData.batch_id, batches]);

  const selectedBooks = useMemo(
    () => nctbBooks.filter((b) => formData.books.includes(b.id)),
    [nctbBooks, formData.books]
  );

  const preview = useMemo(() => {
    if (!formData.start_date || !formData.end_date || formData.class_days.length === 0) {
      return null;
    }
    resetTempIds(-1);
    return estimateScheduleStats(
      {
        start_date: formData.start_date,
        end_date: formData.end_date,
        class_days: formData.class_days,
        holidays: new Map(),
      },
      selectedBooks
    );
  }, [formData.start_date, formData.end_date, formData.class_days, selectedBooks]);

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      class_days: prev.class_days.includes(day)
        ? prev.class_days.filter((d) => d !== day)
        : [...prev.class_days, day],
    }));
  };

  const handleBookToggle = (bookId: number) => {
    setFormData((prev) => ({
      ...prev,
      books: prev.books.includes(bookId)
        ? prev.books.filter((id) => id !== bookId)
        : [...prev.books, bookId],
    }));
  };

  const validateStep1 = () => {
    if (!formData.title || !formData.course_id || !formData.batch_id || !formData.start_date || !formData.end_date) {
      toast({ title: "Missing fields", description: "Fill title, course, batch, and dates.", variant: "destructive" });
      return false;
    }
    if (formData.class_days.length === 0) {
      toast({ title: "Class days", description: "Select at least one class day.", variant: "destructive" });
      return false;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({ title: "Dates", description: "End date must be after start date.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          template_id: formData.template_id === "none" ? null : formData.template_id,
        }),
      });
      if (!res.ok) throw new Error("Failed to create curriculum");
      const created = await res.json();
      toast({ title: "Roadmap ready", description: "Opening your curriculum planner…" });
      router.push(`/admin/curriculum/${created.id}`);
    } catch {
      toast({ title: "Error", description: "Failed to create curriculum.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const booksBySubject = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of nctbBooks) {
      const key = b.subject || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return Array.from(map.entries());
  }, [nctbBooks]);

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/curriculum">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Curriculum Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            Build a teachable roadmap with classes, chapter exams, and holidays.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <button
              type="button"
              onClick={() => setStep(s)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : step > s
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">
                {s}
              </span>
              {s === 1 ? "Basics" : s === 2 ? "Content" : "Generate"}
            </button>
            {s < 3 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Basics
              </CardTitle>
              <CardDescription>Name, course, batch, and class schedule.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Curriculum Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Class 10 Physics Masterplan 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Course <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.course_id || undefined}
                    onValueChange={(val) =>
                      setFormData({ ...formData, course_id: val as string, batch_id: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course">
                        {courses.find((c) => c.id.toString() === formData.course_id)?.title ||
                          "Select a course"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Batch <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.batch_id || undefined}
                    onValueChange={(val) => setFormData({ ...formData, batch_id: val as string })}
                    disabled={!formData.course_id || batches.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.course_id
                            ? batches.length > 0
                              ? "Select a batch"
                              : "No batches found"
                            : "Select a course first"
                        }
                      >
                        {batches.find((b) => b.id.toString() === formData.batch_id)?.name ||
                          (formData.course_id ? "Select a batch" : "Select a course first")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Class Days *</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const active = formData.class_days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Content
              </CardTitle>
              <CardDescription>
                Select NCTB books and optionally copy from a previous curriculum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label>Copy from existing curriculum</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(val) => setFormData({ ...formData, template_id: val as string })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None — generate fresh">
                      {formData.template_id === "none"
                        ? "None — generate fresh"
                        : curriculums.find((c) => c.id.toString() === formData.template_id)?.title ||
                          "Select template"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None — generate fresh</SelectItem>
                    {curriculums.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Template copies sessions & topics, remapped to your new start date.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>NCTB Books</Label>
                  <Badge variant="secondary">{formData.books.length} selected</Badge>
                </div>
                <div className="max-h-[320px] overflow-y-auto border rounded-lg divide-y">
                  {booksBySubject.map(([subject, books]) => (
                    <div key={subject} className="p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {subject}
                      </p>
                      {books.map((book: any) => (
                        <label
                          key={book.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={formData.books.includes(book.id)}
                            onCheckedChange={() => handleBookToggle(book.id)}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {book.class_name} — {book.subject}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Array.isArray(book.chapters) ? book.chapters.length : 0} chapters
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ))}
                  {nctbBooks.length === 0 && (
                    <p className="p-6 text-sm text-muted-foreground text-center">
                      No NCTB books imported yet.
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <Checkbox
                  checked={formData.is_public}
                  onCheckedChange={(c) => setFormData({ ...formData, is_public: !!c })}
                />
                <div>
                  <p className="text-sm font-medium">Make public for students</p>
                  <p className="text-xs text-muted-foreground">
                    Students in this batch can view the roadmap after you publish.
                  </p>
                </div>
              </label>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Generate Roadmap
              </CardTitle>
              <CardDescription>
                We will create class days, mark holidays, place one topic per class, and insert a
                chapter exam after each chapter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Class days" value={preview?.teachable ?? "—"} />
                <Stat label="Holidays*" value={preview?.holidays ?? "—"} hint="BD holidays added on create" />
                <Stat label="Topics" value={preview?.topics ?? "—"} />
                <Stat label="Chapter exams" value={preview?.exams ?? "—"} />
              </div>
              {preview && !preview.willFit && (
                <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-3">
                  Syllabus needs ~{preview.overflow} more class slots than available. Extra topics
                  will stay in the Remaining panel for you to place later.
                </p>
              )}
              {formData.template_id !== "none" && (
                <p className="text-sm text-primary bg-primary/5 border border-primary/20 rounded-md p-3">
                  Using template — schedule will be cloned and remapped to your start date.
                </p>
              )}
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Status starts as <strong>draft</strong> — edit freely, then Publish.</li>
                <li>Holidays stay on the calendar; skip any day in one click.</li>
                <li>Remaining topics appear in the right panel for quick add.</li>
              </ul>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create & Open Planner
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3" title={hint}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
