"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
  exam_results: StudentResult[];
}

export default function EditOfflineResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Exam Details
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [title, setTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [startTime, setStartTime] = useState("");
  const [isGradingEnabled, setIsGradingEnabled] = useState(false);
  const [examId, setExamId] = useState<number | null>(isNew ? null : parseInt(params.id));

  // Search & Students
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [marksInput, setMarksInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [params.id]);

  useEffect(() => {
    if (examId && batchId) {
      fetchStudents();
    }
  }, [examId, batchId]);

  const fetchInitialData = async () => {
    try {
      const [crsRes, batRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches")
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
        setStudents(await res.json());
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
      status: "active"
    };

    try {
      const url = isNew ? "/api/admin/exams" : `/api/admin/exams/${examId}`;
      const method = isNew ? "POST" : "PUT";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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

  const handleSaveResult = async () => {
    if (!selectedStudent || !examId) return;
    const marks = parseFloat(marksInput);
    if (isNaN(marks)) {
      alert("Invalid marks");
      return;
    }

    const grade = calculateGrade(marks, parseFloat(totalMarks));

    try {
      const res = await fetch(`/api/admin/exams/offline/${examId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          obtained_marks: marks,
          grade,
          comment: commentInput
        })
      });

      if (res.ok) {
        await fetchStudents();
        setSelectedStudent(null);
      } else {
        alert("Failed to save result");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.student_id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const gradedStudents = filteredStudents.filter(s => s.exam_results.length > 0).sort((a, b) => b.exam_results[0].obtained_marks - a.exam_results[0].obtained_marks);
  const ungradedStudents = filteredStudents.filter(s => s.exam_results.length === 0).sort((a, b) => a.student_id.localeCompare(b.student_id));

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/offline-results")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isNew ? "Publish Offline Result" : "Edit Offline Result"}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>Setup the exam information before entering results.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Course</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setBatchId("");
                }}
              >
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Batch</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
              >
                <option value="">Select Batch</option>
                {batches.filter(b => b.course.id.toString() === courseId).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Exam Name</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Physics" />
            </div>

            <div className="space-y-2">
              <Label>Total Marks</Label>
              <Input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Duration (Minutes)</Label>
              <Input type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Date Held</Label>
              <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>

            <div className="space-y-2 flex flex-col justify-center">
              <Label className="mb-2">Show Grading System</Label>
              <div className="flex items-center gap-2">
                <Checkbox id="grading" checked={isGradingEnabled} onCheckedChange={(checked) => setIsGradingEnabled(checked === true)} />
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
      </Card>

      {!isNew && (
        <Card>
          <CardHeader>
            <CardTitle>Student Results</CardTitle>
            <CardDescription>
              {gradedStudents.length} out of {students.length} students have been graded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by ID or Name..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="space-y-6">
              {/* Graded Students */}
              <div className="space-y-3">
                <h3 className="font-semibold text-green-600">Graded Students ({gradedStudents.length})</h3>
                <div className="flex flex-col gap-3">
                  {gradedStudents.map(student => (
                    <div 
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setMarksInput(student.exam_results[0].obtained_marks.toString());
                        setCommentInput(student.exam_results[0].comment || "");
                      }}
                      className="group flex items-center justify-between border-l-4 border-l-green-500 border border-green-100 dark:border-green-900/30 hover:border-green-300 dark:hover:border-green-800 bg-green-50/30 dark:bg-green-900/10 p-3 lg:p-4 rounded-md cursor-pointer transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-base group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{student.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">ID: {student.student_id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        {isGradingEnabled && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-0.5 h-auto shadow-sm">
                            {student.exam_results[0].grade || calculateGrade(student.exam_results[0].obtained_marks, parseFloat(totalMarks))}
                          </Badge>
                        )}
                        <div className="flex flex-col items-end">
                           <span className="text-xs text-muted-foreground mb-0.5">Marks</span>
                           <span className="font-bold text-green-700 dark:text-green-400 text-base lg:text-lg leading-none">
                             {student.exam_results[0].obtained_marks} 
                             <span className="text-xs font-normal text-muted-foreground ml-1">/ {totalMarks}</span>
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ungraded Students */}
              <div className="space-y-3">
                <h3 className="font-semibold text-muted-foreground">Pending / Absent Students ({ungradedStudents.length})</h3>
                <p className="text-sm text-muted-foreground">Students in this list are treated as absent/0 marks by default.</p>
                <div className="flex flex-col gap-3">
                  {ungradedStudents.map(student => (
                    <div 
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setMarksInput("");
                        setCommentInput("");
                      }}
                      className="flex items-center justify-between border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-800/30 p-3 lg:p-4 rounded-md cursor-pointer transition-all opacity-80 hover:opacity-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-base text-gray-700 dark:text-gray-300">{student.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">ID: {student.student_id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-gray-500 border-gray-300 dark:border-gray-600">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grading Dialog */}
      <Dialog open={selectedStudent !== null} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Result</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} ({selectedStudent?.student_id})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Marks Obtained (out of {totalMarks})</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={marksInput} 
                onChange={e => setMarksInput(e.target.value)} 
                placeholder="e.g. 85.5"
                autoFocus
              />
            </div>
            
            {isGradingEnabled && marksInput && !isNaN(parseFloat(marksInput)) && (
              <div className="p-3 bg-secondary rounded-lg flex items-center justify-between">
                <span className="font-medium">Calculated Grade:</span>
                <Badge variant="default" className="text-lg px-3">{calculateGrade(parseFloat(marksInput), parseFloat(totalMarks))}</Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label>Teacher Comment (Optional)</Label>
              <Input 
                value={commentInput} 
                onChange={e => setCommentInput(e.target.value)} 
                placeholder="Great progress..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Cancel</Button>
            <Button onClick={handleSaveResult}>Save Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
