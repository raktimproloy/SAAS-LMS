"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, ReceiptText, Trash2, AlertTriangle, Printer, Search } from "lucide-react";
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

// Types
interface Course {
  id: number;
  title: string;
  fee: number | null;
  discount_fee: number | null;
}

interface Batch {
  id: number;
  name: string;
  course: Course;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  phone: string;
  batch: Batch;
}

interface Payment {
  id: number;
  amount: number;
  due_amount: number;
  month: number;
  year: number;
  status: string;
  receipt_number: string | null;
  paid_at: string | null;
  note: string | null;
  student: Student;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

  // Fields
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState("due");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [note, setNote] = useState("");
  const [totalFee, setTotalFee] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  // Actions states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);
  
  // Receipt Modal
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, stuRes] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/admin/students")
      ]);
      
      if (payRes.ok) setPayments(await payRes.json());
      if (stuRes.ok) setStudents(await stuRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateReceiptNumber = () => {
    const d = new Date();
    return `RCPT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const getStudentTotalFee = (stuId: string) => {
    const student = students.find(s => s.id.toString() === stuId);
    if (!student) return 0;
    const course = student.batch?.course;
    if (!course) return 0;
    return course.discount_fee ?? course.fee ?? 0;
  };

  const handleStudentChange = (val: string) => {
    setStudentId(val);
    const fee = getStudentTotalFee(val);
    setTotalFee(fee);
    setDueAmount(fee.toString());
    setAmount("0");
    setStatus("due");
    setReceiptNumber(generateReceiptNumber());
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const paid = parseFloat(val) || 0;
    const due = Math.max(0, totalFee - paid);
    setDueAmount(due.toString());
    
    if (paid >= totalFee && totalFee > 0) {
      setStatus("paid");
    } else if (paid > 0) {
      setStatus("partial");
    } else {
      setStatus("due");
    }
  };

  const resetForm = () => {
    setStudentId("");
    setAmount("");
    setDueAmount("");
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
    setStatus("due");
    setReceiptNumber("");
    setNote("");
    setTotalFee(0);
    setEditingPaymentId(null);
    setFormError("");
  };

  const handleAddClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (payment: Payment) => {
    resetForm();
    setEditingPaymentId(payment.id);
    setStudentId(payment.student.id.toString());
    const fee = getStudentTotalFee(payment.student.id.toString());
    setTotalFee(fee);
    setAmount(payment.amount.toString());
    setDueAmount(payment.due_amount.toString());
    setMonth(payment.month.toString());
    setYear(payment.year.toString());
    setStatus(payment.status);
    setReceiptNumber(payment.receipt_number || "");
    setNote(payment.note || "");
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setPaymentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    try {
      const res = await fetch(`/api/admin/payments/${paymentToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete payment");
      setIsDeleteDialogOpen(false);
      setPaymentToDelete(null);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete payment");
    }
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedReceipt(payment);
    setIsReceiptOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = editingPaymentId ? `/api/admin/payments/${editingPaymentId}` : "/api/admin/payments";
      const method = editingPaymentId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId, amount, due_amount: dueAmount,
          month, year, status, receipt_number: receiptNumber, note
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save payment");

      setIsDialogOpen(false);
      fetchData();
      
      // Auto show receipt on new payment
      if (!editingPaymentId && data.data) {
        const studentInfo = students.find(s => s.id.toString() === studentId);
        if (studentInfo) {
          const receiptData = { ...data.data, student: studentInfo };
          setSelectedReceipt(receiptData);
          setIsReceiptOpen(true);
        }
      }
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

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchBatch = batchFilter === "all" || p.student?.batch?.id?.toString() === batchFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = q === "" || 
        p.student?.name?.toLowerCase().includes(q) || 
        p.student?.student_id?.toLowerCase().includes(q) ||
        p.receipt_number?.toLowerCase().includes(q);
      
      return matchStatus && matchBatch && matchSearch;
    });
  }, [payments, statusFilter, batchFilter, searchQuery]);

  const uniqueBatches = useMemo(() => {
    const batchesMap = new Map();
    students.forEach(s => {
      if (s.batch) {
        batchesMap.set(s.batch.id, s.batch.name);
      }
    });
    return Array.from(batchesMap.entries());
  }, [students]);

  return (
    <>
      <div className="flex flex-col gap-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
            <p className="text-muted-foreground mt-1">Record and track student payments and dues.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {/* @ts-expect-error - Radix UI type mismatch for asChild */}
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleAddClick}>
                <Plus className="h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPaymentId ? "Edit Payment" : "Record New Payment"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="student">Student</Label>
                    <select 
                      id="student" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={studentId} 
                      onChange={(e) => handleStudentChange(e.target.value)} 
                      required
                    >
                      <option value="">Select Student...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.student_id} - {s.name} ({s.batch?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border flex justify-between items-center">
                      <span className="text-sm font-medium">Total Course Fee:</span>
                      <span className="text-lg font-bold text-primary">৳ {totalFee.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="month">For Month</Label>
                    <select 
                      id="month" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={month} 
                      onChange={(e) => setMonth(e.target.value)} 
                      required
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">For Year</Label>
                    <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Paid Amount (৳)</Label>
                    <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => handleAmountChange(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due">Due Amount (৳)</Label>
                    <Input id="due" type="number" step="0.01" value={dueAmount} onChange={(e) => setDueAmount(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Payment Status</Label>
                    <select 
                      id="status" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)} 
                      required
                    >
                      <option value="paid">Full Paid</option>
                      <option value="partial">Partial Paid</option>
                      <option value="due">Due</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt">Receipt Number</Label>
                    <Input id="receipt" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="note">Internal Note (Optional)</Label>
                    <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Recording..." : (editingPaymentId ? "Update Payment" : "Record Payment")}
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
                  Are you sure you want to delete this payment record? This action cannot be undone and will affect accounting records.
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

          <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader className="flex flex-row items-center justify-between pb-2">
                <DialogTitle>View Receipt</DialogTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </DialogHeader>
              {selectedReceipt && (
                <div className="p-6 bg-white dark:bg-slate-950 border rounded-lg receipt-container shadow-sm mt-2">
                  <div className="text-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Doctor Biology</h2>
                    <p className="text-sm text-slate-500">Official Payment Receipt</p>
                  </div>
                  
                  <div className="flex justify-between mb-8 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Receipt No:</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedReceipt.receipt_number || `REC-${selectedReceipt.id}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 mb-1">Date:</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedReceipt.paid_at ? new Date(selectedReceipt.paid_at).toLocaleDateString() : new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded p-4 mb-6 text-sm">
                    <div className="grid grid-cols-2 gap-y-3">
                      <div className="text-slate-500">Student Name:</div>
                      <div className="font-semibold">{selectedReceipt.student?.name}</div>
                      
                      <div className="text-slate-500">Student ID:</div>
                      <div className="font-semibold">{selectedReceipt.student?.student_id}</div>
                      
                      <div className="text-slate-500">Batch / Course:</div>
                      <div className="font-semibold">{selectedReceipt.student?.batch?.name}</div>
                      
                      <div className="text-slate-500">Payment For:</div>
                      <div className="font-semibold">{MONTHS[selectedReceipt.month - 1]} {selectedReceipt.year}</div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Total Paid Amount:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-500">৳ {selectedReceipt.amount.toFixed(2)}</span>
                    </div>
                    {selectedReceipt.due_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Remaining Due:</span>
                        <span className="text-lg font-medium text-red-500">৳ {selectedReceipt.due_amount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-xs text-slate-400 mt-8 italic border-t pt-4">
                    This is a computer-generated receipt and does not require a physical signature.
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm dark:bg-slate-800/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Recent Payments</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by ID, Name or Receipt..." 
                    className="pl-9 w-[250px] bg-background" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Full Paid</option>
                  <option value="partial">Partial Paid</option>
                  <option value="due">Due</option>
                </select>
                <select 
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                >
                  <option value="all">All Batches</option>
                  {uniqueBatches.map(([id, name]) => (
                    <option key={id} value={id.toString()}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
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
                        <TableHead>Student</TableHead>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Receipt No</TableHead>
                        <TableHead>Paid (৳)</TableHead>
                        <TableHead>Due (৳)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900 dark:text-slate-100">{payment.student?.name}</span>
                              <span className="text-xs font-mono text-muted-foreground">{payment.student?.student_id} • {payment.student?.batch?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{MONTHS[payment.month - 1]}</span>
                              <span className="text-xs text-muted-foreground">{payment.year}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.receipt_number || "-"}
                          </TableCell>
                          <TableCell className="font-semibold text-green-600 dark:text-green-400">
                            {payment.amount}
                          </TableCell>
                          <TableCell className={payment.due_amount > 0 ? "text-red-500 font-semibold" : ""}>
                            {payment.due_amount}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.status === "paid" ? "default" : payment.status === "partial" ? "secondary" : "destructive"}>
                              {payment.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="View Receipt" onClick={() => handleViewReceipt(payment)}>
                                <ReceiptText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(payment)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(payment.id)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPayments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No payments found matching criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {filteredPayments.length > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredPayments.length} results
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Printable Receipt Area (Only visible when printing) */}
      <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white z-[99999] print:p-8">
        {selectedReceipt && (
          <div className="max-w-2xl mx-auto font-sans text-black">
            <div className="text-center mb-8 border-b-2 border-black pb-6">
              <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1">Doctor Biology</h1>
              <p className="text-lg text-gray-600">Official Payment Receipt</p>
            </div>
            
            <div className="flex justify-between mb-10 text-lg">
              <div>
                <p className="text-gray-500 mb-1 text-sm uppercase font-semibold">Receipt No</p>
                <p className="font-bold">{selectedReceipt.receipt_number || `REC-${selectedReceipt.id}`}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 mb-1 text-sm uppercase font-semibold">Date</p>
                <p className="font-bold">
                  {selectedReceipt.paid_at ? new Date(selectedReceipt.paid_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-10 text-lg">
              <div className="grid grid-cols-2 gap-y-6">
                <div className="text-gray-600">Student Name:</div>
                <div className="font-bold">{selectedReceipt.student?.name}</div>
                
                <div className="text-gray-600">Student ID:</div>
                <div className="font-bold">{selectedReceipt.student?.student_id}</div>
                
                <div className="text-gray-600">Batch / Course:</div>
                <div className="font-bold">{selectedReceipt.student?.batch?.name}</div>
                
                <div className="text-gray-600">Payment For:</div>
                <div className="font-bold">{MONTHS[selectedReceipt.month - 1]} {selectedReceipt.year}</div>
              </div>
            </div>

            <div className="border-t-2 border-black pt-6 mb-12">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total Paid Amount:</span>
                <span className="text-3xl font-extrabold text-black">৳ {selectedReceipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-600">Payment Status:</span>
                <span className="text-lg font-bold uppercase">{selectedReceipt.status}</span>
              </div>
              {selectedReceipt.due_amount > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg text-gray-600">Remaining Due:</span>
                  <span className="text-xl font-bold text-gray-800">৳ {selectedReceipt.due_amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-32">
              <div className="w-48 mx-auto border-t border-black pt-2 text-sm text-gray-800">
                Authorized Signature
              </div>
              <div className="mt-12 text-sm text-gray-500 italic">
                Thank you for your payment. This is a computer-generated receipt.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
