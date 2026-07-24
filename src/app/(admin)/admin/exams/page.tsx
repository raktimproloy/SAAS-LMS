"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Course {
  id: number;
  title: string;
}

interface Batch {
  id: number;
  name: string;
  course: Course;
}

interface Exam {
  id: number;
  title: string;
  type: string;
  is_public: boolean;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  total_marks: number;
  status: string;
  batch?: Batch;
  course?: Course;
  _count?: {
    questions: number;
  };
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState("online_mcq");
  const [isPublic, setIsPublic] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [negativeMarking, setNegativeMarking] = useState("0");
  const [batchId, setBatchId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("active");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, crsRes, batRes] = await Promise.all([
        fetch("/api/admin/exams"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches")
      ]);
      
      if (exRes.ok) setExams(await exRes.json());
      if (crsRes.ok) setCourses(await crsRes.json());
      if (batRes.ok) setBatches(await batRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = editingExamId ? `/api/admin/exams/${editingExamId}` : "/api/admin/exams";
      const method = editingExamId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, type, is_public: isPublic, start_time: startTime || null, end_time: endTime || null,
          duration_minutes: durationMinutes, total_marks: totalMarks, negative_marking: negativeMarking,
          batch_id: batchId || null, course_id: courseId || null, status
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${editingExamId ? "update" : "create"} exam`);

      resetForm();
      setIsDialogOpen(false);
      
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setType("online_mcq");
    setIsPublic(false);
    setStartTime("");
    setEndTime("");
    setDurationMinutes("");
    setTotalMarks("");
    setNegativeMarking("0");
    setBatchId("");
    setCourseId("");
    setStatus("inactive");
    setEditingExamId(null);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setType(exam.type);
    setIsPublic(exam.is_public);
    setStartTime(exam.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : "");
    setEndTime(exam.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : "");
    setDurationMinutes(exam.duration_minutes.toString());
    setTotalMarks(exam.total_marks.toString());
    // @ts-expect-error - negative_marking might not be defined on Exam interface
    setNegativeMarking(exam.negative_marking?.toString() || "0");
    setBatchId(exam.batch?.id.toString() || "");
    setCourseId(exam.course?.id.toString() || (exam.batch?.course?.id?.toString() || ""));
    setStatus(exam.status);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this exam? All questions will be deleted. (Cannot be undone if no results exist)")) return;
    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to delete exam");
      else fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete exam");
    }
  };

  const handleToggleStatus = async (exam: Exam) => {
    const newStatus = exam.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
      else alert("Failed to change status");
    } catch (err) {
      console.error(err);
      alert("Failed to change status");
    }
  };

  const renderPagination = () => (
    <div className="mt-4 flex w-full items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing 1 to 10 entries
      </div>
      <Pagination className="w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam System</h1>
          <p className="text-muted-foreground mt-1">Manage online MCQs and offline exam results.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          {/* @ts-expect-error - Radix UI type mismatch for asChild */}
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExamId ? "Edit Exam" : "Setup New Exam"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                  {formError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Exam Type</Label>
                  <select 
                    id="type" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    required
                  >
                    <option value="online_mcq">Online MCQ</option>
                    <option value="offline">Offline Written</option>
                  </select>
                </div>
                
                <div className="space-y-2 flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input 
                      type="checkbox" 
                      className="rounded border-input h-4 w-4 text-primary"
                      checked={isPublic} 
                      onChange={(e) => setIsPublic(e.target.checked)} 
                    />
                    Make this a Public Exam (Open for all)
                  </label>
                </div>

                {!isPublic && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="course">Target Course</Label>
                      <select 
                        id="course" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={courseId} 
                        onChange={(e) => {
                          setCourseId(e.target.value);
                          setBatchId("");
                        }}
                        required={!isPublic}
                      >
                        <option value="">Select Course...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch">Target Batch (Optional)</Label>
                      <select 
                        id="batch" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={batchId} 
                        onChange={(e) => setBatchId(e.target.value)}
                        disabled={!courseId}
                      >
                        <option value="">Select Batch...</option>
                        {batches.filter(b => b.course?.id?.toString() === courseId).map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time (Optional)</Label>
                  <Input id="start_time" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time (Optional)</Label>
                  <Input id="end_time" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Minutes)</Label>
                  <Input id="duration" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_marks">Default Marks / Question</Label>
                  <Input id="total_marks" type="number" step="0.5" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="negative">Negative Marking per Question</Label>
                  <Input id="negative" type="number" step="0.25" value={negativeMarking} onChange={(e) => setNegativeMarking(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingExamId ? "Update Exam" : "Create Exam"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Target (Course/Batch)</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Schedule & Duration</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right min-w-[200px]">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {exam.is_public ? (
                              <Badge variant="secondary" className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20">Public Exam</Badge>
                            ) : exam.batch ? (
                              <>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20 transition-colors">
                                  Course: {exam.batch.course?.title || exam.course?.title}
                                </Badge>
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 border-purple-500/20 transition-colors">
                                  Batch: {exam.batch.name}
                                </Badge>
                              </>
                            ) : exam.course ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20 transition-colors">
                                Course: {exam.course.title}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Global</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {exam.type === "online_mcq" ? "Online MCQ" : "Offline"}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="whitespace-nowrap">
                            {exam.start_time ? new Date(exam.start_time).toLocaleString() : "Always On"}
                          </div>
                          {exam.end_time && (
                            <div className="whitespace-nowrap text-muted-foreground text-xs">
                              End: {new Date(exam.end_time).toLocaleString()}
                            </div>
                          )}
                          <div className="font-medium text-primary mt-1">
                            {exam.duration_minutes} mins
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div><strong>{exam.total_marks}</strong> Default Marks/Q</div>
                          <div className="text-muted-foreground"><strong>{exam._count?.questions || 0}</strong> Questions</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`cursor-pointer transition-colors shadow-sm ${
                              exam.status === "active" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400" 
                                : "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20 dark:text-slate-400"
                            }`}
                            onClick={() => handleToggleStatus(exam)}
                          >
                            {exam.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/exams/${exam.id}/questions`}>
                              <Button variant="outline" size="sm" className="h-8">
                                <Settings className="h-4 w-4 mr-2" />
                                Setup
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEdit(exam)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(exam.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {exams.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No exams created yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {exams.length > 0 && renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
