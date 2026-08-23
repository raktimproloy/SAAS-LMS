"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, ReceiptText, Trash2, Search, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight, DollarSign, Users, CreditCard, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FinancialPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState(""); // YYYY-MM
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openStudentPopover, setOpenStudentPopover] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

  // Expanded Groups
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Fields
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentType, setPaymentType] = useState("");
  const [dueAmount, setDueAmount] = useState("0");
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState("paid");
  const [note, setNote] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterMonth) params.append("month", filterMonth);
      if (filterType !== "all") params.append("type", filterType);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const qs = params.toString();

      const [payRes, stuRes, ptRes, sumRes, balRes] = await Promise.all([
        fetch(`/api/admin/payments?${qs}`),
        fetch("/api/admin/students"),
        fetch("/api/admin/settings/payment-types"),
        fetch(`/api/admin/payments/financial-summary?${qs}`),
        fetch(`/api/admin/payments/balance?${qs}`)
      ]);

      if (payRes.ok) setPayments(await payRes.json());
      if (stuRes.ok) setStudents(await stuRes.json());
      if (ptRes.ok) setPaymentTypes(await ptRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
      if (balRes.ok) setBalance(await balRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterType, startDate, endDate, searchQuery]);

  const toggleGroup = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const groupedPayments = useMemo(() => {
    const groups: Record<string, any[]> = {};
    payments.forEach(p => {
      const d = new Date(p.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
      if (!groups[d]) groups[d] = [];
      groups[d].push(p);
    });
    return groups;
  }, [payments]);

  const handleEdit = (p: any) => {
    setEditingPaymentId(p.id);
    setStudentId(p.student_id.toString());
    setAmount(p.amount.toString());
    setDiscount(p.discount?.toString() || "0");
    setPaymentType(p.payment_type || "");
    setDueAmount(p.due_amount.toString());
    setMonth(p.month.toString());
    setYear(p.year.toString());
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
        note
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
        fetchData();
        resetForm();
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to save payment");
      }
    } catch (err) {
      setFormError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingPaymentId(null);
    setStudentId("");
    setAmount("");
    setDiscount("0");
    setPaymentType("");
    setDueAmount("0");
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
    setStatus("paid");
    setNote("");
  };

  const selectedStudentObj = students.find((s) => s.id.toString() === studentId);

  return (
    <div className="flex flex-col gap-8 pb-10" data-aos="fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Financials</h1>
          <p className="text-muted-foreground">Manage payments, invoices, and summaries.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
              <Plus className="h-4 w-4" />
              Collect Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPaymentId ? "Edit Payment" : "Collect Payment"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {formError && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{formError}</div>}
              
              <div className="space-y-2">
                <Label>Student <span className="text-red-500">*</span></Label>
                <Popover open={openStudentPopover} onOpenChange={setOpenStudentPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openStudentPopover}
                      className="w-full justify-between"
                    >
                      {selectedStudentObj
                        ? `${selectedStudentObj.name} (${selectedStudentObj.student_id})`
                        : "Search student..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search student name or ID..." />
                      <CommandList>
                        <CommandEmpty>No student found.</CommandEmpty>
                        <CommandGroup>
                          {students.map((student) => (
                            <CommandItem
                              key={student.id}
                              value={`${student.name} ${student.student_id}`}
                              onSelect={() => {
                                setStudentId(student.id.toString());
                                setOpenStudentPopover(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  studentId === student.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {student.name} ({student.student_id})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Type...</option>
                    {paymentTypes.map(pt => (
                      <option key={pt.id} value={pt.name}>{pt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount <span className="text-red-500">*</span></Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Due Amount</Label>
                  <Input type="number" value={dueAmount} onChange={(e) => setDueAmount(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Month <span className="text-red-500">*</span></Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Year <span className="text-red-500">*</span></Label>
                  <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Status <span className="text-red-500">*</span></Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="due">Due</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any additional notes..." />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingPaymentId ? "Update Payment" : "Collect Payment")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-emerald-100 dark:border-emerald-900/50" data-aos="fade-up" data-aos-delay="100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : (
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
            {loading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">
                ৳{summary?.totalDiscount?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm" data-aos="fade-up" data-aos-delay="300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{summary?.studentCount || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-primary/20 bg-primary/5 dark:bg-primary/10" data-aos="fade-up" data-aos-delay="400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Final Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24 mb-1" /> : (
              <>
                <div className="text-2xl font-bold text-primary">
                  ৳{balance?.balance?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-primary/70">
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
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student, ID, invoice..."
                className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                <option value="2026-08">Aug 2026</option>
                <option value="2026-09">Sep 2026</option>
                <option value="2026-10">Oct 2026</option>
                <option value="2026-11">Nov 2026</option>
                <option value="2026-12">Dec 2026</option>
                <option value="2027-01">Jan 2027</option>
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {paymentTypes.map(pt => (
                  <option key={pt.id} value={pt.name}>{pt.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-8 text-sm" />
                <span className="text-muted-foreground">-</span>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion List */}
      <div className="space-y-4" data-aos="fade-up" data-aos-delay="600">
        {loading ? (
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-slate-100/50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
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
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : Object.keys(groupedPayments).length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No payments found.</p>
          </div>
        ) : (
          Object.keys(groupedPayments).map((date) => {
            const dayPayments = groupedPayments[date];
            const isExpanded = expandedDates[date] !== false; // Default expanded
            const dayTotal = dayPayments.reduce((acc, p) => acc + (p.amount - (p.discount || 0)), 0);

            return (
              <Card key={date} className="overflow-hidden shadow-sm">
                <div 
                  className="bg-slate-100/50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => toggleGroup(date)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <h3 className="font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {date}
                    </h3>
                    <Badge variant="secondary" className="ml-2 font-normal">{dayPayments.length} transactions</Badge>
                  </div>
                  <div className="font-bold text-primary">
                    ৳{dayTotal.toLocaleString()}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
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
                            <TableCell className="font-medium text-xs font-mono">{p.invoice}</TableCell>
                            <TableCell>
                              <div className="font-medium">{p.student?.name}</div>
                              <div className="text-xs text-muted-foreground">{p.student?.student_id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{p.payment_type || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{MONTHS[p.month-1]} {p.year}</div>
                            </TableCell>
                            <TableCell className="text-right">৳{p.amount}</TableCell>
                            <TableCell className="text-right text-orange-500">
                              {p.discount ? `-৳${p.discount}` : "-"}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              ৳{p.amount - (p.discount || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={p.status === "paid" ? "default" : p.status === "partial" ? "secondary" : "destructive"}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(p)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <ReceiptText className="mr-2 h-4 w-4" /> Print Receipt
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p.id)}>
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
