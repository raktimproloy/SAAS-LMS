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

// Types
interface Segment {
  id: number;
  name: string;
}

interface Batch {
  id: number;
  name: string;
  year: string;
  segment: Segment;
}

interface Exam {
  id: number;
  title: string;
  type: string;
  is_public: boolean;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  status: string;
  batch?: Batch;
  segment?: Segment;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  const [segmentId, setSegmentId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exRes, segRes, batRes] = await Promise.all([
        fetch("/api/admin/exams"),
        fetch("/api/admin/segments"),
        fetch("/api/admin/batches")
      ]);
      
      if (exRes.ok) setExams(await exRes.json());
      if (segRes.ok) setSegments(await segRes.json());
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
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, type, is_public: isPublic, start_time: startTime, end_time: endTime,
          duration_minutes: durationMinutes, total_marks: totalMarks, negative_marking: negativeMarking,
          batch_id: batchId || null, segment_id: segmentId || null
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create exam");

      // Reset
      setTitle("");
      setType("online_mcq");
      setIsPublic(false);
      setStartTime("");
      setEndTime("");
      setDurationMinutes("");
      setTotalMarks("");
      setNegativeMarking("0");
      setBatchId("");
      setSegmentId("");
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* @ts-expect-error - Radix UI type mismatch for asChild */}
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Setup New Exam</DialogTitle>
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
                      <Label htmlFor="batch">Target Batch (Optional)</Label>
                      <select 
                        id="batch" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={batchId} 
                        onChange={(e) => setBatchId(e.target.value)} 
                      >
                        <option value="">Select Batch...</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.segment?.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="segment">Target Segment (Optional)</Label>
                      <select 
                        id="segment" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={segmentId} 
                        onChange={(e) => setSegmentId(e.target.value)} 
                      >
                        <option value="">Select Segment...</option>
                        {segments.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input id="start_time" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input id="end_time" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Minutes)</Label>
                  <Input id="duration" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input id="total_marks" type="number" step="0.5" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="negative">Negative Marking per Question</Label>
                  <Input id="negative" type="number" step="0.25" value={negativeMarking} onChange={(e) => setNegativeMarking(e.target.value)} />
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Exam"}
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
                      <TableHead>Target</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          {exam.is_public ? (
                            <Badge variant="secondary">Public</Badge>
                          ) : exam.batch ? (
                            <Badge variant="outline">{exam.batch.name}</Badge>
                          ) : exam.segment ? (
                            <Badge variant="outline">{exam.segment.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Global</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {exam.type === "online_mcq" ? "Online MCQ" : "Offline"}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="whitespace-nowrap">
                            {new Date(exam.start_time).toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">
                            {exam.duration_minutes} mins
                          </div>
                        </TableCell>
                        <TableCell>{exam.total_marks}</TableCell>
                        <TableCell>
                          <Badge variant={exam.status === "published" ? "default" : exam.status === "draft" ? "secondary" : "outline"}>
                            {exam.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/exams/${exam.id}/questions`}>
                            <Button variant="outline" size="sm" className="h-8">
                              <Settings className="h-4 w-4 mr-2" />
                              Setup
                            </Button>
                          </Link>
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
