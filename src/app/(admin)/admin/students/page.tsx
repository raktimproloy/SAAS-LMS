"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Power, AlertTriangle, CheckCircle2, User, ChevronDown, Search, Filter, MessageSquare, MoreHorizontal } from "lucide-react";
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
import { SmsModal } from "@/components/admin/SmsModal";

// Types
interface Course {
  id: number;
  title: string;
  fee?: number | null;
  discount_fee?: number | null;
}

interface Batch {
  id: number;
  name: string;
  year: string;
  course: Course;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  dob?: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  photo?: string | null;
  batch: Batch;
  status: string;
  enrolled_at: string;
}

// Custom Dropdown that guarantees downward opening
const CustomDropdown = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? "text-muted-foreground" : "text-foreground"}>
          {options.find(o => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-[100] custom-scrollbar">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [successData, setSuccessData] = useState<{ id: number; name: string } | null>(null);

  // SMS Modal States
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsTargetId, setSmsTargetId] = useState<number | undefined>(undefined);
  const [smsTargetName, setSmsTargetName] = useState<string>("");

  // Fields
  const [student_id, setStudent_id] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Enrollment Payment & SMS Fields
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDue, setPaymentDue] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState("paid"); // "paid", "partial", "due"
  const [sendWelcomeSms, setSendWelcomeSms] = useState(true);
  const [welcomeSmsTemplate, setWelcomeSmsTemplate] = useState("Welcome {name} to {course}! Log in at https://bulksmsbd.net");

  // Filters
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterBatchId, setFilterBatchId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCourseId) params.append("course_id", filterCourseId);
      if (filterBatchId) params.append("batch_id", filterBatchId);
      if (searchQuery) params.append("q", searchQuery);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (res.ok) setStudents(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batRes, couRes] = await Promise.all([
        fetch("/api/admin/batches"),
        fetch("/api/admin/courses")
      ]);

      if (batRes.ok) setBatches(await batRes.json());
      if (couRes.ok) setCourses(await couRes.json());
      await fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Only fetch students when course or batch filter changes
    fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCourseId, filterBatchId]);

  const resetForm = () => {
    setStudent_id("");
    setName("");
    setGender("");
    setDobDay("");
    setDobMonth("");
    setDobYear("");
    setPhone("");
    setEmail("");
    setPassword("");
    setSelectedCourseId("");
    setBatchId("");
    setParentName("");
    setParentPhone("");
    setAddress("");
    setPhoto("");
    setEditingStudentId(null);
    setFormError("");
    setPaymentAmount("");
    setPaymentDue("0");
    setPaymentStatus("paid");
    setSendWelcomeSms(true);
  };

  const handleAddClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    resetForm();
    setEditingStudentId(student.id);
    setStudent_id(student.student_id || "");
    setName(student.name || "");
    setGender(student.gender || "");
    if (student.dob) {
      const d = new Date(student.dob).toISOString().split('T')[0];
      const parts = d.split('-');
      setDobYear(parts[0]);
      setDobMonth(parts[1]);
      setDobDay(parts[2]);
    } else {
      setDobDay("");
      setDobMonth("");
      setDobYear("");
    }
    setPhone(student.phone || "");
    setEmail(student.email || "");
    setPassword(""); // Leave password blank on edit unless they want to change it
    setSelectedCourseId(student.batch?.course?.id?.toString() || "");
    setBatchId(student.batch?.id?.toString() || "");
    setParentName(student.parent_name || "");
    setParentPhone(student.parent_phone || "");
    setAddress(student.address || "");
    setPhoto(student.photo || "");

    setIsDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setFormError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo");
      setPhoto(data.url);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleDeleteClick = (id: number) => {
    setStudentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student");

      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Failed to delete student");
      } else {
        alert("Failed to delete student");
      }
    }
  };

  const handleToggleStatus = async (student: Student) => {
    const newStatus = student.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchStudents();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Failed to update status");
      } else {
        alert("Failed to update status");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = editingStudentId
        ? `/api/admin/students/${editingStudentId}`
        : "/api/admin/students";
      const method = editingStudentId ? "PUT" : "POST";

      // If editing and password is empty, don't send it
      if (!dobYear || !dobMonth || !dobDay) {
        setFormError("Date of Birth is required");
        setIsSubmitting(false);
        return;
      }
      const dob = `${dobYear}-${dobMonth}-${dobDay}`;
      const payload: Record<string, string | number | boolean | undefined> = {
        student_id, name, gender, dob, phone, email, batch_id: batchId,
        parent_name: parentName, parent_phone: parentPhone, address, photo
      };
      if (password) payload.password = password;

      if (!editingStudentId) {
        payload.payment_amount = paymentAmount;
        payload.payment_due = paymentDue;
        payload.payment_status = paymentStatus;
        payload.send_welcome_sms = sendWelcomeSms;
        const selectedCourseTitle = courses.find(c => c.id.toString() === selectedCourseId)?.title || "our course";
        payload.welcome_sms_template = welcomeSmsTemplate.replace(/{course}/g, selectedCourseTitle);
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${editingStudentId ? "update" : "create"} student`);

      if (!editingStudentId && data.data) {
        // Success dialog removed as per user requirement, just close and reset
        resetForm();
        setIsDialogOpen(false);
      } else {
        resetForm();
        setIsDialogOpen(false);
      }

      fetchStudents();
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
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-1">Add and manage student enrollments.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* @ts-expect-error - Radix UI type mismatch for asChild */}
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleAddClick}>
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudentId ? "Edit Student" : "Enroll New Student"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                  {formError}
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center relative shrink-0">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="Student photo" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">
                    {isUploadingPhoto ? "Uploading..." : photo ? "Change Photo" : "Upload Photo"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student ID (Login ID)</Label>
                  <Input id="student_id" value={student_id} onChange={(e) => setStudent_id(e.target.value)} required placeholder="e.g. 1001" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <select
                    id="course"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setBatchId("");
                    }}
                    required
                  >
                    <option value="">Select Course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <select
                    id="batch"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    required
                    disabled={!selectedCourseId}
                  >
                    <option value="">Select Batch...</option>
                    {batches.filter(b => b.course?.id?.toString() === selectedCourseId).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Student Phone (Password)</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Custom Password (Optional) {editingStudentId && <span className="text-xs text-muted-foreground">(Leave blank to keep current)</span>}</Label>
                  <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-3 gap-2">
                    <CustomDropdown
                      value={dobDay}
                      onChange={setDobDay}
                      placeholder="Day"
                      options={Array.from({length: 31}, (_, i) => {
                        const val = (i + 1).toString().padStart(2, '0');
                        return { value: val, label: val };
                      })}
                    />
                    <CustomDropdown
                      value={dobMonth}
                      onChange={setDobMonth}
                      placeholder="Month"
                      options={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
                        value: (i + 1).toString().padStart(2, '0'), label: m
                      }))}
                    />
                    <CustomDropdown
                      value={dobYear}
                      onChange={setDobYear}
                      placeholder="Year"
                      options={Array.from({length: 50}, (_, i) => {
                        const y = (new Date().getFullYear() - i).toString();
                        return { value: y, label: y };
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="md:col-span-2 pt-4 border-t mt-2">
                  <h3 className="font-semibold text-lg text-primary mb-4">Parent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent_name">Parent Name (Optional)</Label>
                      <Input id="parent_name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parent_phone" className="flex items-center justify-between">
                        <span>Parent Phone (Optional)</span>
                        <button 
                          type="button" 
                          onClick={() => setParentPhone(phone)}
                          className="text-xs text-blue-600 hover:underline flex items-center"
                        >
                          Copy Student Phone
                        </button>
                      </Label>
                      <Input id="parent_phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>

              {!editingStudentId && (
                <div className="mt-6 space-y-6">
                  {/* Payment Section */}
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                    <h3 className="font-semibold text-lg">Initial Payment</h3>
                    {(() => {
                      const course = courses.find(c => c.id.toString() === selectedCourseId);
                      const courseFee = course?.discount_fee || course?.fee;
                      
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {courseFee ? (
                            <div className="space-y-2">
                              <Label>Course Fee</Label>
                              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground items-center">
                                ৳ {courseFee}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label className="text-muted-foreground italic">No fee defined for course</Label>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="pay_amount">Amount Paying (৳)</Label>
                            <Input 
                              id="pay_amount" 
                              type="number" 
                              value={paymentAmount} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setPaymentAmount(val);
                                if (courseFee) {
                                  const p = parseFloat(val || "0");
                                  const d = courseFee - p;
                                  setPaymentDue(d > 0 ? d.toString() : "0");
                                  setPaymentStatus(d > 0 ? (p > 0 ? "partial" : "due") : "paid");
                                }
                              }} 
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pay_due">Due Amount (৳)</Label>
                            <Input 
                              id="pay_due" 
                              type="number" 
                              value={paymentDue} 
                              onChange={(e) => setPaymentDue(e.target.value)} 
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={paymentStatus}
                              onChange={(e) => setPaymentStatus(e.target.value)}
                            >
                              <option value="paid">Full Paid</option>
                              <option value="partial">Partial</option>
                              <option value="due">Unpaid</option>
                            </select>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* SMS Section */}
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="send_sms" 
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={sendWelcomeSms}
                        onChange={(e) => setSendWelcomeSms(e.target.checked)}
                      />
                      <Label htmlFor="send_sms" className="text-base font-semibold cursor-pointer">Send Welcome SMS</Label>
                    </div>
                    {sendWelcomeSms && (
                      <div className="space-y-2">
                        <Label>Message Template</Label>
                        <textarea
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none"
                          value={welcomeSmsTemplate}
                          onChange={(e) => setWelcomeSmsTemplate(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Variables: {'{name}'}, {'{course}'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting || isUploadingPhoto}>
                  {isSubmitting ? "Enrolling..." : "Enroll Student"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this student? This action cannot be undone and may fail if the student has related records (like payments or attendance). Consider setting their status to Inactive instead.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!successData} onOpenChange={(open) => {
          if (!open) {
            setSuccessData(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Enrollment Successful
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                <strong>{successData?.name}</strong> has been enrolled successfully. Would you like to process their initial payment now?
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setSuccessData(null); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={() => router.push('/admin/payments')}>
                Go to Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="border-none shadow-sm dark:bg-slate-800/50 mb-2">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={filterCourseId}
                onChange={(e) => {
                  setFilterCourseId(e.target.value);
                  setFilterBatchId("");
                }}
              >
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                value={filterBatchId}
                onChange={(e) => setFilterBatchId(e.target.value)}
                disabled={!filterCourseId}
              >
                <option value="">All Batches</option>
                {batches.filter(b => b.course?.id?.toString() === filterCourseId).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 flex gap-2">
            <Input 
              placeholder="Search by ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
              className="flex-1"
            />
            <Button onClick={fetchStudents} className="gap-2 shrink-0">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm dark:bg-slate-800/50 overflow-hidden">
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
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
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                              {student.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-muted-foreground">
                                  {student.name?.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <Link href={`/admin/students/${student.id}`} className="font-semibold text-primary hover:underline">
                                {student.name}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {new Date(student.enrolled_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 backdrop-blur-md font-normal">
                            {student.batch?.name} ({student.batch?.course?.title})
                          </Badge>
                        </TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`transition-colors shadow-sm ${
                              student.status === "active" 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                            }`}
                          >
                            {student.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground">
  <span className="sr-only">Open menu</span>
  <MoreHorizontal className="h-4 w-4" />
</DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                                <Power className={`mr-2 h-4 w-4 ${student.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`} />
                                <span>{student.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSmsTargetId(student.id);
                                setSmsTargetName(student.name);
                                setIsSmsOpen(true);
                              }}>
                                <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                                <span>Send SMS</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/students/${student.id}`)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(student)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(student.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No students enrolled yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {students.length > 0 && renderPagination()}
            </>
          )}
        </CardContent>
      </Card>
      
      <SmsModal 
        isOpen={isSmsOpen} 
        onClose={() => setIsSmsOpen(false)}
        targetType="student"
        targetId={smsTargetId}
        targetName={smsTargetName}
      />
    </div>
  );
}
