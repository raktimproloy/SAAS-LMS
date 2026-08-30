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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ArrowLeft, ArrowRight, Loader2, BookOpen, CalendarDays, Sparkles } from "lucide-react";
import { estimateScheduleStats, resetTempIds } from "@/lib/curriculum-scheduler";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAY_BN: Record<string, string> = {
  Sunday: "রবি",
  Monday: "সোম",
  Tuesday: "মঙ্গল",
  Wednesday: "বুধ",
  Thursday: "বৃহঃ",
  Friday: "শুক্র",
  Saturday: "শনি",
};

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
    config: {
      examFrequency: "chapter_end" as "chapter_end" | "topic_end" | "none",
      examScheduling: "separate_day" as "separate_day" | "same_day" | "specific_day",
      examSpecificDays: [] as string[],
      daysPerTopic: 1,
    },
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
        config: formData.config,
      },
      selectedBooks
    );
  }, [formData.start_date, formData.end_date, formData.class_days, selectedBooks, formData.config]);

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
      toast({ title: "তথ্য অসম্পূর্ণ", description: "নাম, কোর্স, ব্যাচ আর তারিখ পূরণ করুন।", variant: "destructive" });
      return false;
    }
    if (formData.class_days.length === 0) {
      toast({ title: "ক্লাসের দিন", description: "অন্তত একটা ক্লাসের দিন সিলেক্ট করুন।", variant: "destructive" });
      return false;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({ title: "তারিখ", description: "শেষ তারিখ শুরুর তারিখের পরে হতে হবে।", variant: "destructive" });
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
      toast({ title: "রোডম্যাপ তৈরি হয়েছে", description: "প্ল্যানার খোলা হচ্ছে…" });
      router.push(`/admin/curriculum/${created.id}`);
    } catch {
      toast({ title: "সমস্যা হয়েছে", description: "কারিকুলাম তৈরি করা যায়নি।", variant: "destructive" });
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
          <h1 className="text-3xl font-bold tracking-tight">নতুন কারিকুলাম তৈরি</h1>
          <p className="text-muted-foreground mt-1">
            ক্লাস, অধ্যায় শেষে পরীক্ষা আর ছুটির দিন দিয়ে রোডম্যাপ বানান।
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
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
              {s === 1 ? "মূল তথ্য" : "বিষয়বস্তু ও তৈরি"}
            </button>
            {s < 2 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                মূল তথ্য
              </CardTitle>
              <CardDescription>নাম, কোর্স, ব্যাচ আর কোন কোন দিন ক্লাস হবে।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  কারিকুলামের নাম <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm"
                  id="title"
                  placeholder="যেমন: ক্লাস ১০ পদার্থবিজ্ঞান ২০২৬"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>কোর্স <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.course_id || undefined}
                    onValueChange={(val) =>
                      setFormData({ ...formData, course_id: val as string, batch_id: "" })
                    }
                  >
                    <SelectTrigger className="bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm">
                      <SelectValue placeholder="কোর্স সিলেক্ট করুন">
                        {courses.find((c) => c.id.toString() === formData.course_id)?.title ||
                          "কোর্স সিলেক্ট করুন"}
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
                  <Label>ব্যাচ <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.batch_id || undefined}
                    onValueChange={(val) => setFormData({ ...formData, batch_id: val as string })}
                    disabled={!formData.course_id || batches.length === 0}
                  >
                    <SelectTrigger className="bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm">
                      <SelectValue
                        placeholder={
                          formData.course_id
                            ? batches.length > 0
                              ? "ব্যাচ সিলেক্ট করুন"
                              : "কোনো ব্যাচ পাওয়া যায়নি"
                            : "কোর্স সিলেক্ট করুন first"
                        }
                      >
                        {batches.find((b) => b.id.toString() === formData.batch_id)?.name ||
                          (formData.course_id ? "ব্যাচ সিলেক্ট করুন" : "কোর্স সিলেক্ট করুন first")}
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

              <div className="grid gap-2">
                <Label>শুরুর ও শেষ তারিখ <span className="text-destructive">*</span></Label>
                <DateRangePicker
                  startDate={formData.start_date}
                  endDate={formData.end_date}
                  onStartDateChange={(d) => setFormData({ ...formData, start_date: d })}
                  onEndDateChange={(d) => setFormData({ ...formData, end_date: d })}
                  className="w-full sm:w-[320px]"
                />
              </div>

              <div className="space-y-3">
                <Label>ক্লাসের দিন *</Label>
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
                        {DAY_BN[day] || day.slice(0, 3)}
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
                পরের ধাপ <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                বিষয়বস্তু
              </CardTitle>
              <CardDescription>
                এনসিটিবি বই সিলেক্ট করুন। চাইলে আগের কোনো কারিকুলাম থেকেও কপি করতে পারেন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label>আগের কারিকুলাম থেকে কপি</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(val) => setFormData({ ...formData, template_id: val as string })}
                >
                  <SelectTrigger className="bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm">
                    <SelectValue placeholder="কপি নয় — নতুন করে বানাব">
                      {formData.template_id === "none"
                        ? "কপি নয় — নতুন করে বানাব"
                        : curriculums.find((c) => c.id.toString() === formData.template_id)?.title ||
                          "টেমপ্লেট সিলেক্ট করুন"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">কপি নয় — নতুন করে বানাব</SelectItem>
                    {curriculums.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  টেমপ্লেট নিলে ক্লাস ও টপিক কপি হবে, নতুন শুরুর তারিখ অনুযায়ী সাজানো হবে।
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>এনসিটিবি বই</Label>
                  <Badge variant="secondary">{formData.books.length} টি বেছে নেওয়া</Badge>
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
                              {Array.isArray(book.chapters) ? book.chapters.length : 0}টি অধ্যায়
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ))}
                  {nctbBooks.length === 0 && (
                    <p className="p-6 text-sm text-muted-foreground text-center">
                      এখনো কোনো এনসিটিবি বই ইমপোর্ট করা হয়নি।
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">অ্যাডভান্সড সেটিংস (Advanced Settings)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>পরীক্ষা কখন হবে (Exam Frequency)</Label>
                    <Select
                      value={formData.config.examFrequency}
                      onValueChange={(val: any) => setFormData({ ...formData, config: { ...formData.config, examFrequency: val } })}
                    >
                      <SelectTrigger className="bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm">
                        <SelectValue>
                          {formData.config.examFrequency === "chapter_end" ? "অধ্যায় শেষে (Chapter End)" :
                           formData.config.examFrequency === "topic_end" ? "টপিক শেষে কুইজ (Topic Quiz)" :
                           "কোনো পরীক্ষা নেই (No Exams)"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chapter_end">অধ্যায় শেষে (Chapter End)</SelectItem>
                        <SelectItem value="topic_end">টপিক শেষে কুইজ (Topic Quiz)</SelectItem>
                        <SelectItem value="none">কোনো পরীক্ষা নেই (No Exams)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>প্রতি টপিকের জন্য ক্লাস (Days per Topic)</Label>
                    <Input
                      className="bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.config.daysPerTopic}
                      onChange={(e) => setFormData({ ...formData, config: { ...formData.config, daysPerTopic: parseInt(e.target.value) || 1 } })}
                    />
                  </div>
                </div>

                {formData.config.examFrequency !== "none" && (
                  <div className="grid gap-2">
                    <Label>পরীক্ষার দিন (Exam Scheduling)</Label>
                    <Select
                      value={formData.config.examScheduling}
                      onValueChange={(val: any) => setFormData({ ...formData, config: { ...formData.config, examScheduling: val } })}
                    >
                      <SelectTrigger className="bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm">
                        <SelectValue>
                          {formData.config.examScheduling === "separate_day" ? "আলাদা দিনে (Separate Day)" :
                           formData.config.examScheduling === "same_day" ? "ক্লাসের দিনেই (Same Day as Class)" :
                           "সপ্তাহের নির্দিষ্ট দিনে (Specific Routine Day)"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="separate_day">আলাদা দিনে (Separate Day)</SelectItem>
                        <SelectItem value="same_day">ক্লাসের দিনেই (Same Day as Class)</SelectItem>
                        <SelectItem value="specific_day">সপ্তাহের নির্দিষ্ট দিনে (Specific Routine Day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.config.examFrequency !== "none" && formData.config.examScheduling === "specific_day" && (
                  <div className="space-y-3">
                    <Label>কোন দিন পরীক্ষা হবে? (Select Exam Days)</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const active = formData.config.examSpecificDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const newDays = active
                                ? formData.config.examSpecificDays.filter((d) => d !== day)
                                : [...formData.config.examSpecificDays, day];
                              setFormData({ ...formData, config: { ...formData.config, examSpecificDays: newDays } });
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted"
                            }`}
                          >
                            {DAY_BN[day] || day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={formData.is_public}
                  onCheckedChange={(c) => setFormData({ ...formData, is_public: !!c })}
                />
                <div>
                  <p className="text-sm font-medium">স্টুডেন্টদের দেখানোর জন্য খোলা রাখুন</p>
                  <p className="text-xs text-muted-foreground">
                    প্রকাশ করার পর এই ব্যাচের স্টুডেন্টরা রোডম্যাপ দেখতে পারবে।
                  </p>
                </div>
              </label>

              {preview && (
                <div className="pt-4 border-t space-y-4">
                  <h3 className="text-lg font-medium text-primary">রোডম্যাপ প্রিভিউ (Preview)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="ক্লাসের দিন" value={preview.teachable} />
                    <Stat label="ছুটি*" value={preview.holidays} hint="তৈরির সময় বাংলাদেশের সরকারি ছুটি যোগ হবে" />
                    <Stat label="টপিক" value={preview.topics} />
                    <Stat label="পরীক্ষা" value={preview.exams} />
                  </div>
                  {!preview.willFit && (
                    <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-3">
                      সিলেবাসের জন্য প্রায় {preview.overflow}টি ক্লাস কম পড়ছে। বাড়তি টপিক ডান পাশের বাকি টপিক প্যানেলে থাকবে — পরে বসিয়ে নিতে পারবেন।
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                পেছনে
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                তৈরি করে প্ল্যানার খুলুন <ArrowRight className="w-4 h-4 ml-2" />
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
    <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-background to-primary/5 p-4 shadow-sm hover:shadow-md transition-shadow" title={hint}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-bold mt-2 text-primary">{value}</p>
    </div>
  );
}
