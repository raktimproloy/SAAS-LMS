"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Edit,
  Info,
  Loader2,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import { StudentExpandedCalendar } from "./StudentExpandedCalendar";
import { PayDueModal } from "./PayDueModal";
import type { Batch, Course, Student, StudentPayment } from "./types";

const inputClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

const editInputClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

interface EditStudent extends Student {
  password?: string;
}

interface StudentExpandedRowProps {
  student: Student;
  courses: Course[];
  batches: Batch[];
  onRefresh: () => void;
}

function formatPaymentMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getDefaultDiscountPercent(payments: StudentPayment[]): string {
  for (const p of payments) {
    const amount = p.amount || 0;
    const discount = p.discount || 0;
    if (amount > 0 && discount > 0) {
      return ((discount / amount) * 100).toFixed(1).replace(/\.0$/, "");
    }
  }
  return "";
}

function isDueSettlement(payment: StudentPayment) {
  return Boolean(payment.note?.toLowerCase().includes("due settlement"));
}

function deriveStatus(amount: number, discount: number, due: number) {
  const collecting = amount - discount - due;
  if (due > 0 && collecting > 0) return "partial";
  if (due > 0 && collecting <= 0) return "due";
  return "paid";
}

export function StudentExpandedRow({
  student,
  courses,
  batches,
  onRefresh,
}: StudentExpandedRowProps) {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editStudent, setEditStudent] = useState<EditStudent>({ ...student, password: "" });
  const [selectedCourseId, setSelectedCourseId] = useState(
    student.batch?.course?.id?.toString() || ""
  );
  const [editBatchId, setEditBatchId] = useState(student.batch?.id?.toString() || "");
  const [updatingStudent, setUpdatingStudent] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(student.photo || "");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [paymentTypes, setPaymentTypes] = useState<string[]>([]);
  const [recentPayments, setRecentPayments] = useState<StudentPayment[]>([]);
  const [recentPaymentsLoading, setRecentPaymentsLoading] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [defaultDiscountPercent, setDefaultDiscountPercent] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [payDueTarget, setPayDueTarget] = useState<StudentPayment | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    type: "",
    amount: "",
    discount: "",
    due: "",
    note: "",
    paid_at: new Date().toISOString().split("T")[0],
  });

  const filteredBatches = batches.filter((b) => b.course?.id?.toString() === selectedCourseId);

  const blankPaymentForm = (overrides: Partial<typeof paymentForm> = {}) => ({
    type: "",
    amount: "",
    discount: defaultDiscountPercent || "",
    due: "",
    note: "",
    paid_at: new Date().toISOString().split("T")[0],
    ...overrides,
  });

  const fetchPayments = async () => {
    setRecentPaymentsLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/payments`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      const payments: StudentPayment[] = data.payments || [];
      setPaymentTypes(data.paymentTypes || []);
      setRecentPayments(payments.slice(0, 5));
      const disc = getDefaultDiscountPercent(payments);
      setDefaultDiscountPercent(disc);
      if (!editingPaymentId && payments.length > 0) {
        const latest = payments[0];
        const patch: Partial<typeof paymentForm> = { discount: disc || "" };
        if (latest.paid_at) {
          const nextDate = new Date(latest.paid_at);
          nextDate.setMonth(nextDate.getMonth() + 1);
          patch.paid_at = nextDate.toISOString().split("T")[0];
        }
        setPaymentForm((prev) => ({ ...prev, ...patch }));
      }
    } catch (err) {
      console.error(err);
      setRecentPayments([]);
    } finally {
      setRecentPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  useEffect(() => {
    setEditStudent({ ...student, password: "" });
    setPhotoPreview(student.photo || "");
    setSelectedCourseId(student.batch?.course?.id?.toString() || "");
    setEditBatchId(student.batch?.id?.toString() || "");
  }, [student]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPhotoPreview(data.url);
      const updateRes = await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: data.url }),
      });
      if (!updateRes.ok) throw new Error("Photo uploaded but failed to save");
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleStudentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStudent(true);
    try {
      const batchIdValue = editBatchId ? parseInt(editBatchId) : student.batch?.id;
      if (!batchIdValue) {
        alert("Please select a batch");
        setUpdatingStudent(false);
        return;
      }

      const payload: Record<string, string | number> = {
        student_id: editStudent.student_id,
        name: editStudent.name,
        phone: editStudent.phone,
        gender: editStudent.gender || "Male",
        batch_id: batchIdValue,
        parent_name: editStudent.parent_name || "",
        parent_phone: editStudent.parent_phone || "",
        email: editStudent.email || "",
        address: editStudent.address || "",
        photo: photoPreview || "",
      };
      if (editStudent.password?.trim()) {
        if (editStudent.password.trim().length < 6) {
          alert("Password must be at least 6 characters");
          setUpdatingStudent(false);
          return;
        }
        payload.password = editStudent.password.trim();
      }

      const batchId = batches.find((b) => b.id === batchIdValue)?.id;
      if (batchId) payload.batch_id = batchId;

      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update student");

      setIsEditingInfo(false);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update student");
    } finally {
      setUpdatingStudent(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete payment");
      if (editingPaymentId === paymentId) {
        setEditingPaymentId(null);
        setPaymentForm(blankPaymentForm());
      }
      fetchPayments();
    } catch {
      alert("Failed to delete payment");
    }
  };

  const submitPayment = async () => {
    if (!paymentForm.type || !paymentForm.amount) {
      alert("Payment type and amount are required");
      return;
    }
    setPaymentSubmitting(true);

    const amountVal = parseFloat(paymentForm.amount) || 0;
    const discountPercent = parseFloat(paymentForm.discount) || 0;
    const flatDiscount = (amountVal * discountPercent) / 100;
    const dueVal = parseFloat(paymentForm.due) || 0;
    const paidDate = paymentForm.paid_at ? new Date(`${paymentForm.paid_at}T12:00:00.000Z`) : new Date();
    const month = paidDate.getUTCMonth() + 1;
    const year = paidDate.getUTCFullYear();
    const status = deriveStatus(amountVal, flatDiscount, dueVal);

    const payload = {
      student_id: student.id,
      amount: amountVal,
      discount: flatDiscount,
      due_amount: dueVal,
      payment_type: paymentForm.type,
      month,
      year,
      status,
      note: paymentForm.note,
      paid_at: paymentForm.paid_at,
    };

    try {
      const res = editingPaymentId
        ? await fetch(`/api/admin/payments/${editingPaymentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save payment");

      const nextDisc =
        !editingPaymentId && discountPercent > 0
          ? discountPercent.toFixed(1).replace(/\.0$/, "")
          : defaultDiscountPercent;
      if (nextDisc) setDefaultDiscountPercent(nextDisc);
      setEditingPaymentId(null);
      fetchPayments();
      setPaymentForm(blankPaymentForm({ discount: nextDisc || "" }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save payment");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const collectingNow =
    (parseFloat(paymentForm.amount) || 0) -
    ((parseFloat(paymentForm.amount) || 0) * (parseFloat(paymentForm.discount) || 0)) / 100 -
    (parseFloat(paymentForm.due) || 0);

  return (
    <div
      className="flex flex-col gap-6 border-b border-gray-100 bg-slate-50 p-6 dark:border-gray-800 dark:bg-slate-900/50 lg:flex-row"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left: Info + Calendar */}
      <div className="w-full space-y-6 lg:w-[60%] lg:flex-none">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white">
              <Info className="h-4 w-4 text-primary" />
              Student Information
            </h4>
            <button
              type="button"
              onClick={() => {
                if (!isEditingInfo) {
                  setEditStudent({ ...student, password: "" });
                  setSelectedCourseId(student.batch?.course?.id?.toString() || "");
                  setEditBatchId(student.batch?.id?.toString() || "");
                }
                setIsEditingInfo(!isEditingInfo);
              }}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-primary"
            >
              <Edit className="h-3.5 w-3.5" /> {isEditingInfo ? "Cancel Edit" : "Edit"}
            </button>
          </div>

          {isEditingInfo ? (
            <form
              onSubmit={handleStudentUpdate}
              className="flex h-full flex-col rounded-xl bg-gray-50 p-4 dark:bg-gray-900/30"
            >
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={editStudent.student_id || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, student_id: e.target.value })}
                    className={editInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editStudent.name || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                    required
                    className={editInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={editStudent.phone || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value })}
                    required
                    className={editInputClass}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md ring-1 ring-gray-200 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xl font-semibold text-primary shadow-sm">
                        {editStudent.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Profile Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:file:bg-blue-900/40 dark:file:text-blue-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Gender *
                  </label>
                  <select
                    value={editStudent.gender || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, gender: e.target.value })}
                    required
                    className={editInputClass}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editStudent.email || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                    className={editInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Course *
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setEditBatchId("");
                    }}
                    required
                    className={editInputClass}
                  >
                    <option value="" disabled>
                      Select Course
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Batch *
                  </label>
                  <select
                    value={editBatchId}
                    onChange={(e) => setEditBatchId(e.target.value)}
                    required
                    disabled={!selectedCourseId}
                    className={editInputClass}
                  >
                    <option value="" disabled>
                      {selectedCourseId ? "Select Batch" : "Select course first"}
                    </option>
                    {filteredBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    value={editStudent.parent_name || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, parent_name: e.target.value })}
                    className={editInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Parent Phone
                  </label>
                  <input
                    type="text"
                    value={editStudent.parent_phone || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, parent_phone: e.target.value })}
                    className={editInputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editStudent.address || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })}
                    className={editInputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Change Password
                  </label>
                  <input
                    type="text"
                    autoComplete="new-password"
                    value={editStudent.password || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    className={editInputClass}
                  />
                  <p className="mt-1 text-xs text-gray-400">Minimum 6 characters.</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  className="mr-3 cursor-pointer rounded-xl bg-gray-200 px-5 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => {
                    setEditStudent({ ...student, password: "" });
                    setIsEditingInfo(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStudent}
                  className="flex cursor-pointer items-center justify-center rounded-xl bg-primary px-6 py-2 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStudent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {updatingStudent ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Name</span>
                <span className="block truncate font-semibold text-gray-900 dark:text-gray-100" title={student.name}>
                  {student.name}
                </span>
              </div>
              <div className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Student ID</span>
                <span
                  className="block truncate font-mono font-semibold text-gray-900 dark:text-gray-100"
                  title={student.student_id}
                >
                  {student.student_id}
                </span>
              </div>
              <div className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Phone</span>
                <span
                  className="block truncate font-semibold text-gray-900 dark:text-gray-100"
                  title={student.phone || undefined}
                >
                  {student.phone || "—"}
                </span>
              </div>
              <div className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Course</span>
                <span
                  className="block truncate font-semibold text-gray-900 dark:text-gray-100"
                  title={student.batch?.course?.title || undefined}
                >
                  {student.batch?.course?.title || "—"}
                </span>
              </div>
              <div className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Batch</span>
                <span
                  className="block truncate font-semibold text-gray-900 dark:text-gray-100"
                  title={student.batch?.name || undefined}
                >
                  {student.batch?.name || "—"}
                </span>
              </div>
              <div className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Parent</span>
                <span
                  className="block truncate font-semibold text-gray-900 dark:text-gray-100"
                  title={student.parent_name || undefined}
                >
                  {student.parent_name || "—"}
                </span>
              </div>
            </div>
          )}
        </div>

        <StudentExpandedCalendar studentId={student.id} batchId={student.batch?.id} />
      </div>

      {/* Right: Payments */}
      <div className="flex w-full min-w-0 flex-col gap-6 lg:flex-1">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
            {editingPaymentId ? "Edit Payment" : "Quick Payment"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Payment Type *
              </label>
              <select
                value={paymentForm.type}
                onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                className={inputClass}
              >
                <option value="">Select payment type...</option>
                {paymentTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentForm.paid_at}
                onChange={(e) => setPaymentForm({ ...paymentForm, paid_at: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Total / Bill (৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Discount (%)
                  {defaultDiscountPercent ? (
                    <span className="ml-1 font-normal text-emerald-600 dark:text-emerald-400">
                      · default {defaultDiscountPercent}%
                    </span>
                  ) : null}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={paymentForm.discount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, discount: e.target.value })}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Due left (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={paymentForm.due}
                  onChange={(e) => setPaymentForm({ ...paymentForm, due: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 500 if partial"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Partial হলে due লিখুন — পরে <span className="font-semibold text-amber-600">Pay Due</span> দিয়ে
                  আলাদা রেকর্ড হবে
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Note</label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className={inputClass}
                  placeholder="Optional note"
                />
              </div>
            </div>

            {paymentForm.amount && (
              <div className="space-y-1 rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Collecting now</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    ৳{collectingNow.toLocaleString()}
                  </span>
                </div>
                {(parseFloat(paymentForm.due) || 0) > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                    <span>Will remain due</span>
                    <span className="font-semibold">৳{(parseFloat(paymentForm.due) || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {editingPaymentId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPaymentId(null);
                    setPaymentForm(blankPaymentForm());
                  }}
                  className="w-1/3 cursor-pointer rounded-xl bg-gray-200 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                disabled={paymentSubmitting || !paymentForm.type || !paymentForm.amount}
                onClick={submitPayment}
                className={`${editingPaymentId ? "w-2/3" : "w-full"} flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 font-semibold text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {paymentSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingPaymentId ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                {editingPaymentId ? "Update" : "Record Payment"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white">
            History
          </h4>
          {recentPaymentsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No recent payments</div>
          ) : (
            <div className="space-y-0">
              {recentPayments.map((p) => {
                const baseAmount = p.amount || 0;
                const discountAmt = p.discount || 0;
                const dueAmt = p.due_amount || 0;
                const discountPercent =
                  baseAmount > 0 && discountAmt > 0
                    ? ((discountAmt / baseAmount) * 100).toFixed(1).replace(/\.0$/, "")
                    : "0";
                const netPaid = baseAmount - discountAmt - dueAmt;
                const dueSettlement = isDueSettlement(p);

                return (
                  <div
                    key={p.id}
                    className="group -mx-5 flex flex-col justify-between border-b border-gray-100 px-5 py-4 transition-colors last:border-0 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30 sm:flex-row sm:items-start"
                  >
                    <div className="flex-1 pr-4">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {p.payment_type || "Payment"}
                        </span>
                        {dueSettlement && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            Due pay
                          </span>
                        )}
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {formatPaymentMonth(p.year, p.month)}
                        </span>
                        {p.invoice && (
                          <span className="font-mono text-[10px] text-gray-400">#{p.invoice}</span>
                        )}
                      </div>
                      <div className="mb-3 text-xs text-gray-500 dark:text-gray-500">
                        Paid on{" "}
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : new Date(p.created_at).toLocaleDateString()}
                      </div>
                      {p.note && (
                        <div className="mt-2 border-l-2 border-indigo-200 py-0.5 pl-3 text-sm italic text-gray-600 dark:border-indigo-900/50 dark:text-gray-400">
                          {p.note}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-col sm:mt-0 sm:items-end">
                      <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[13px]">
                        {!dueSettlement && (
                          <span className="text-gray-500 dark:text-gray-400">
                            Total: ৳{baseAmount.toLocaleString()}
                          </span>
                        )}
                        {discountAmt > 0 && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            -{discountPercent}%
                          </span>
                        )}
                        <span className="ml-1 border-l-2 border-gray-200 pl-3 font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                          Paid: ৳{(dueSettlement ? baseAmount : netPaid).toLocaleString()}
                        </span>
                      </div>

                      {dueAmt > 0 && !dueSettlement && (
                        <div className="mt-2 flex flex-col items-end gap-1.5">
                          <div className="text-[11px] font-bold text-red-500">Due: ৳{dueAmt.toLocaleString()}</div>
                          <button
                            type="button"
                            onClick={() => setPayDueTarget(p)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-amber-600"
                          >
                            <Wallet className="h-3 w-3" /> Pay Due
                          </button>
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                        {!dueSettlement && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPaymentId(p.id);
                              let discountPercent = "";
                              if (baseAmount > 0 && discountAmt > 0) {
                                discountPercent = ((discountAmt / baseAmount) * 100)
                                  .toFixed(2)
                                  .replace(/\.00$/, "");
                              }
                              setPaymentForm({
                                type: p.payment_type || "",
                                amount: String(p.amount || ""),
                                discount: discountPercent,
                                due: String(p.due_amount || ""),
                                note: p.note || "",
                                paid_at: p.paid_at
                                  ? new Date(p.paid_at).toISOString().split("T")[0]
                                  : new Date().toISOString().split("T")[0],
                              });
                            }}
                            className="flex cursor-pointer items-center gap-1 rounded bg-gray-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(p.id)}
                          className="flex cursor-pointer items-center gap-1 rounded bg-gray-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PayDueModal
        open={Boolean(payDueTarget)}
        payment={payDueTarget}
        onClose={() => setPayDueTarget(null)}
        onSuccess={fetchPayments}
      />
    </div>
  );
}
