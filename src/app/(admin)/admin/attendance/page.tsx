"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, XCircle, Clock, UserPlus, Printer,
  CalendarDays, FileBarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
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
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      
      {/* Header & Tabs Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Attendance Management</h1>
          <p className="text-muted-foreground">Manage daily attendance and view monthly reports.</p>
        </div>
        
        {/* Custom Tab Switcher */}
        {selectedBatch && (
          <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-sm w-full md:w-auto print:hidden">
            <button
              onClick={() => setActiveTab("daily")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === "daily" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Daily View
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === "monthly" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileBarChart2 className="w-4 h-4" />
              Monthly Report
            </button>
          </div>
        )}
      </div>

      <Card className="border-none shadow-md print:hidden bg-slate-50/50 dark:bg-slate-900/50">
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

      {/* Main Content Area */}
      {selectedBatch && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          {activeTab === "daily" && (
            <DailyTab batchId={selectedBatch} date={date} setDate={setDate} batches={batches} />
          )}

          {activeTab === "monthly" && (
            <MonthlyTab batchId={selectedBatch} />
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// DAILY TAB (Redesigned UI)
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
        <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900/50 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div>
              <CardTitle className="text-xl">Daily Roster</CardTitle>
              <div className="flex items-center gap-4 mt-3">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[150px] h-9" />
                <p className="text-sm text-muted-foreground">
                  {isClassDay && <span className="inline-flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-200 dark:border-emerald-900">Regular Class Day</span>}
                  {!isClassDay && <span className="inline-flex items-center text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md text-xs font-semibold border border-amber-200 dark:border-amber-900">Not a Regular Class Day</span>}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto bg-white dark:bg-slate-950">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                Loading roster...
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-slate-50/50 dark:bg-slate-900/50 border-t">No students found for this batch.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={student.photo || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {student.name.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{student.name}</div>
                        <div className="text-xs text-muted-foreground font-medium">{student.student_id}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={student.attendance?.status === "present" ? "default" : "outline"} 
                        className={student.attendance?.status === "present" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"} 
                        onClick={() => markAttendance(student.id, "present")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Present
                      </Button>
                      <Button 
                        size="sm" 
                        variant={student.attendance?.status === "late" ? "default" : "outline"} 
                        className={student.attendance?.status === "late" ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm" : "hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30"} 
                        onClick={() => markAttendance(student.id, "late")}
                      >
                        <Clock className="w-4 h-4 mr-1.5" /> Late
                      </Button>
                      <Button 
                        size="sm" 
                        variant={student.attendance?.status === "absent" ? "default" : "outline"} 
                        className={student.attendance?.status === "absent" ? "bg-red-500 hover:bg-red-600 text-white shadow-sm" : "hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"} 
                        onClick={() => markAttendance(student.id, "absent")}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" /> Absent
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
        <Card className="border-none shadow-xl shadow-blue-900/5 bg-gradient-to-b from-blue-50/80 to-blue-50/30 dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-900 dark:text-blue-400 flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                <UserPlus className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              Makeup Class Entry
            </CardTitle>
            <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mt-1">Add a student from another batch to today's class session.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search ID or Name (Press Enter)..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    fetch(`/api/admin/students/search?q=${searchQuery}`).then(res => res.json()).then(data => {
                      if (data.length > 0) setSearchResult(data[0]);
                      else alert("No student found with that ID or name");
                    });
                  }
                }}
                className="bg-white dark:bg-slate-900 shadow-sm border-blue-200 dark:border-blue-900"
              />
            </div>
            {searchResult && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900 shadow-sm space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={searchResult.photo || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {searchResult.name.substring(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{searchResult.name}</div>
                    <div className="text-xs text-muted-foreground">{searchResult.student_id}</div>
                  </div>
                </div>
                <Button onClick={() => {
                  markAttendance(searchResult.id, "present");
                  setSearchResult(null);
                  setSearchQuery("");
                }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Present for Today
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
// MONTHLY TAB (Redesigned UI)
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
    <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900/50 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { display: none !important; }
          .monthly-print, .monthly-print * { display: block !important; }
          .monthly-print { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100vw !important; 
            background: white !important;
            padding: 20px !important;
          }
          
          /* Table print fixes */
          .monthly-print table { border-collapse: collapse !important; width: 100% !important; }
          .monthly-print th, .monthly-print td { border: 1px solid #ccc !important; padding: 4px !important; }
          .monthly-print th.sticky, .monthly-print td.sticky { position: static !important; box-shadow: none !important; }
          
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: landscape; margin: 10mm; }
        }
      `}} />
      <CardHeader className="border-b bg-white dark:bg-slate-950 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
           <CardTitle className="text-xl">Monthly Overview</CardTitle>
           <CardDescription className="mt-1">Detailed attendance grid for the selected month.</CardDescription>
        </div>
        <div className="flex flex-wrap items-end gap-3 print:hidden">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Month</Label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 w-32 rounded-md border text-sm px-3 bg-white shadow-sm hover:border-slate-400 focus:border-primary transition-colors cursor-pointer outline-none">
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Year</Label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-24 rounded-md border text-sm px-3 bg-white shadow-sm hover:border-slate-400 focus:border-primary transition-colors cursor-pointer outline-none">
              {[currentYear-1, currentYear, currentYear+1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <Button onClick={() => window.print()} variant="outline" className="bg-white shadow-sm hover:bg-slate-50 border-slate-200">
            <Printer className="w-4 h-4 mr-2 text-slate-600" /> Print
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-x-auto bg-white dark:bg-slate-950">
        <div className="monthly-print hidden print:block">
          {report && (
            <div className="w-full">
              <div className="font-bold text-2xl text-center mb-6">
                Monthly Attendance Report - {new Date(parseInt(year), parseInt(month)-1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 text-left w-[200px]">Student Name</th>
                    {[...Array(report.daysInMonth)].map((_, i) => (
                      <th key={i} className="p-1 text-center w-[15px]">{i + 1}</th>
                    ))}
                    <th className="p-2 text-center w-[50px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.students.map(student => {
                    let presentCount = 0;
                    return (
                      <tr key={student.id} className="border-b">
                        <td className="p-2 font-medium">
                          <div className="truncate">{student.name}</div>
                          <div className="text-[9px] text-muted-foreground">{student.student_id}</div>
                        </td>
                        {[...Array(report.daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const status = report.records[student.id]?.[day];
                          let content = "-";
                          if (status === "present" || status === "late") {
                            content = "P";
                            presentCount++;
                          } else if (status === "absent") {
                            content = "A";
                          }
                          return (
                            <td key={i} className={`p-1 text-center font-bold ${content === 'P' ? 'text-green-700 bg-green-50' : content === 'A' ? 'text-red-600 bg-red-50' : 'text-slate-300'}`}>
                              {content}
                            </td>
                          );
                        })}
                        <td className="p-2 text-center font-bold bg-slate-50">{presentCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* UI Table (not printed) */}
        <div className="print:hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
               <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               Loading report...
            </div>
          ) : report && report.students.length > 0 ? (
            <div className="min-w-[800px]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 text-left font-semibold sticky left-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur z-10 w-[220px] border-r border-slate-200 dark:border-slate-800">Student Info</th>
                    {[...Array(report.daysInMonth)].map((_, i) => (
                      <th key={i} className="p-2 text-center text-xs font-semibold text-slate-500 border-r border-slate-200 dark:border-slate-800 min-w-[32px]">{i + 1}</th>
                    ))}
                    <th className="p-4 text-center font-semibold w-[90px] text-slate-700 dark:text-slate-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.students.map(student => {
                    let presentCount = 0;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-medium sticky left-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur z-10 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photo || ""} />
                              <AvatarFallback className="bg-slate-100 text-xs text-slate-600">{student.name.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="truncate w-[140px] text-sm font-semibold" title={student.name}>{student.name}</div>
                              <div className="text-[11px] text-muted-foreground">{student.student_id}</div>
                            </div>
                          </div>
                        </td>
                        {[...Array(report.daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const status = report.records[student.id]?.[day];
                          let content = <span className="text-slate-200 dark:text-slate-800 font-bold">-</span>;
                          let bg = "";
                          if (status === "present") {
                            content = <span className="text-emerald-600 font-bold">P</span>;
                            bg = "bg-emerald-50/30 dark:bg-emerald-950/20";
                            presentCount++;
                          } else if (status === "absent") {
                            content = <span className="text-red-500 font-bold">A</span>;
                            bg = "bg-red-50/30 dark:bg-red-950/20";
                          } else if (status === "late") {
                            content = <span className="text-amber-500 font-bold">L</span>;
                            bg = "bg-amber-50/30 dark:bg-amber-950/20";
                            presentCount++; // usually late counts as present for total
                          }
                          return (
                            <td key={i} className={`p-2 text-center border-r border-slate-100 dark:border-slate-800 ${bg}`}>
                              {content}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 text-base">
                          {presentCount}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-muted-foreground bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100">
              No attendance records found for {new Date(parseInt(year), parseInt(month)-1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
