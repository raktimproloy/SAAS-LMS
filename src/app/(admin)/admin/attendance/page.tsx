"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, UserPlus, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Student | null>(null);

  // Fetch initial courses and batches
  useEffect(() => {
    fetch("/api/admin/courses").then(res => res.json()).then(setCourses);
    fetch("/api/admin/batches").then(res => res.json()).then(setBatches);
  }, []);

  // Fetch students and attendance when batch or date changes
  useEffect(() => {
    if (!selectedBatch || !date) {
      setStudents([]);
      return;
    }
    
    fetchAttendance();
  }, [selectedBatch, date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?batch_id=${selectedBatch}&date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: number, status: string) => {
    try {
      // Optimistic update
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return { ...s, attendance: { id: s.attendance?.id || 0, status } };
        }
        return s;
      }));

      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          batch_id: parseInt(selectedBatch),
          date,
          status
        })
      });
      
      if (!res.ok) {
        // Revert on failure (simplified)
        fetchAttendance();
      }
    } catch (err) {
      console.error(err);
      fetchAttendance();
    }
  };

  const autoMarkAbsent = async () => {
    if (!confirm("Are you sure you want to mark all unmarked students as Absent for this date?")) return;
    
    try {
      const res = await fetch("/api/admin/attendance/bulk-absent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: parseInt(selectedBatch),
          date
        })
      });
      
      if (res.ok) {
        fetchAttendance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchCrossBatch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`/api/admin/students/search?q=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setSearchResult(data[0]); // Just taking the first match for simplicity
        } else {
          alert("No student found");
          setSearchResult(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addCrossBatchStudent = async () => {
    if (!searchResult) return;
    
    // Check if already in list
    if (students.find(s => s.id === searchResult.id)) {
      alert("Student is already in the list");
      return;
    }

    await markAttendance(searchResult.id, "present");
    setSearchResult(null);
    setSearchQuery("");
    fetchAttendance();
  };

  const filteredBatches = batches.filter(b => b.course_id.toString() === selectedCourse);

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  };

  const selectedBatchData = batches.find(b => b.id.toString() === selectedBatch);
  const isClassDay = selectedBatchData?.class_days?.includes(getDayName(date));

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Attendance Management</h1>
        <p className="text-muted-foreground">Record and manage daily student attendance.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="date">Select Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Attendance List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle>Class Roster</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    {isClassDay && <span className="ml-2 inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium border border-emerald-200">Regular Class Day</span>}
                    {!isClassDay && <span className="ml-2 inline-flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium border border-amber-200">Not a Regular Class Day</span>}
                  </p>
                </div>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={autoMarkAbsent}>
                  Auto-Mark Absent
                </Button>
              </CardHeader>
              <CardContent className="p-0">
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
                          <Button 
                            size="sm" 
                            variant={student.attendance?.status === "present" ? "default" : "outline"}
                            className={student.attendance?.status === "present" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "hover:text-emerald-600 hover:border-emerald-200"}
                            onClick={() => markAttendance(student.id, "present")}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Present
                          </Button>
                          <Button 
                            size="sm" 
                            variant={student.attendance?.status === "late" ? "default" : "outline"}
                            className={student.attendance?.status === "late" ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:text-amber-600 hover:border-amber-200"}
                            onClick={() => markAttendance(student.id, "late")}
                          >
                            <Clock className="w-4 h-4 mr-1" /> Late
                          </Button>
                          <Button 
                            size="sm" 
                            variant={student.attendance?.status === "absent" ? "default" : "outline"}
                            className={student.attendance?.status === "absent" ? "bg-red-500 hover:bg-red-600 text-white" : "hover:text-red-600 hover:border-red-200"}
                            onClick={() => markAttendance(student.id, "absent")}
                          >
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

          {/* Cross-Batch Add Section */}
          <div className="space-y-6">
            <Card className="border-none shadow-md bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" /> Makeup Class (Cross-Batch)
                </CardTitle>
                <p className="text-xs text-blue-700/70">Add a student from another batch to today&apos;s class.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search ID or Name..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchCrossBatch()}
                    className="bg-white"
                  />
                  <Button onClick={handleSearchCrossBatch} size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {searchResult && (
                  <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {searchResult.name.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{searchResult.name}</div>
                        <div className="text-xs text-muted-foreground">{searchResult.student_id}</div>
                      </div>
                    </div>
                    <Button onClick={addCrossBatchStudent} className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                      Mark Present in {selectedBatchData?.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}
