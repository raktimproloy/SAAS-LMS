"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  User, Mail, Phone, MapPin, Calendar, CreditCard, 
  BookOpen, FileText, ArrowLeft, Plus, CheckCircle2, AlertCircle, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceCalendar } from "@/components/student/attendance-calendar";
import { cn } from "@/lib/utils";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "exams" | "attendance" | "payments">("reports");

  // Report modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportType, setReportType] = useState("general");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Payment modal state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentDue, setPaymentDue] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/admin/students/${id}/profile`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      const res = await fetch(`/api/admin/students/${id}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: reportTitle, description: reportDesc, type: reportType }),
      });
      if (res.ok) {
        setIsReportOpen(false);
        setReportTitle("");
        setReportDesc("");
        setReportType("general");
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPayment(true);
    try {
      const res = await fetch(`/api/admin/payments/${editingPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: paymentStatus, 
          due_amount: paymentDue 
        }),
      });
      if (res.ok) {
        setEditingPayment(null);
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading profile...</div>;
  if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPaid = student.payments?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalDue = student.payments?.reduce((sum: number, p: any) => sum + (p.due_amount || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Student Profile</h1>
            <p className="text-muted-foreground">Manage details, attendance, results, and reports for {student.name}</p>
          </div>
        </div>
        
        {/* Custom Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-sm w-full md:w-auto h-12">
          <button
            onClick={() => setActiveTab("reports")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "reports" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "exams" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Exams</span>
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "attendance" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "payments" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payments</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Basic Info Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm dark:bg-slate-800/50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 overflow-hidden border">
                {student.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <CardDescription className="text-base font-medium text-primary">ID: {student.student_id}</CardDescription>
              <div className="flex justify-center mt-2">
                <Badge variant={student.status === "active" ? "default" : "destructive"}>
                  {student.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{student.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{student.address || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span>Batch: {student.batch?.name} ({student.batch?.course?.title})</span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parent Name:</span>
                  <span className="font-medium">{student.parent_name || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parent Phone:</span>
                  <span className="font-medium">{student.parent_phone || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled:</span>
                  <span className="font-medium">{format(new Date(student.enrolled_at), 'dd MMM yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Financials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-xl font-bold text-green-600">৳{totalPaid}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Total Due</p>
                  <p className="text-xl font-bold text-red-600">৳{totalDue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs Content */}
        <div className="md:col-span-2">
            
            {/* REPORTS TAB */}
            {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Student Reports & Remarks</h3>
                <Button size="sm" className="gap-1" onClick={() => setIsReportOpen(true)}><Plus className="w-4 h-4"/> Add Report</Button>
                <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Report</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddReport} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={reportType} onChange={(e) => setReportType(e.target.value)}
                        >
                          <option value="general">General Remark</option>
                          <option value="good">Positive / Good</option>
                          <option value="academic">Academic Warning</option>
                          <option value="disciplinary">Disciplinary Issue</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input required value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="e.g. Excellent performance in recent tests" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea required value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} placeholder="Detailed notes..." rows={4} />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmittingReport}>
                        {isSubmittingReport ? "Saving..." : "Save Report"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {student.reports?.length === 0 ? (
                <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground bg-slate-50 dark:bg-slate-900/20">
                  No reports logged yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {student.reports?.map((report: any) => (
                    <Card key={report.id} className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/30">
                      <CardContent className="p-4 flex gap-4">
                        <div className={`mt-1 rounded-full p-2 h-max ${report.type === 'good' ? 'bg-green-100 text-green-600' : report.type === 'disciplinary' ? 'bg-red-100 text-red-600' : report.type === 'academic' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {report.type === 'good' ? <CheckCircle2 className="w-5 h-5"/> : report.type === 'disciplinary' ? <AlertCircle className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{report.title}</h4>
                            <span className="text-xs text-muted-foreground">{format(new Date(report.created_at), 'dd MMM yyyy')}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{report.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* EXAMS TAB */}
            {activeTab === "exams" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
              <Card className="border-none shadow-sm dark:bg-slate-800/50">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Exam Title</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.exam_results?.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-4">No exams attempted yet</TableCell></TableRow>
                      )}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {student.exam_results?.map((res: any) => {
                        const totalQs = (res.correct_count || 0) + (res.wrong_count || 0) + (res.skipped_count || 0);
                        const accuracy = totalQs > 0 ? Math.round(((res.correct_count || 0) / totalQs) * 100) : 0;
                        return (
                          <TableRow key={res.id}>
                            <TableCell className="text-sm">{format(new Date(res.created_at), 'dd MMM yy')}</TableCell>
                            <TableCell className="font-medium">{res.exam?.title}</TableCell>
                            <TableCell>
                              <Badge variant={res.obtained_marks >= (res.total_marks / 2) ? "default" : "secondary"}>
                                {res.obtained_marks} / {res.total_marks}
                              </Badge>
                            </TableCell>
                            <TableCell>{accuracy}%</TableCell>
                            <TableCell>{res.rank ? `#${res.rank}` : "N/A"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === "attendance" && (
            <div className="space-y-6">
              <AttendanceCalendar 
                attendanceData={student.attendance || []} 
                reports={student.reports || []}
                studentId={student.id}
                readOnly={false}
              />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Attendance History</h3>
                <Card className="border-none shadow-sm dark:bg-slate-800/50">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.attendance?.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center py-4">No attendance records found</TableCell></TableRow>
                      )}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {student.attendance?.map((att: any) => (
                        <TableRow key={att.id}>
                          <TableCell className="font-medium">{format(new Date(att.date), 'dd MMM yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant={att.status === 'present' ? 'default' : att.status === 'absent' ? 'destructive' : 'secondary'}>
                              {att.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{att.note || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
              </div>
            </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Payment History</h3>
              <Card className="border-none shadow-sm dark:bg-slate-800/50">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Type & Month</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Net & Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.payments?.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center py-4">No payment records found</TableCell></TableRow>
                      )}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {student.payments?.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium font-mono text-xs">{payment.invoice || "N/A"}</TableCell>
                          <TableCell>
                            <div>{payment.payment_type || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{payment.month}/{payment.year}</div>
                          </TableCell>
                          <TableCell>৳{payment.amount}</TableCell>
                          <TableCell className="text-orange-500">{payment.discount ? `-৳${payment.discount}` : "-"}</TableCell>
                          <TableCell>
                            <div className="font-semibold text-emerald-600">৳{payment.amount - (payment.discount || 0)}</div>
                            {payment.due_amount > 0 && <div className="text-xs text-red-600">Due: ৳{payment.due_amount}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'due' ? 'destructive' : 'secondary'}>
                              {payment.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditingPayment(payment);
                              setPaymentStatus(payment.status);
                              setPaymentDue(payment.due_amount.toString());
                            }}>Manage</Button>
                            <Dialog open={editingPayment?.id === payment.id} onOpenChange={(open) => {
                              if (!open) setEditingPayment(null);
                            }}>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Payment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdatePayment} className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Amount Paid</Label>
                                      <Input disabled value={`৳${payment.amount}`} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Month/Year</Label>
                                      <Input disabled value={`${payment.month}/${payment.year}`} />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Due Amount (৳)</Label>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      value={paymentDue} 
                                      onChange={(e) => setPaymentDue(e.target.value)} 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select 
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                      value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
                                    >
                                      <option value="paid">Paid</option>
                                      <option value="partial">Partial</option>
                                      <option value="due">Due</option>
                                    </select>
                                  </div>
                                  <Button type="submit" className="w-full" disabled={isSubmittingPayment}>
                                    {isSubmittingPayment ? "Updating..." : "Update Payment"}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
