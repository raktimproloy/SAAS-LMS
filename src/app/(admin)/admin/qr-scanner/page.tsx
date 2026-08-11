"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Scan, CheckCircle2, XCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Course {
  id: number;
  title: string;
}

interface Batch {
  id: number;
  name: string;
  course_id: number;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  photo: string | null;
}

export default function QRScannerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    fetch("/api/admin/courses").then(res => res.json()).then(setCourses);
    fetch("/api/admin/batches").then(res => res.json()).then(setBatches);
  }, []);

  const filteredBatches = batches.filter(b => b.course_id.toString() === selectedCourse);

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Scanner</h1>
        <p className="text-muted-foreground">Select a batch and scan student ID cards to mark attendance quickly.</p>
      </div>

      <Card className="border-none shadow-md dark:shadow-none dark:bg-slate-900/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="course">Select Course</Label>
              <select 
                id="course"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedBatch("");
                }}
              >
                <option value="">-- Choose Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch">Select Batch</Label>
              <select 
                id="batch"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={!selectedCourse}
              >
                <option value="">-- Choose Batch --</option>
                {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBatch ? (
        <ScannerTool batchId={selectedBatch} date={date} setDate={setDate} />
      ) : (
        <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          <Scan className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Please select a Course and Batch to start scanning.</p>
        </div>
      )}
    </div>
  );
}

function ScannerTool({ batchId, date, setDate }: { batchId: string, date: string, setDate: (d: string) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanCache, setScanCache] = useState<Record<number, string>>({});
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const storageKey = `lms_qr_scan_${batchId}_${date}`;

  useEffect(() => {
    // Load from local storage
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setScanCache(parsed.scanCache || {});
        setRecentScans(parsed.recentScans || []);
      } catch (e) {
        console.error(e);
      }
    } else {
      setScanCache({});
      setRecentScans([]);
    }

    // Fetch students
    setLoading(true);
    fetch(`/api/admin/students?batch_id=${batchId}`)
      .then(res => res.json())
      .then(data => {
        setStudents(data);
      })
      .finally(() => setLoading(false));
  }, [batchId, date, storageKey]);

  useEffect(() => {
    const handleClick = (e: any) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
        scanInputRef.current?.focus();
      }
    };
    document.addEventListener("click", handleClick);
    setTimeout(() => scanInputRef.current?.focus(), 200);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const persistToStorage = useCallback((newScanCache: any, newRecentScans: any) => {
    localStorage.setItem(storageKey, JSON.stringify({
      scanCache: newScanCache,
      recentScans: newRecentScans,
      updatedAt: new Date().toISOString()
    }));
  }, [storageKey]);

  const processScan = (identifier: string) => {
    if (!identifier) return;
    const student = students.find(s => s.student_id === identifier);
    
    if (!student) {
      alert("Student not found in this batch!");
      return;
    }

    if (scanCache[student.id]) {
      // already scanned
      return;
    }

    const newScanCache = { ...scanCache, [student.id]: "present" };
    const newRecentScans = [{ ...student, scanTime: new Date().toISOString() }, ...recentScans].slice(0, 50);

    setScanCache(newScanCache);
    setRecentScans(newRecentScans);
    persistToStorage(newScanCache, newRecentScans);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = e.currentTarget.value.trim();
      if (val) {
        processScan(val);
        setScanInput("");
      }
    }
  };

  const saveAttendance = async () => {
    const scannedIds = Object.keys(scanCache).map(id => parseInt(id));
    if (scannedIds.length === 0) {
      alert("No students scanned yet.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/attendance/qr-batch-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: batchId,
          date,
          student_ids: scannedIds
        })
      });

      if (res.ok) {
        alert("Attendance saved successfully!");
        localStorage.removeItem(storageKey);
        setScanCache({});
        setRecentScans([]);
      } else {
        alert("Failed to save attendance");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving attendance");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
      <input
        ref={scanInputRef}
        type="text"
        value={scanInput}
        onChange={(e) => setScanInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute -top-20 left-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Left Panel: Scanner Feed */}
      <Card className="w-full lg:w-1/3 flex flex-col overflow-hidden border-none shadow-md dark:shadow-none dark:bg-slate-900/50">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scan className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Live Scan Feed
            </CardTitle>
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold">
              {Object.keys(scanCache).length} / {students.length}
            </span>
          </div>
          <div className="mt-2">
            <Label>Session Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 mt-1 bg-white dark:bg-slate-950" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-y-auto max-h-[400px] lg:max-h-none">
          {recentScans.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-60 min-h-[300px]">
              <Scan className="w-12 h-12 mb-3" />
              <p>Ready to scan QR codes</p>
              <p className="text-xs">Scanner input is automatically focused</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-800">
              {recentScans.map((scan, i) => (
                <div key={i} className="p-3 flex items-center gap-3 bg-white dark:bg-slate-950 animate-in slide-in-from-left-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{scan.name}</div>
                    <div className="text-xs text-muted-foreground">{scan.student_id}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(scan.scanTime), "hh:mm a")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800">
          <Button onClick={saveAttendance} disabled={isSaving || Object.keys(scanCache).length === 0} className="w-full bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </Card>

      {/* Right Panel: Student List */}
      <Card className="w-full lg:w-2/3 overflow-hidden border-none shadow-md dark:shadow-none dark:bg-slate-900/50 flex flex-col">
        <CardHeader className="border-b dark:border-slate-800 py-4">
          <CardTitle className="text-lg">Student Roster</CardTitle>
          <CardDescription>Click 'Mark' if a student doesn't have their ID card.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-y-auto max-h-[600px] lg:max-h-none">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading roster...</div>
          ) : (
            <div className="divide-y dark:divide-slate-800">
              {students.map(student => {
                const isMarked = !!scanCache[student.id];
                return (
                  <div key={student.id} className={`p-3 flex items-center justify-between transition-colors ${isMarked ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.photo || ""} />
                        <AvatarFallback className="text-xs">{student.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.student_id}</div>
                      </div>
                    </div>
                    <div>
                      {isMarked ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Present</span>
                          <button onClick={() => {
                            const newCache = { ...scanCache };
                            delete newCache[student.id];
                            const newRecent = recentScans.filter(r => r.id !== student.id);
                            setScanCache(newCache);
                            setRecentScans(newRecent);
                            persistToStorage(newCache, newRecent);
                          }} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => processScan(student.student_id)} className="h-8">
                          Mark
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
