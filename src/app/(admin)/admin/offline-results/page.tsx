"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Settings, ClipboardList, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

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
  start_time: string | null;
  duration_minutes: number;
  total_marks: number;
  status: string;
  is_grading_enabled: boolean;
  batch?: Batch;
  course?: Course;
  created_at: string;
}

export default function OfflineResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");

  const [deleteExamId, setDeleteExamId] = useState<number | null>(null);
  const [deleteStep, setDeleteStep] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, crsRes, batRes] = await Promise.all([
        fetch("/api/admin/exams/offline"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches")
      ]);
      
      if (exRes.ok) setExams(await exRes.json());
      if (crsRes.ok) setCourses(await crsRes.json());
      if (batRes.ok) setBatches(await batRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteExamId) return;
    try {
      const res = await fetch(`/api/admin/exams/${deleteExamId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExams(exams.filter(e => e.id !== deleteExamId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteExamId(null);
      setDeleteStep(1);
    }
  };

  const filteredExams = exams.filter(exam => {
    if (selectedCourse !== "all" && exam.course?.id.toString() !== selectedCourse) return false;
    if (selectedBatch !== "all" && exam.batch?.id.toString() !== selectedBatch) return false;
    if (search && !exam.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offline Exam Results</h1>
          <p className="text-muted-foreground mt-1">Manage and publish offline exam results for students.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print to PDF
          </Button>
          <Link href="/admin/offline-results/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publish a Result
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Input
                placeholder="Search exams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedBatch("all");
                }}
              >
                <option value="all">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="all">All Batches</option>
                {batches.filter(b => selectedCourse === "all" || b.course.id.toString() === selectedCourse).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto print:overflow-visible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Course & Batch</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Date Held</TableHead>
                  <TableHead className="text-right print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading exams...
                    </TableCell>
                  </TableRow>
                ) : filteredExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No offline results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        {exam.title}
                        {exam.is_grading_enabled && <Badge variant="secondary" className="ml-2">Graded</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{exam.course?.title || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">{exam.batch?.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{exam.total_marks}</TableCell>
                      <TableCell>{exam.start_time ? new Date(exam.start_time).toLocaleString() : "Not specified"}</TableCell>
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/offline-results/${exam.id}/print`} target="_blank">
                            <Button variant="outline" size="sm" title="Print Results">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/offline-results/${exam.id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setDeleteExamId(exam.id);
                              setDeleteStep(1);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteExamId !== null} onOpenChange={(open) => !open && setDeleteExamId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Result?</DialogTitle>
            <DialogDescription>
              {deleteStep === 1 
                ? "Are you sure you want to delete this exam result? This will remove all student marks associated with it."
                : deleteStep === 2
                ? "This action is permanent and cannot be undone. All offline results for this exam will be lost. Click confirm to proceed."
                : "Final confirmation. Click Delete Result to permanently remove."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteExamId(null)}>Cancel</Button>
            {deleteStep === 1 && <Button variant="destructive" onClick={() => setDeleteStep(2)}>Yes, Delete</Button>}
            {deleteStep === 2 && <Button variant="destructive" onClick={() => setDeleteStep(3)}>Confirm</Button>}
            {deleteStep === 3 && <Button variant="destructive" onClick={handleDelete}>Delete Result</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
