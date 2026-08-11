"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { 
  Search, CheckCircle2, XCircle, Clock, AlertTriangle, 
  UserPlus, Scan, Save, LogOut, CheckSquare, XSquare, 
  CalendarClock, Download, Printer 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: number;
  title: string;
}

interface Batch {
  id: number;
  name: string;
  course_id: number;
  class_days?: string[];
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  photo: string | null;
  attendance?: { id: number; status: string } | null;
}

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/courses").then(res => res.json()).then(setCourses);
    fetch("/api/admin/batches").then(res => res.json()).then(setBatches);
  }, []);

  const filteredBatches = batches.filter(b => b.course_id.toString() === selectedCourse);

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Attendance Management</h1>
        <p className="text-muted-foreground">Scan QR cards, manage daily attendance, and view monthly reports.</p>
      </div>

      <Card className="border-none shadow-md print:hidden">
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

      {selectedBatch && (
        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-3 print:hidden mb-4">
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <ScannerTab batchId={selectedBatch} date={date} setDate={setDate} />
          </TabsContent>

          <TabsContent value="daily">
            <DailyTab batchId={selectedBatch} date={date} setDate={setDate} batches={batches} />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyTab batchId={selectedBatch} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SCANNER TAB
// -------------------------------------------------------------
function ScannerTab({ batchId, date, setDate }: { batchId: string, date: string, setDate: (d: string) => void }) {
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
    <div className="flex gap-4 min-h-[500px]">
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
      <Card className="w-1/3 flex flex-col overflow-hidden border-none shadow-md">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scan className="w-5 h-5 text-emerald-600" /> Live Scan Feed
            </CardTitle>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {Object.keys(scanCache).length} / {students.length}
            </span>
          </div>
          <div className="mt-2">
            <Label>Session Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 mt-1" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-y-auto">
          {recentScans.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-60">
              <Scan className="w-12 h-12 mb-3" />
              <p>Ready to scan QR codes</p>
              <p className="text-xs">Scanner input is automatically focused</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentScans.map((scan, i) => (
                <div key={i} className="p-3 flex items-center gap-3 bg-white animate-in slide-in-from-left-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
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
        <div className="p-4 bg-slate-50 border-t">
          <Button onClick={saveAttendance} disabled={isSaving || Object.keys(scanCache).length === 0} className="w-full bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </Card>

      {/* Right Panel: Student List */}
      <Card className="flex-1 overflow-hidden border-none shadow-md flex flex-col">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-lg">Student Roster</CardTitle>
          <CardDescription>Click 'Mark' if a student doesn't have their ID card.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading roster...</div>
          ) : (
            <div className="divide-y">
              {students.map(student => {
                const isMarked = !!scanCache[student.id];
                return (
                  <div key={student.id} className={`p-3 flex items-center justify-between ${isMarked ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
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
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Present</span>
                          <button onClick={() => {
                            const newCache = { ...scanCache };
                            delete newCache[student.id];
                            const newRecent = recentScans.filter(r => r.id !== student.id);
                            setScanCache(newCache);
                            setRecentScans(newRecent);
                            persistToStorage(newCache, newRecent);
                          }} className="ml-2 text-slate-400 hover:text-red-500">
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

// -------------------------------------------------------------
// DAILY TAB (Existing UI)
// -------------------------------------------------------------
function DailyTab({ batchId, date, setDate, batches }: { batchId: string, date: string, setDate: (d: string) => void, batches: Batch[] }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Student | null>(null);

  useEffect(() => {
    fetchAttendance();
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
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) return { ...s, attendance: { id: s.attendance?.id || 0, status } };
        return s;
      }));
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, batch_id: parseInt(batchId), date, status })
      });
    } catch (err) {
      console.error(err);
      fetchAttendance();
    }
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  };

  const selectedBatchData = batches.find(b => b.id.toString() === batchId);
  const isClassDay = selectedBatchData?.class_days?.includes(getDayName(date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <CardTitle>Daily Roster</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[150px] h-8" />
                <p className="text-sm text-muted-foreground">
                  {isClassDay && <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium border border-emerald-200">Regular Class Day</span>}
                  {!isClassDay && <span className="inline-flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium border border-amber-200">Not a Regular Class Day</span>}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading roster...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No students found.</div>
            ) : (
              <div className="divide-y">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.photo || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.student_id}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={student.attendance?.status === "present" ? "default" : "outline"} className={student.attendance?.status === "present" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "hover:text-emerald-600 hover:border-emerald-200"} onClick={() => markAttendance(student.id, "present")}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Present
                      </Button>
                      <Button size="sm" variant={student.attendance?.status === "late" ? "default" : "outline"} className={student.attendance?.status === "late" ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:text-amber-600 hover:border-amber-200"} onClick={() => markAttendance(student.id, "late")}>
                        <Clock className="w-4 h-4 mr-1" /> Late
                      </Button>
                      <Button size="sm" variant={student.attendance?.status === "absent" ? "default" : "outline"} className={student.attendance?.status === "absent" ? "bg-red-500 hover:bg-red-600 text-white" : "hover:text-red-600 hover:border-red-200"} onClick={() => markAttendance(student.id, "absent")}>
                        <XCircle className="w-4 h-4 mr-1" /> Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-md bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" /> Makeup Class
            </CardTitle>
            <p className="text-xs text-blue-700/70">Add a student from another batch to today's class.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search ID or Name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    fetch(`/api/admin/students/search?q=${searchQuery}`).then(res => res.json()).then(data => {
                      if (data.length > 0) setSearchResult(data[0]);
                      else alert("Not found");
                    });
                  }
                }}
                className="bg-white"
              />
            </div>
            {searchResult && (
              <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm space-y-3">
                <div className="font-semibold text-sm">{searchResult.name}</div>
                <Button onClick={() => {
                  markAttendance(searchResult.id, "present");
                  setSearchResult(null);
                  setSearchQuery("");
                }} className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                  Mark Present
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MONTHLY TAB
// -------------------------------------------------------------
function MonthlyTab({ batchId }: { batchId: string }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const [report, setReport] = useState<{ students: any[], records: Record<number, Record<number, string>>, daysInMonth: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [batchId, month, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance/monthly?batch_id=${batchId}&month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-md overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .monthly-print, .monthly-print * { visibility: visible; }
          .monthly-print { position: absolute; left: 0; top: 0; width: 100%; }
          .print-controls { display: none !important; }
        }
      `}} />
      <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between print-controls">
        <div className="flex gap-4">
          <div className="grid gap-1">
            <Label className="text-xs">Month</Label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="h-8 rounded-md border text-sm px-2 bg-white">
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs">Year</Label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="h-8 rounded-md border text-sm px-2 bg-white">
              {[currentYear-1, currentYear, currentYear+1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="bg-white">
          <Printer className="w-4 h-4 mr-2" /> Print Report
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 overflow-x-auto monthly-print">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading report...</div>
        ) : report && report.students.length > 0 ? (
          <div className="min-w-[800px]">
            <div className="p-4 bg-white font-bold text-lg hidden print:block text-center border-b">
              Monthly Attendance Report - {new Date(parseInt(year), parseInt(month)-1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="p-3 text-left font-semibold sticky left-0 bg-slate-100 z-10 w-[200px] border-r">Student Name</th>
                  {[...Array(report.daysInMonth)].map((_, i) => (
                    <th key={i} className="p-2 text-center text-xs text-muted-foreground min-w-[30px] border-r">{i + 1}</th>
                  ))}
                  <th className="p-3 text-center font-semibold w-[80px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map(student => {
                  let presentCount = 0;
                  return (
                    <tr key={student.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="truncate w-[180px]" title={student.name}>{student.name}</div>
                        <div className="text-[10px] text-muted-foreground">{student.student_id}</div>
                      </td>
                      {[...Array(report.daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const status = report.records[student.id]?.[day];
                        let content = <span className="text-slate-300">-</span>;
                        if (status === "present") {
                          content = <span className="text-emerald-600 font-bold">P</span>;
                          presentCount++;
                        } else if (status === "absent") {
                          content = <span className="text-red-500 font-bold">A</span>;
                        } else if (status === "late") {
                          content = <span className="text-amber-500 font-bold">L</span>;
                          presentCount++; // usually late counts as present for total
                        }
                        return (
                          <td key={i} className="p-2 text-center border-r bg-white">
                            {content}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {presentCount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">No data found for this month.</div>
        )}
      </CardContent>
    </Card>
  );
}
