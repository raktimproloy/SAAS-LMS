"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, FileText, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface Course {
  id: number;
  title: string;
}

interface Batch {
  id: number;
  name: string;
  course: Course;
}

interface NoteMaterial {
  id: number;
  title: string;
  type: string;
  file_path: string;
  description: string | null;
  is_public: boolean;
  collect_lead: boolean;
  lead_mandatory: boolean;
  lead_form_message: string | null;
  status: string;
  created_at: string;
  batch?: Batch | null;
  course?: Course | null;
}

export default function MaterialsPage() {
  // Data States
  const [notes, setNotes] = useState<NoteMaterial[]>([]);
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

  // Form Fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState("note");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [collectLead, setCollectLead] = useState(false);
  const [leadMandatory, setLeadMandatory] = useState(false);
  const [leadFormMessage, setLeadFormMessage] = useState("");
  const [status, setStatus] = useState("active");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notRes, couRes, batRes] = await Promise.all([
        fetch("/api/admin/materials/notes"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches")
      ]);
      
      if (notRes.ok) setNotes(await notRes.json());
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setFormError("");
    
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");
      
      if (data.urls && data.urls.length > 1) {
        setFileUrl(JSON.stringify(data.urls));
      } else {
        setFileUrl(data.url);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setType("note");
    setCourseId("");
    setBatchId("");
    setFileUrl("");
    setDescription("");
    setIsPublic(false);
    setCollectLead(false);
    setLeadMandatory(false);
    setLeadFormMessage("");
    setStatus("active");
    setEditMode(false);
    setEditId(null);
    setFormError("");
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (note: NoteMaterial) => {
    resetForm();
    setEditMode(true);
    setEditId(note.id);
    setTitle(note.title);
    setType(note.type);
    setCourseId(note.course?.id?.toString() || "");
    setBatchId(note.batch?.id?.toString() || "");
    setFileUrl(note.file_path);
    setDescription(note.description || "");
    setIsPublic(note.is_public);
    setCollectLead(note.collect_lead || false);
    setLeadMandatory(note.lead_mandatory || false);
    setLeadFormMessage(note.lead_form_message || "");
    setStatus(note.status);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fileUrl) {
      setFormError("Please upload a file or provide a direct URL.");
      return;
    }

    setIsSubmitting(true);

    const endpoint = editMode ? `/api/admin/materials/notes/${editId}` : "/api/admin/materials/notes";
    const method = editMode ? "PUT" : "POST";

    const payload = {
      title,
      type,
      course_id: courseId,
      batch_id: batchId,
      file_path: fileUrl,
      description,
      is_public: isPublic,
      collect_lead: collectLead,
      lead_mandatory: leadMandatory,
      lead_form_message: leadFormMessage,
      status
    };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save material");

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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this study material?")) return;
    try {
      const res = await fetch(`/api/admin/materials/notes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("An unknown error occurred");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/materials/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const renderPagination = () => {
    return (
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
              <PaginationLink href="#" isActive={true}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-10" data-aos="fade-up">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Study Materials</h1>
          <p className="text-muted-foreground">Manage your institution&apos;s PDFs, Lecture Notes, and Books.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900/50 overflow-hidden" data-aos="fade-up" data-aos-delay="100">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
              Material Directory
            </CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={handleOpenDialog} className="gap-2 bg-primary hover:bg-primary/90 shadow-md w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add New Material
            </Button>
            <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editMode ? "Edit" : "Add New"} Material
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 font-medium">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Material Title <span className="text-red-500">*</span></Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 1: Introduction" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Material Type <span className="text-red-500">*</span></Label>
                    <select 
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="note">Lecture Note</option>
                      <option value="book">Book / Manual</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Target Course</Label>
                    <select 
                      id="course"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={courseId} 
                      onChange={(e) => {
                        setCourseId(e.target.value);
                        setBatchId(""); // Reset batch when course changes
                      }}
                    >
                      <option value="">No Course (Global)</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch">Target Batch</Label>
                    <select 
                      id="batch"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                      value={batchId} 
                      onChange={(e) => setBatchId(e.target.value)}
                      disabled={!courseId}
                    >
                      <option value="">All Batches</option>
                      {batches.filter(b => b.course?.id?.toString() === courseId).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select 
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50 dark:bg-slate-800/20">
                  <div>
                    <Label className="text-base font-medium">Material Content <span className="text-red-500">*</span></Label>
                    <p className="text-xs text-muted-foreground mt-1">Please provide either a file upload OR a direct URL.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Option 1: Upload File(s)</Label>
                    <Input 
                      type="file" 
                      multiple
                      onChange={handleFileUpload} 
                      disabled={isUploading || fileUrl?.startsWith('/uploads/') || fileUrl?.startsWith('[')} 
                      accept=".pdf,.doc,.docx,.txt,image/*" 
                    />
                    {isUploading && <p className="text-xs text-blue-500">Uploading...</p>}
                    {(fileUrl?.startsWith('/uploads/') || fileUrl?.startsWith('[')) && (
                      <p className="text-xs text-green-600 font-medium mt-1">✓ File(s) uploaded successfully</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-50 dark:bg-slate-900 px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fileUrl" className="text-sm">Option 2: Direct URL</Label>
                    <Input 
                      id="fileUrl" 
                      type="text" 
                      value={(fileUrl?.startsWith('/uploads/') || fileUrl?.startsWith('[')) ? '' : fileUrl} 
                      onChange={(e) => setFileUrl(e.target.value)} 
                      placeholder="https://..." 
                      disabled={fileUrl?.startsWith('/uploads/') || fileUrl?.startsWith('[')}
                    />
                    {(fileUrl?.startsWith('/uploads/') || fileUrl?.startsWith('[')) && (
                       <p className="text-xs text-muted-foreground">URL input is disabled because file(s) were uploaded. If you want to use a URL instead, please close and reopen this form.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description or instructions..." />
                </div>

                <div className="space-y-4 py-4 border-y mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Make this material Public</Label>
                      <p className="text-sm text-muted-foreground">Public materials can be seen by unregistered students or visitors.</p>
                    </div>
                    <Switch checked={isPublic} onCheckedChange={(checked) => {
                      setIsPublic(checked);
                      if (!checked) {
                        setCollectLead(false);
                        setLeadMandatory(false);
                      }
                    }} />
                  </div>

                  {isPublic && (
                    <div className="overflow-hidden">
                      <div className="pt-4 border-t space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-semibold">Enable Lead Collection</Label>
                            <p className="text-sm text-muted-foreground">Ask visitors for their Name and Phone Number before they can view this material.</p>
                          </div>
                          <Switch checked={collectLead} onCheckedChange={(checked) => {
                            setCollectLead(checked);
                            if (!checked) setLeadMandatory(false);
                          }} />
                        </div>

                        {collectLead && (
                          <div className="space-y-4 pl-6 border-l-2 border-muted animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Mandatory Collection</Label>
                                <p className="text-sm text-muted-foreground">If checked, visitors cannot skip the form.</p>
                              </div>
                              <Switch checked={leadMandatory} onCheckedChange={setLeadMandatory} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="leadFormMessage">Form Message (Optional)</Label>
                              <Input 
                                id="leadFormMessage" 
                                placeholder="e.g. Please enter your details to view this note." 
                                value={leadFormMessage} 
                                onChange={(e) => setLeadFormMessage(e.target.value)} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 flex justify-end">
                  <Button type="submit" disabled={isSubmitting || isUploading} className="w-full sm:w-auto px-8">
                    {isSubmitting ? "Processing..." : editMode ? "Update Material" : "Save Material"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto rounded-md border border-slate-100 dark:border-slate-800">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="py-4">Material Details</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-md shrink-0" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-5 w-16 rounded" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : notes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-slate-300" />
                          <p>No study materials found. Add your first material to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notes.map((note) => (
                      <TableRow key={note.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{note.title}</div>
                                <div className="text-xs text-muted-foreground capitalize mt-0.5">{note.type}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {note.course ? (
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 backdrop-blur-md w-fit">{note.course.title}</Badge>
                                {note.batch && <span className="text-xs text-muted-foreground ml-1">{note.batch.name}</span>}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Global</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {note.is_public ? (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">Public</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20">Protected</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              try {
                                if (note.file_path.startsWith('[')) {
                                  const urls = JSON.parse(note.file_path);
                                  if (Array.isArray(urls)) {
                                    return (
                                      <div className="flex flex-col gap-2">
                                        {urls.map((u: string, idx: number) => (
                                          <div key={idx} className="flex items-center gap-3">
                                            <a href={u} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                                              View {idx + 1}
                                            </a>
                                            <a href={`/api/download?url=${encodeURIComponent(u)}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-600 hover:underline border border-indigo-200 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-800">
                                              Download
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                }
                              } catch { }
                              return (
                                <div className="flex items-center gap-3">
                                  <a href={note.file_path} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                                    View
                                  </a>
                                  <a href={`/api/download?url=${encodeURIComponent(note.file_path)}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-600 hover:underline border border-indigo-200 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-800">
                                    Download
                                  </a>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <button 
                              onClick={() => handleToggleStatus(note.id, note.status)}
                              className="focus:outline-none"
                            >
                              <Badge 
                                variant="outline"
                                className={`cursor-pointer transition-colors shadow-sm ${
                                  note.status === "active" 
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400" 
                                    : "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20 dark:text-slate-400"
                                }`}
                              >
                                {note.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground">
  <span className="sr-only">Open menu</span>
  <MoreHorizontal className="h-4 w-4" />
</DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleToggleStatus(note.id, note.status)}>
                                  {note.status === "active" ? <XCircle className="mr-2 h-4 w-4 text-red-500" /> : <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
                                  <span>{note.status === "active" ? "Deactivate" : "Activate"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(note)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(note.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                    ))
                  )}
                  </TableBody>
                </Table>
              </div>
              {notes.length > 0 && renderPagination()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
