"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Power, AlertTriangle, CheckCircle2, User } from "lucide-react";
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
interface Course {
  id: number;
  title: string;
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
  batch: Batch;
  status: string;
  enrolled_at: string;
}

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

  // Fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, batRes, couRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/batches"),
        fetch("/api/admin/courses")
      ]);

      if (stuRes.ok) setStudents(await stuRes.json());
      if (batRes.ok) setBatches(await batRes.json());
      if (couRes.ok) setCourses(await couRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setName("");
    setGender("");
    setDob("");
    setPhone("");
    setEmail("");
    setPassword("");
    setSelectedCourseId("");
    setBatchId("");
    setParentName("");
    setParentPhone("");
    setAddress("");
    setEditingStudentId(null);
    setFormError("");
  };

  const handleAddClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    resetForm();
    setEditingStudentId(student.id);
    setName(student.name || "");
    setGender(student.gender || "");
    setDob(student.dob ? new Date(student.dob).toISOString().split('T')[0] : "");
    setPhone(student.phone || "");
    setEmail(student.email || "");
    setPassword(""); // Leave password blank on edit unless they want to change it
    setSelectedCourseId(student.batch?.course?.id?.toString() || "");
    setBatchId(student.batch?.id?.toString() || "");
    setParentName(student.parent_name || "");
    setParentPhone(student.parent_phone || "");
    setAddress(student.address || "");

    setIsDialogOpen(true);
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
      fetchData();
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
      fetchData();
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
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = editingStudentId
        ? `/api/admin/students/${editingStudentId}`
        : "/api/admin/students";
      const method = editingStudentId ? "PUT" : "POST";

      // If editing and password is empty, don't send it
      const payload: Record<string, string | number | undefined> = {
        name, gender, dob, phone, email, batch_id: batchId,
        parent_name: parentName, parent_phone: parentPhone, address
      };
      if (password) payload.password = password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${editingStudentId ? "update" : "create"} student`);

      if (!editingStudentId && data.data) {
        setSuccessData({ id: data.data.id, name: data.data.name });
        setIsDialogOpen(false);
      } else {
        resetForm();
        setIsDialogOpen(false);
      }

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="phone">Phone Number (Login ID)</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password {editingStudentId && <span className="text-xs text-muted-foreground">(Leave blank to keep current)</span>}</Label>
                  <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingStudentId} />
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
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_name">Parent Name</Label>
                  <Input id="parent_name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_phone">Parent Phone</Label>
                  <Input id="parent_phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
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

      <Card className="border-none shadow-sm dark:bg-slate-800/50">
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
                          <div className="flex flex-col">
                            <Link href={`/admin/students/${student.id}`} className="font-semibold text-primary hover:underline">
                              {student.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {new Date(student.enrolled_at).toLocaleDateString()}
                            </span>
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
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${student.status === 'active' ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-muted-foreground hover:text-primary'}`}
                              onClick={() => handleToggleStatus(student)}
                              title={student.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Link href={`/admin/students/${student.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="View Profile"
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEditClick(student)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(student.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
    </div>
  );
}
