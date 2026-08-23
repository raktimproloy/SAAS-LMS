"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Power,
  QrCode,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SmsModal } from "@/components/admin/SmsModal";
import { StudentEnrollDialog } from "@/components/admin/students/StudentEnrollDialog";
import { StudentExpandedRow } from "@/components/admin/students/StudentExpandedRow";
import { StudentsExportButton } from "@/components/admin/students/StudentsExportButton";
import type { Batch, Course, Student, StudentsPagination } from "@/components/admin/students/types";

const filterSelectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const PAGE_SIZES = [10, 20, 30, 50, 100];

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState<StudentsPagination | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsTargetId, setSmsTargetId] = useState<number | undefined>(undefined);
  const [smsTargetName, setSmsTargetName] = useState("");

  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterBatchId, setFilterBatchId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchAbort = useRef<AbortController | null>(null);
  const filteredBatches = batches.filter((b) => b.course?.id?.toString() === filterCourseId);
  const hasActiveFilters = Boolean(filterCourseId || filterBatchId || filterStatus);
  const pageCount = paginationMeta?.totalPages ?? Math.max(1, Math.ceil(totalStudents / pageSize));
  const from = totalStudents === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalStudents);
  const allSelected = students.length > 0 && students.every((s) => selectedIds.includes(s.id));
  const someSelected = students.some((s) => selectedIds.includes(s.id));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPageIndex(0);
  }, [filterCourseId, filterBatchId, filterStatus, debouncedSearch, pageSize]);

  const fetchStudents = useCallback(async () => {
    fetchAbort.current?.abort();
    const controller = new AbortController();
    fetchAbort.current = controller;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      if (filterCourseId) params.set("course_id", filterCourseId);
      if (filterBatchId) params.set("batch_id", filterBatchId);
      if (filterStatus) params.set("status", filterStatus);
      if (debouncedSearch) params.set("q", debouncedSearch);

      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const payload = await res.json();
      const list: Student[] = Array.isArray(payload) ? payload : payload.students ?? [];
      const total = Array.isArray(payload)
        ? list.length
        : payload.pagination?.total ?? list.length;

      setStudents(list);
      setTotalStudents(total);
      setPaginationMeta(Array.isArray(payload) ? null : payload.pagination ?? null);
      setSelectedIds((prev) => prev.filter((id) => list.some((s) => s.id === id)));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [filterCourseId, filterBatchId, filterStatus, debouncedSearch, pageIndex, pageSize]);

  useEffect(() => {
    fetch("/api/admin/batches")
      .then((res) => (res.ok ? res.json() : []))
      .then(setBatches)
      .catch(console.error);
    fetch("/api/admin/courses")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCourses)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => () => fetchAbort.current?.abort(), []);

  const resetFilters = () => {
    setFilterCourseId("");
    setFilterBatchId("");
    setFilterStatus("");
  };

  const handleAddClick = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setStudentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student");
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete student");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    setBulkDeleting(true);
    const failed: number[] = [];
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
        if (!res.ok) failed.push(id);
      } catch {
        failed.push(id);
      }
    }
    setBulkDeleting(false);
    setSelectedIds(failed);
    fetchStudents();
    if (failed.length) {
      alert(`Failed to delete ${failed.length} student(s). They may have related records.`);
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
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const toggleRow = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...students.map((s) => s.id)])));
    } else {
      const pageIds = new Set(students.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const colCount = 9;

  return (
    <div className="space-y-6" data-aos="fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-aos="fade-down">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Students
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {totalStudents.toLocaleString()} student{totalStudents === 1 ? "" : "s"} match the current filters
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleAddClick}>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/qr-cards")}>
            <QrCode className="h-4 w-4" />
            Generate QR
          </Button>
          <StudentsExportButton
            courses={courses}
            batches={batches}
            defaultCourseId={filterCourseId}
            defaultBatchId={filterBatchId}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm" data-aos="fade-up" data-aos-delay="100">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="filter-course">Course</Label>
            <select
              id="filter-course"
              className={filterSelectClass}
              value={filterCourseId}
              onChange={(e) => {
                setFilterCourseId(e.target.value);
                setFilterBatchId("");
              }}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-batch">Batch</Label>
            <select
              id="filter-batch"
              className={filterSelectClass}
              value={filterBatchId}
              onChange={(e) => setFilterBatchId(e.target.value)}
              disabled={!filterCourseId}
            >
              <option value="">All Batches</option>
              {filteredBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-status">Status</Label>
            <select
              id="filter-status"
              className={filterSelectClass}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" data-aos="fade-up" data-aos-delay="200">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, ID, or phone…"
              className="h-9 pl-9"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-primary/5 px-4 py-2.5">
            <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleting ? "Deleting…" : "Delete selected"}
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto h-8" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
          </div>
        )}

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(value) => toggleSelectAll(!!value)}
                  aria-label="Select all"
                  className={someSelected && !allSelected ? "opacity-70" : undefined}
                />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student ID
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Phone
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Course
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Batch
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 8) }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : students.length ? (
              students.map((student) => {
                const isExpanded = expandedId === student.id;
                return (
                  <Fragment key={student.id}>
                    <TableRow
                      data-state={selectedIds.includes(student.id) ? "selected" : undefined}
                      className="cursor-pointer"
                      onClick={() => toggleRow(student.id)}
                    >
                      <TableCell className="w-10">
                        <button
                          type="button"
                          className="rounded p-1.5 transition-colors hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(student.id);
                          }}
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(student.id)}
                          onCheckedChange={(value) => toggleSelect(student.id, !!value)}
                          aria-label={`Select ${student.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{student.student_id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {student.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={student.photo}
                              alt={student.name}
                              className="h-12 w-12 rounded-full border-2 border-background object-cover shadow-sm ring-1 ring-border"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary shadow-sm">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="font-medium text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {student.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{student.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {student.batch?.course?.title || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-primary/20 bg-primary/10 font-normal text-primary"
                        >
                          {student.batch?.name || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            student.status === "active"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }
                        >
                          {student.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-muted">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/admin/students/${student.id}`)}>
                              <User className="h-4 w-4" />
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(student)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSmsTargetId(student.id);
                                setSmsTargetName(student.name);
                                setIsSmsOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                              Send SMS
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                              <Power className="h-4 w-4" />
                              {student.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteClick(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={colCount} className="overflow-x-hidden border-b p-0">
                          <StudentExpandedRow student={student} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="h-64">
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No students found</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      No students match the current course, batch, or search filters.
                    </p>
                    <Button className="mt-2" onClick={handleAddClick}>
                      <UserPlus className="h-4 w-4" />
                      Add Student
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {!loading && (
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedIds.length > 0 ? (
                <>
                  <span className="font-medium text-foreground">{selectedIds.length}</span> of {totalStudents}{" "}
                  row{totalStudents === 1 ? "" : "s"} selected
                </>
              ) : (
                <>
                  Showing <span className="font-medium text-foreground">{from}</span>–
                  <span className="font-medium text-foreground">{to}</span> of{" "}
                  <span className="font-medium text-foreground">{totalStudents}</span>
                </>
              )}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted-foreground sm:inline">Rows per page</span>
                <select
                  className="h-8 w-[72px] rounded-lg border border-input bg-background px-2 text-sm"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm font-medium">
                Page {totalStudents === 0 ? 0 : pageIndex + 1} of {totalStudents === 0 ? 0 : pageCount}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 sm:inline-flex"
                  onClick={() => setPageIndex(0)}
                  disabled={pageIndex === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">First page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={pageIndex >= pageCount - 1 || totalStudents === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 sm:inline-flex"
                  onClick={() => setPageIndex(pageCount - 1)}
                  disabled={pageIndex >= pageCount - 1 || totalStudents === 0}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <StudentEnrollDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingStudent(null);
        }}
        student={editingStudent}
        courses={courses}
        batches={batches}
        onSaved={fetchStudents}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this student? This action cannot be undone and may fail if the
              student has related records (like payments or attendance). Consider setting their status to Inactive
              instead.
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
