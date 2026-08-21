"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, BookOpen, Layers, Trash2, CheckCircle, XCircle, MessageSquare, MoreHorizontal, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { formatTimeBengali, translateDayToBengali } from "@/lib/bengali";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { SmsModal } from "@/components/admin/SmsModal";

// Types
interface Course {
  id: number;
  title: string;
  fee: number | null;
  discount_fee: number | null;
  start_date: string | null;
  end_date: string | null;
  details: string | null;
  thumbnail: string | null;
  status: string;
}

interface Batch {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  max_students: number | null;
  class_days?: string[];
  course: Course;
  status: string;
}

export default function CoursesBatchesPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "batches">("courses");
  
  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // SMS Modal States
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsTargetType, setSmsTargetType] = useState<"course" | "batch" | "student">("course");
  const [smsTargetId, setSmsTargetId] = useState<number | undefined>(undefined);
  const [smsTargetName, setSmsTargetName] = useState<string>("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleDragEndCourses = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(courses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCourses(items);

    try {
      await fetch('/api/admin/courses/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: items.map(i => i.id) })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const groupedBatches = useMemo(() => {
    const groups: Record<number, { course: Course, batches: Batch[] }> = {};
    courses.forEach(c => { groups[c.id] = { course: c, batches: [] }; });
    batches.forEach(b => {
      if (groups[b.course.id]) {
        groups[b.course.id].batches.push(b);
      } else {
        groups[b.course.id] = { course: b.course, batches: [b] };
      }
    });
    return Object.values(groups).filter(g => g.batches.length > 0);
  }, [courses, batches]);

  const handleDragEndBatches = async (result: DropResult, courseId: number) => {
    if (!result.destination) return;
    const group = groupedBatches.find(g => g.course.id === courseId);
    if (!group) return;
    const items = Array.from(group.batches);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const finalBatches = batches.filter(b => b.course.id !== courseId).concat(items);
    setBatches(finalBatches);

    try {
      await fetch('/api/admin/batches/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: items.map(i => i.id) })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Common Form Fields
  const [title, setTitle] = useState("");
  
  // Course specific
  const [fee, setFee] = useState("");
  const [discountFee, setDiscountFee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [details, setDetails] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  
  // Shared
  const [courseId, setCourseId] = useState("");

  // Batch specific
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [classDays, setClassDays] = useState<string[]>([]);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [couRes, batRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches")
      ]);
      
      if (couRes.ok) setCourses(await couRes.json());
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");
      setThumbnail(data.url);
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setFee("");
    setDiscountFee("");
    setStartDate("");
    setEndDate("");
    setDetails("");
    setThumbnail("");
    setCourseId("");
    setStartTime("");
    setEndTime("");
    setMaxStudents("");
    setClassDays([]);
    setEditMode(false);
    setEditId(null);
    setFormError("");
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    resetForm();
    setEditMode(true);
    setEditId(course.id);
    setTitle(course.title);
    setFee(course.fee ? course.fee.toString() : "");
    setDiscountFee(course.discount_fee ? course.discount_fee.toString() : "");
    setStartDate(course.start_date ? course.start_date.split('T')[0] : "");
    setEndDate(course.end_date ? course.end_date.split('T')[0] : "");
    setDetails(course.details || "");
    setThumbnail(course.thumbnail || "");
    setIsDialogOpen(true);
  };

  const handleEditBatch = (batch: Batch) => {
    resetForm();
    setEditMode(true);
    setEditId(batch.id);
    setTitle(batch.name);
    setCourseId(batch.course.id.toString());
    setStartTime(batch.start_time || "");
    setEndTime(batch.end_time || "");
    setMaxStudents(batch.max_students ? batch.max_students.toString() : "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setClassDays(batch.class_days ? (batch.class_days as any) : []);
    setIsDialogOpen(true);
  };

  // Form Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    let endpoint = "";
    let payload = {};
    const method = editMode ? "PUT" : "POST";

    if (activeTab === "courses") {
      endpoint = editMode ? `/api/admin/courses/${editId}` : "/api/admin/courses";
      payload = { title, fee, discount_fee: discountFee, start_date: startDate, end_date: endDate, details, thumbnail };
    } else if (activeTab === "batches") {
      endpoint = editMode ? `/api/admin/batches/${editId}` : "/api/admin/batches";
      payload = { name: title, course_id: courseId, start_time: startTime, end_time: endTime, max_students: maxStudents, class_days: classDays };
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setIsDialogOpen(false);
      resetForm();
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

  const handleDelete = async (id: number, type: "courses" | "batches") => {
    if (!confirm(`Are you sure you want to delete this ${type === "courses" ? "course" : "batch"}?`)) return;
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string, type: "courses" | "batches") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Pagination Component Mock (Functional UI)
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
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Header & Tabs Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Academic Setup</h1>
          <p className="text-muted-foreground">Manage your institution&apos;s Courses and their associated Batches.</p>
        </div>
        
        {/* Custom Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-sm w-full md:w-auto">
          <button
            onClick={() => setActiveTab("courses")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "courses" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Courses
          </button>
          <button
            onClick={() => setActiveTab("batches")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "batches" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="w-4 h-4" />
            Batches
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900/50 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
              {activeTab === "courses" ? "Course Directory" : "Batch Management"}
            </CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={handleOpenDialog} className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
              <Plus className="h-4 w-4" />
              Add New {activeTab === "courses" ? "Course" : "Batch"}
            </Button>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editMode ? "Edit" : "Add New"} {activeTab === "courses" ? "Course" : "Batch"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 font-medium">
                    {formError}
                  </div>
                )}
                
                {/* Course Name / Batch Name */}
                <div className="grid gap-2">
                  <Label htmlFor="title">{activeTab === "courses" ? "Course Title" : "Batch Name"} <span className="text-red-500">*</span></Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Enter ${activeTab === "courses" ? "course title" : "batch name"}`} required />
                </div>

                {/* Batch specific: Course Selector */}
                {activeTab === "batches" && (
                  <div className="grid gap-2">
                    <Label htmlFor="course">Select Course <span className="text-red-500">*</span></Label>
                    <select 
                      id="course" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={courseId} 
                      onChange={(e) => setCourseId(e.target.value)} 
                      required
                    >
                      <option value="">Select a Course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                )}
                
                {activeTab === "courses" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fee">Regular Fee (৳)</Label>
                        <Input id="fee" type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 5000" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="discountFee">Discounted Fee (৳)</Label>
                        <Input id="discountFee" type="number" value={discountFee} onChange={(e) => setDiscountFee(e.target.value)} placeholder="e.g. 4000 (Optional)" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="thumbnail">Course Thumbnail</Label>
                        <Input id="thumbnail" type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                        {isUploading && <p className="text-xs text-blue-500">Uploading...</p>}
                        {thumbnail && (
                          <div className="mt-2 relative w-20 h-20 rounded overflow-hidden border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="details">Course Details</Label>
                      <Input id="details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Brief description..." />
                    </div>
                  </>
                )}

                {/* Batch specific */}
                {activeTab === "batches" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                          <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                          <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="max">Max Students</Label>
                        <Input id="max" type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} placeholder="Optional (e.g. 50)" />
                      </div>
                      <div className="grid gap-2 col-span-2">
                        <Label>Class Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <label key={day} className="flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-900 border px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <input 
                                type="checkbox" 
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                                checked={classDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) setClassDays([...classDays, day]);
                                  else setClassDays(classDays.filter(d => d !== day));
                                }}
                              />
                              <span className="text-sm font-medium">{translateDayToBengali(day)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-6 flex justify-end">
                  <Button type="submit" disabled={isSubmitting || isUploading} className="w-full sm:w-auto px-8">
                    {isSubmitting ? "Processing..." : editMode ? "Update Configuration" : "Save Configuration"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          
          {/* Content for Courses */}
          {activeTab === "courses" && (
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="space-y-3">
                      <div className="h-4 w-[250px] bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-4 w-[200px] bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-md border border-slate-100 dark:border-slate-800">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead className="py-4">Course Title</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Discount Fee</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      {mounted && (
                        <DragDropContext onDragEnd={handleDragEndCourses}>
                          <Droppable droppableId="courses-droppable">
                            {(provided) => (
                              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                {courses.map((course, index) => (
                                  <Draggable key={course.id.toString()} draggableId={course.id.toString()} index={index}>
                                    {(provided) => (
                                      <TableRow 
                                        ref={provided.innerRef} 
                                        {...provided.draggableProps} 
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 bg-background"
                                      >
                                        <TableCell>
                                          <div {...provided.dragHandleProps} className="cursor-grab p-2 hover:bg-slate-100 rounded-md inline-flex">
                                            <GripVertical className="h-4 w-4 text-slate-400" />
                                          </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200 py-4">
                                          <div className="flex items-center gap-3">
                                            {course.thumbnail ? (
                                              /* eslint-disable-next-line @next/next/no-img-element */
                                              <img src={course.thumbnail} alt={course.title} className="w-10 h-10 rounded-md object-cover bg-slate-100" />
                                            ) : (
                                              <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500">
                                                <BookOpen className="w-5 h-5" />
                                              </div>
                                            )}
                                            {course.title}
                                          </div>
                                        </TableCell>
                            <TableCell>{course.fee ? `৳ ${course.fee}` : "-"}</TableCell>
                            <TableCell>
                              {course.discount_fee ? (
                                <span className="text-green-600 font-medium">৳ {course.discount_fee}</span>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              {course.start_date || course.end_date ? (
                                <div className="text-sm">
                                  {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'N/A'} - {course.end_date ? new Date(course.end_date).toLocaleDateString() : 'N/A'}
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={`cursor-pointer transition-colors shadow-sm ${
                                  course.status === "active" 
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400" 
                                    : "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20 dark:text-slate-400"
                                }`}
                              >
                                {course.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground">
  <span className="sr-only">Open menu</span>
  <MoreHorizontal className="h-4 w-4" />
</DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleToggleStatus(course.id, course.status, "courses")}>
                                    {course.status === "active" ? <XCircle className="mr-2 h-4 w-4 text-red-500" /> : <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
                                    <span>{course.status === "active" ? "Deactivate" : "Activate"}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSmsTargetType("course");
                                    setSmsTargetId(course.id);
                                    setSmsTargetName(course.title);
                                    setIsSmsOpen(true);
                                  }}>
                                    <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                                    <span>Send SMS</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(course.id, "courses")}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                                ))}
                                {provided.placeholder}
                                {courses.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                      <div className="flex flex-col items-center justify-center gap-2">
                                        <BookOpen className="w-8 h-8 text-slate-300" />
                                        <p>No courses found. Add your first course to get started.</p>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            )}
                          </Droppable>
                        </DragDropContext>
                      )}
                    </Table>
                  </div>
                  {courses.length > 0 && renderPagination()}
                </>
              )}
            </div>
          )}

          {/* Content for Batches */}
          {activeTab === "batches" && (
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="space-y-3">
                      <div className="h-4 w-[250px] bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-4 w-[200px] bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {groupedBatches.map(group => (
                    <div key={group.course.id} className="space-y-3">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        {group.course.title}
                      </h3>
                      <div className="overflow-x-auto rounded-md border border-slate-100 dark:border-slate-800">
                        <Table>
                          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                            <TableRow>
                              <TableHead className="py-4 w-[50px]"></TableHead>
                              <TableHead>Batch Name</TableHead>
                              <TableHead>Time & Days</TableHead>
                              <TableHead>Capacity</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          {mounted && (
                            <DragDropContext onDragEnd={(result) => handleDragEndBatches(result, group.course.id)}>
                              <Droppable droppableId={`batches-${group.course.id}`}>
                                {(provided) => (
                                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                    {group.batches.map((batch, index) => (
                                      <Draggable key={batch.id.toString()} draggableId={batch.id.toString()} index={index}>
                                        {(provided) => (
                                          <TableRow 
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 bg-background"
                                          >
                                            <TableCell>
                                              <div {...provided.dragHandleProps} className="cursor-grab p-2 hover:bg-slate-100 rounded-md inline-flex">
                                                <GripVertical className="h-4 w-4 text-slate-400" />
                                              </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-800 dark:text-slate-200 py-4">
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500">
                                                  <Layers className="w-4 h-4" />
                                                </div>
                                                {batch.name}
                                              </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                                              <div className="flex flex-col gap-1">
                                                <span>
                                                  {batch.start_time ? (
                                                    `${formatTimeBengali(batch.start_time)} - ${formatTimeBengali(batch.end_time)}`
                                                  ) : "Not Set"}
                                                </span>
                                                {batch.class_days && batch.class_days.length > 0 && (
                                                  <span className="text-xs text-muted-foreground font-normal">
                                                    {batch.class_days.map(d => translateDayToBengali(d)).join(", ")}
                                                  </span>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell>{batch.max_students ? `${batch.max_students} Students` : "Not Set"}</TableCell>
                                            <TableCell>
                                              <Badge 
                                                variant="outline"
                                                className={`cursor-pointer transition-colors shadow-sm ${
                                                  batch.status === "active" 
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400" 
                                                    : "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20 dark:text-slate-400"
                                                }`}
                                              >
                                                {batch.status === "active" ? "Active" : "Inactive"}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <DropdownMenu>
                                                <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground">
  <span className="sr-only">Open menu</span>
  <MoreHorizontal className="h-4 w-4" />
</DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                  <DropdownMenuItem onClick={() => handleToggleStatus(batch.id, batch.status, "batches")}>
                                                    {batch.status === "active" ? <XCircle className="mr-2 h-4 w-4 text-red-500" /> : <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
                                                    <span>{batch.status === "active" ? "Deactivate" : "Activate"}</span>
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => {
                                                    setSmsTargetType("batch");
                                                    setSmsTargetId(batch.id);
                                                    setSmsTargetName(batch.name);
                                                    setIsSmsOpen(true);
                                                  }}>
                                                    <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                                                    <span>Send SMS</span>
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => handleEditBatch(batch)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                  </DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem 
                                                    onClick={() => handleDelete(batch.id, "batches")}
                                                    className="text-destructive focus:text-destructive"
                                                  >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </TableBody>
                                )}
                              </Droppable>
                            </DragDropContext>
                          )}
                        </Table>
                      </div>
                    </div>
                  ))}
                  {groupedBatches.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border rounded-md">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Layers className="w-8 h-8 text-slate-300" />
                        <p>No batches found. Add your first batch to a course.</p>
                      </div>
                    </div>
                  )}
                  {groupedBatches.length > 0 && renderPagination()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <SmsModal 
        isOpen={isSmsOpen} 
        onClose={() => setIsSmsOpen(false)}
        targetType={smsTargetType}
        targetId={smsTargetId}
        targetName={smsTargetName}
      />
    </div>
  );
}
