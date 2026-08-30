"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Pencil,
  ReceiptText,
  Trash2,
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Users,
  CreditCard,
  MoreHorizontal,
  Printer,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site.config";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

type Course = { id: number; title: string };
type Batch = { id: number; name: string; course?: Course; course_id?: number };
type Student = {
  id: number;
  name: string;
  student_id: string;
  batch?: Batch | null;
  batch_id?: number | null;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payment = any;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(n: number) {
  return `৳${(n || 0).toLocaleString()}`;
}

function printPaymentsReport(payments: Payment[], subtitle: string, instituteName: string) {
  if (!payments.length) {
    alert("No payments to print for the selected filters.");
    return;
  }

  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups to print.");
    return;
  }

  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalDiscount = payments.reduce((s, p) => s + (p.discount || 0), 0);
  const totalNet = totalAmount - totalDiscount;
  const totalDue = payments.reduce((s, p) => s + (p.due_amount || 0), 0);

  const rows = payments
    .map((p) => {
      const net = (p.amount || 0) - (p.discount || 0);
      const date = p.paid_at || p.created_at;
      return `<tr>
        <td>${escapeHtml(p.invoice || `#${p.id}`)}</td>
        <td>${escapeHtml(p.student?.name || "—")}<br/><span class="muted">${escapeHtml(p.student?.student_id || "")}</span></td>
        <td>${escapeHtml(p.payment_type || "—")}</td>
        <td>${escapeHtml(MONTHS[(p.month || 1) - 1] || "")} ${p.year || ""}</td>
        <td>${escapeHtml(date ? new Date(date).toLocaleDateString() : "—")}</td>
        <td class="right">${escapeHtml(String(p.amount || 0))}</td>
        <td class="right">${escapeHtml(String(p.discount || 0))}</td>
        <td class="right">${escapeHtml(String(net))}</td>
        <td class="right">${escapeHtml(String(p.due_amount || 0))}</td>
        <td>${escapeHtml(p.status || "")}</td>
      </tr>`;
    })
    .join("");

  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payments Report</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #111; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .sub { color: #555; font-size: 13px; margin-bottom: 16px; }
    .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; font-size: 13px; }
    .summary span { background: #f3f4f6; padding: 6px 10px; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .right { text-align: right; }
    .muted { color: #777; font-size: 11px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(instituteName)} — Payments Report</h1>
  <div class="sub">${escapeHtml(subtitle)} · Printed ${escapeHtml(new Date().toLocaleString())}</div>
  <div class="summary">
    <span>Records: <strong>${payments.length}</strong></span>
    <span>Amount: <strong>${escapeHtml(formatMoney(totalAmount))}</strong></span>
    <span>Discount: <strong>${escapeHtml(formatMoney(totalDiscount))}</strong></span>
    <span>Net: <strong>${escapeHtml(formatMoney(totalNet))}</strong></span>
    <span>Due: <strong>${escapeHtml(formatMoney(totalDue))}</strong></span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Invoice</th>
        <th>Student</th>
        <th>Type</th>
        <th>Month</th>
        <th>Date</th>
        <th class="right">Amount</th>
        <th class="right">Discount</th>
        <th class="right">Net</th>
        <th class="right">Due</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="no-print" style="margin-top:20px;text-align:center">
    <button onclick="window.print()" style="padding:10px 20px;cursor:pointer;background:#111;color:#fff;border:none;border-radius:6px">Print</button>
  </div>
  <script>setTimeout(function(){ window.print(); }, 300);</script>
</body>
</html>`);
  win.document.close();
}

function printSingleReceipt(p: Payment, instituteName: string) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups to print.");
    return;
  }
  const net = (p.amount || 0) - (p.discount || 0);
  const date = p.paid_at || p.created_at;
  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${escapeHtml(p.invoice || String(p.id))}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 32px; color: #222; }
    .box { max-width: 520px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; padding: 28px; }
    h2 { margin: 0 0 4px; text-align: center; }
    .sub { text-align: center; color: #666; margin-bottom: 20px; font-size: 13px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; font-size: 14px; }
    .total { font-size: 18px; font-weight: 700; margin-top: 12px; border-top: 2px solid #222; padding-top: 12px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="box">
    <h2>${escapeHtml(instituteName)}</h2>
    <div class="sub">Payment Receipt</div>
    <div class="row"><span>Invoice</span><strong>${escapeHtml(p.invoice || `#${p.id}`)}</strong></div>
    <div class="row"><span>Student</span><strong>${escapeHtml(p.student?.name || "—")} (${escapeHtml(p.student?.student_id || "")})</strong></div>
    <div class="row"><span>Type</span><strong>${escapeHtml(p.payment_type || "—")}</strong></div>
    <div class="row"><span>Month</span><strong>${escapeHtml(MONTHS[(p.month || 1) - 1] || "")} ${p.year || ""}</strong></div>
    <div class="row"><span>Date</span><strong>${escapeHtml(date ? new Date(date).toLocaleDateString() : "—")}</strong></div>
    <div class="row"><span>Amount</span><strong>${escapeHtml(formatMoney(p.amount || 0))}</strong></div>
    <div class="row"><span>Discount</span><strong>${escapeHtml(formatMoney(p.discount || 0))}</strong></div>
    <div class="row"><span>Due</span><strong>${escapeHtml(formatMoney(p.due_amount || 0))}</strong></div>
    <div class="row"><span>Status</span><strong>${escapeHtml(p.status || "")}</strong></div>
    ${p.note ? `<div class="row"><span>Note</span><strong>${escapeHtml(p.note)}</strong></div>` : ""}
    <div class="row total"><span>Net Paid</span><span>${escapeHtml(formatMoney(net))}</span></div>
  </div>
  <div class="no-print" style="text-align:center;margin-top:16px">
    <button onclick="window.print()" style="padding:10px 20px;cursor:pointer;background:#111;color:#fff;border:none;border-radius:6px">Print</button>
  </div>
  <script>setTimeout(function(){ window.print(); }, 300);</script>
</body>
</html>`);
  win.document.close();
}

function buildMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({
      value,
      label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    });
  }
  return options;
}

export default function FinancialPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<{ id: number; name: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState(siteConfig.instituteName);

  useEffect(() => {
    fetch('/api/admin/content/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_name) setSiteName(data.site_name);
      })
      .catch(console.error);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Cascading selection
  const [formCourseId, setFormCourseId] = useState("");
  const [formBatchId, setFormBatchId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentType, setPaymentType] = useState("");
  const [dueAmount, setDueAmount] = useState("0");
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("paid");
  const [note, setNote] = useState("");

  const monthOptions = useMemo(() => buildMonthOptions(), []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCourses)
      .catch(console.error);
    fetch("/api/admin/batches")
      .then((r) => (r.ok ? r.json() : []))
      .then(setBatches)
      .catch(console.error);
    fetch("/api/admin/settings/payment-types")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPaymentTypes)
      .catch(console.error);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterMonth) params.append("month", filterMonth);
      if (filterType !== "all") params.append("type", filterType);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const qs = params.toString();
      const [payRes, stuRes, sumRes, balRes] = await Promise.all([
        fetch(`/api/admin/payments?${qs}`),
        fetch("/api/admin/students"),
        fetch(`/api/admin/payments/financial-summary?${qs}`),
        fetch(`/api/admin/payments/balance?${qs}`),
      ]);

      if (payRes.ok) setPayments(await payRes.json());
      if (stuRes.ok) setStudents(await stuRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
      if (balRes.ok) setBalance(await balRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterMonth, filterType, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formBatches = useMemo(
    () => batches.filter((b) => String(b.course?.id ?? b.course_id) === formCourseId),
    [batches, formCourseId]
  );

  const formStudents = useMemo(() => {
    if (!formBatchId) return [];
    const q = studentSearch.trim().toLowerCase();
    return students
      .filter((s) => String(s.batch?.id ?? s.batch_id) === formBatchId)
      .filter((s) => {
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.student_id.toLowerCase().includes(q)
        );
      });
  }, [students, formBatchId, studentSearch]);

  const selectedStudent = students.find((s) => s.id.toString() === studentId);

  const toggleGroup = (date: string) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const groupedPayments = useMemo(() => {
    const groups: Record<string, Payment[]> = {};
    payments.forEach((p) => {
      const d = new Date(p.paid_at || p.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!groups[d]) groups[d] = [];
      groups[d].push(p);
    });
    return groups;
  }, [payments]);

  const resetForm = () => {
    setEditingPaymentId(null);
    setFormCourseId("");
    setFormBatchId("");
    setStudentId("");
    setStudentSearch("");
    setAmount("");
    setDiscount("0");
    setPaymentType("");
    setDueAmount("0");
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
    setPaidAt(new Date().toISOString().split("T")[0]);
    setStatus("paid");
    setNote("");
    setFormError("");
  };

  const handleEdit = (p: Payment) => {
    setEditingPaymentId(p.id);
    const courseId = p.student?.batch?.course?.id?.toString() || "";
    const batchId = p.student?.batch?.id?.toString() || "";
    setFormCourseId(courseId);
    setFormBatchId(batchId);
    setStudentId(p.student_id.toString());
    setStudentSearch("");
    setAmount(p.amount.toString());
    setDiscount(p.discount?.toString() || "0");
    setPaymentType(p.payment_type || "");
    setDueAmount(p.due_amount?.toString() || "0");
    setMonth(p.month.toString());
    setYear(p.year.toString());
    setPaidAt(
      p.paid_at
        ? new Date(p.paid_at).toISOString().split("T")[0]
        : new Date(p.created_at).toISOString().split("T")[0]
    );
    setStatus(p.status);
    setNote(p.note || "");
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    try {
      const res = await fetch(`/api/admin/payments/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formCourseId) {
      setFormError("Please select a course.");
      return;
    }
    if (!formBatchId) {
      setFormError("Please select a batch.");
      return;
    }
    if (!studentId || !amount || !month || !year || !status) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        student_id: studentId,
        amount,
        discount,
        payment_type: paymentType,
        due_amount: dueAmount,
        month,
        year,
        status,
        note,
        paid_at: paidAt,
      };

      const url = editingPaymentId ? `/api/admin/payments/${editingPaymentId}` : "/api/admin/payments";
      const method = editingPaymentId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to save payment");
      }
    } catch {
      setFormError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const printSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (startDate && endDate) parts.push(`${startDate} to ${endDate}`);
    else if (startDate) parts.push(`From ${startDate}`);
    else if (endDate) parts.push(`Until ${endDate}`);
    if (filterMonth) {
      const [y, m] = filterMonth.split("-");
      parts.push(`${MONTHS[parseInt(m, 10) - 1]} ${y}`);
    }
    if (filterType !== "all") parts.push(`Type: ${filterType}`);
    if (debouncedSearch) parts.push(`Search: ${debouncedSearch}`);
    return parts.length ? parts.join(" · ") : "All payments";
  }, [startDate, endDate, filterMonth, filterType, debouncedSearch]);

  const collectingNow =
    (parseFloat(amount) || 0) - (parseFloat(discount) || 0) - (parseFloat(dueAmount) || 0);

  return (
    <div className="flex flex-col gap-8 pb-10" data-aos="fade-up">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-aos="fade-down">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Financials</h1>
          <p className="text-muted-foreground">Manage payments, invoices, and summaries.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="cursor-pointer gap-2"
            onClick={() => printPaymentsReport(payments, printSubtitle, siteName)}
            disabled={loading || payments.length === 0}
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button
            className="cursor-pointer gap-2 bg-primary shadow-md hover:bg-primary/90"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Collect Payment
          </Button>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingPaymentId ? "Edit Payment" : "Collect Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {formError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Course <span className="text-red-500">*</span>
                </Label>
                <select
                  className={selectClass}
                  value={formCourseId}
                  onChange={(e) => {
                    setFormCourseId(e.target.value);
                    setFormBatchId("");
                    setStudentId("");
                    setStudentSearch("");
                  }}
                  required
                >
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  Batch <span className="text-red-500">*</span>
                </Label>
                <select
                  className={selectClass}
                  value={formBatchId}
                  onChange={(e) => {
                    setFormBatchId(e.target.value);
                    setStudentId("");
                    setStudentSearch("");
                  }}
                  required
                  disabled={!formCourseId}
                >
                  <option value="">{formCourseId ? "Select batch..." : "Select course first"}</option>
                  {formBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Student <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder={formBatchId ? "Search student by name or ID..." : "Select batch first"}
                  className="pl-9"
                  disabled={!formBatchId}
                />
              </div>
              <select
                className={cn(selectClass, "mt-2")}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                disabled={!formBatchId}
                size={Math.min(6, Math.max(3, formStudents.length || 3))}
              >
                <option value="">
                  {!formBatchId
                    ? "Select batch first"
                    : formStudents.length === 0
                      ? "No students in this batch"
                      : "Select student..."}
                </option>
                {formStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.student_id})
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedStudent.name}</span> ·{" "}
                  {selectedStudent.student_id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select type...</option>
                  {paymentTypes.map((pt) => (
                    <option key={pt.id} value={pt.name}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>
                  Payment Date <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  value={paidAt}
                  onChange={(d) => {
                    setPaidAt(d);
                    if (d) {
                      const dt = new Date(`${d}T12:00:00`);
                      setMonth(String(dt.getMonth() + 1));
                      setYear(String(dt.getFullYear()));
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Amount (৳) <span className="text-red-500">*</span>
                </Label>
                <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Discount (৳)</Label>
                <Input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Amount (৳)</Label>
                <Input type="number" min="0" value={dueAmount} onChange={(e) => setDueAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>
                  Status <span className="text-red-500">*</span>
                </Label>
                <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="due">Due</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Month <span className="text-red-500">*</span>
                </Label>
                <select className={selectClass} value={month} onChange={(e) => setMonth(e.target.value)}>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>
                  Year <span className="text-red-500">*</span>
                </Label>
                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any additional notes..." />
            </div>

            {amount && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/40">
                <div className="flex justify-between">
                  <span className="text-emerald-800 dark:text-emerald-200">Collecting now</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    ৳{collectingNow.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Saving..." : editingPaymentId ? "Update Payment" : "Collect Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100 shadow-sm dark:border-emerald-900/50" data-aos="fade-up" data-aos-delay="100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ৳{summary?.netCollected?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total collected - discount</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm" data-aos="fade-up" data-aos-delay="200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">৳{summary?.totalDiscount?.toLocaleString() || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm" data-aos="fade-up" data-aos-delay="300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.studentCount || 0}</div>}
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5 shadow-sm dark:bg-primary/10" data-aos="fade-up" data-aos-delay="400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Final Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mb-1 h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">৳{balance?.balance?.toLocaleString() || 0}</div>
                <p className="mt-1 text-xs text-primary/70 text-muted-foreground">
                  Net Collection (৳{balance?.netCollected || 0}) - Expenses (৳{balance?.totalExpense || 0})
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm" data-aos="fade-up" data-aos-delay="500">
        <CardContent className="p-4">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <div className="relative w-full flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, ID, invoice..."
                className="border-slate-200 bg-slate-50 pl-9 dark:border-slate-800 dark:bg-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {monthOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {paymentTypes.map((pt) => (
                  <option key={pt.id} value={pt.name}>
                    {pt.name}
                  </option>
                ))}
              </select>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-10 cursor-pointer gap-1.5"
                onClick={() => printPaymentsReport(payments, printSubtitle, siteName)}
                disabled={loading || payments.length === 0}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              {(startDate || endDate || filterMonth || filterType !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 cursor-pointer"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setFilterMonth("");
                    setFilterType("all");
                    setSearchQuery("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          {(startDate || endDate) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Printing / filtering by date range:{" "}
              <span className="font-medium text-foreground">
                {startDate || "…"} → {endDate || "…"}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Accordion List */}
      <div className="space-y-4" data-aos="fade-up" data-aos-delay="600">
        {loading ? (
          <Card className="overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b bg-slate-100/50 px-4 py-3 dark:bg-slate-800/50">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 dark:bg-slate-900/50 dark:hover:bg-slate-900/50">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type & Month</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : Object.keys(groupedPayments).length === 0 ? (
          <div className="rounded-lg border border-dashed bg-slate-50 py-10 text-center dark:bg-slate-900">
            <p className="text-muted-foreground">No payments found.</p>
          </div>
        ) : (
          Object.keys(groupedPayments).map((date) => {
            const dayPayments = groupedPayments[date];
            const isExpanded = expandedDates[date] !== false;
            const dayTotal = dayPayments.reduce((acc, p) => acc + (p.amount - (p.discount || 0)), 0);

            return (
              <Card key={date} className="overflow-hidden shadow-sm">
                <div
                  className="flex cursor-pointer items-center justify-between bg-slate-100/50 px-4 py-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                  onClick={() => toggleGroup(date)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <h3 className="flex items-center gap-2 font-medium">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {date}
                    </h3>
                    <Badge variant="secondary" className="ml-2 font-normal">
                      {dayPayments.length} transactions
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-primary">৳{dayTotal.toLocaleString()}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 cursor-pointer gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        printPaymentsReport(dayPayments, `Date: ${date}`, siteName);
                      }}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print day
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="overflow-x-auto border-t">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 dark:bg-slate-900/50 dark:hover:bg-slate-900/50">
                          <TableHead>Invoice</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Type & Month</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-mono text-xs font-medium">{p.invoice}</TableCell>
                            <TableCell>
                              <div className="max-w-[160px] truncate font-medium" title={p.student?.name}>
                                {p.student?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">{p.student?.student_id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{p.payment_type || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">
                                {MONTHS[p.month - 1]} {p.year}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">৳{p.amount}</TableCell>
                            <TableCell className="text-right text-orange-500">
                              {p.discount ? `-৳${p.discount}` : "-"}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              ৳{p.amount - (p.discount || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  p.status === "paid" ? "default" : p.status === "partial" ? "secondary" : "destructive"
                                }
                              >
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => handleEdit(p)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => printSingleReceipt(p, siteName)}
                                  >
                                    <ReceiptText className="mr-2 h-4 w-4" /> Print Receipt
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() => handleDelete(p.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
