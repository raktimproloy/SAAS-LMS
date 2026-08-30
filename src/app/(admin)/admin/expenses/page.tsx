"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Calendar as CalendarIcon, ChevronDown, ChevronRight, TrendingDown, Printer } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site.config";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(n: number | null | undefined) {
  return `৳${(n || 0).toLocaleString()}`;
}

function printExpensesReport(expenses: any[], subtitle: string, instituteName: string) {
  if (!expenses.length) {
    alert("No expenses to print for the selected filters.");
    return;
  }

  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups to print.");
    return;
  }

  const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const rows = expenses
    .map((e) => {
      const date = e.expense_date;
      return `<tr>
        <td>${escapeHtml(date ? new Date(date).toLocaleDateString() : "—")}</td>
        <td>${escapeHtml(e.title || "—")}</td>
        <td>${escapeHtml(e.description || "—")}</td>
        <td>${escapeHtml(e.expended_by || "—")}</td>
        <td>${escapeHtml(e.permitted_by || "—")}</td>
        <td class="right">${escapeHtml(String(e.amount || 0))}</td>
      </tr>`;
    })
    .join("");

  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Expenses Report</title>
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
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(instituteName)} — Expenses Report</h1>
  <div class="sub">${escapeHtml(subtitle)} · Printed ${escapeHtml(new Date().toLocaleString())}</div>
  <div class="summary">
    <span>Records: <strong>${expenses.length}</strong></span>
    <span>Total Amount: <strong>${escapeHtml(formatMoney(totalAmount))}</strong></span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Title</th>
        <th>Description</th>
        <th>Expended By</th>
        <th>Permitted By</th>
        <th class="right">Amount</th>
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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

  // Expanded Groups
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expendedBy, setExpendedBy] = useState("");
  const [permittedBy, setPermittedBy] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [siteName, setSiteName] = useState(siteConfig.instituteName);

  useEffect(() => {
    fetch('/api/admin/content/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_name) setSiteName(data.site_name);
      })
      .catch(console.error);
  }, []);

  const printSubtitle = [
    searchQuery ? `Search: "${searchQuery}"` : "",
    startDate && endDate ? `From: ${startDate} To: ${endDate}` : startDate ? `From: ${startDate}` : endDate ? `To: ${endDate}` : ""
  ].filter(Boolean).join(" | ");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await fetch(`/api/admin/expenses?${params.toString()}`);
      if (res.ok) setExpenses(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, startDate, endDate]);

  const toggleGroup = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, any[]> = {};
    expenses.forEach(e => {
      const d = new Date(e.expense_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
      if (!groups[d]) groups[d] = [];
      groups[d].push(e);
    });
    return groups;
  }, [expenses]);

  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const handleEdit = (e: any) => {
    setEditingExpenseId(e.id);
    setTitle(e.title);
    setDescription(e.description || "");
    setAmount(e.amount.toString());
    setExpendedBy(e.expended_by || "");
    setPermittedBy(e.permitted_by || "");
    setExpenseDate(new Date(e.expense_date).toISOString().split("T")[0]);
    setNote(e.note || "");
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!title || !amount) {
      setFormError("Title and amount are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        amount,
        expended_by: expendedBy,
        permitted_by: permittedBy,
        expense_date: expenseDate,
        note
      };

      const url = editingExpenseId ? `/api/admin/expenses/${editingExpenseId}` : "/api/admin/expenses";
      const method = editingExpenseId ? "PUT" : "POST";

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
        setFormError(data.error || "Failed to save expense");
      }
    } catch (err) {
      setFormError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingExpenseId(null);
    setTitle("");
    setDescription("");
    setAmount("");
    setExpendedBy("");
    setPermittedBy("");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setNote("");
  };

  return (
    <div className="flex flex-col gap-8 pb-10 p-4 sm:p-6" data-aos="fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Expenses</h1>
          <p className="text-muted-foreground">Manage institute expenses and bills.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" className="gap-2 w-full sm:w-auto print:hidden" onClick={() => printExpensesReport(expenses, printSubtitle, siteName)} disabled={loading || expenses.length === 0}>
            <Printer className="h-4 w-4" />
            Print
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-red-600 hover:bg-red-700 shadow-md w-full sm:w-auto print:hidden">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpenseId ? "Edit Expense" : "Add Expense"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {formError && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{formError}</div>}
              
              <div className="space-y-2">
                <Label>Title / Purpose <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Electricity Bill" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount <span className="text-red-500">*</span></Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePicker value={expenseDate} onChange={setExpenseDate} className="w-full h-10 border border-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expended By</Label>
                  <Input value={expendedBy} onChange={(e) => setExpendedBy(e.target.value)} placeholder="Name of person" />
                </div>
                <div className="space-y-2">
                  <Label>Permitted By</Label>
                  <Input value={permittedBy} onChange={(e) => setPermittedBy(e.target.value)} placeholder="Manager/Admin" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingExpenseId ? "Update Expense" : "Add Expense")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-aos="fade-up" data-aos-delay="100">
        <Card className="shadow-sm border-red-100 dark:border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ৳{totalExpenseAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">For selected date range</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <div className="h-4 w-4 text-muted-foreground flex items-center justify-center font-bold text-xs">{expenses.length}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm print:hidden" data-aos="fade-up" data-aos-delay="200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, person..."
                className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion List */}
      <div className="space-y-4" data-aos="fade-up" data-aos-delay="300">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm border-red-100/50 dark:border-red-900/20">
              <div className="bg-red-50/50 dark:bg-red-950/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </Card>
          ))
        ) : Object.keys(groupedExpenses).length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No expenses found.</p>
          </div>
        ) : (
          Object.keys(groupedExpenses).map((date) => {
            const dayExpenses = groupedExpenses[date];
            const isExpanded = expandedDates[date] !== false; // Default expanded
            const dayTotal = dayExpenses.reduce((acc, e) => acc + e.amount, 0);

            return (
              <Card key={date} className="overflow-hidden shadow-sm border-red-100/50 dark:border-red-900/20">
                <div 
                  className="bg-red-50/50 dark:bg-red-950/20 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  onClick={() => toggleGroup(date)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <h3 className="font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-red-500" />
                      {date}
                    </h3>
                    <Badge variant="outline" className="ml-2 font-normal text-red-600 bg-red-100/50 border-red-200 dark:bg-red-900/30 dark:border-red-900">{dayExpenses.length} entries</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-red-600 dark:text-red-400">
                      ৳{dayTotal.toLocaleString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 cursor-pointer gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        printExpensesReport(dayExpenses, `Date: ${date}`, siteName);
                      }}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print day
                    </Button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-red-100 dark:border-red-900/30 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Expended By</TableHead>
                          <TableHead>Permitted By</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right print:hidden">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayExpenses.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium">{e.title}</TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{e.description || "-"}</TableCell>
                            <TableCell>{e.expended_by || "-"}</TableCell>
                            <TableCell>{e.permitted_by || "-"}</TableCell>
                            <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                              ৳{e.amount}
                            </TableCell>
                            <TableCell className="text-right print:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(e)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(e.id)}>
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
