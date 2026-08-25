import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, FileText, Plus, Loader2, Trophy, Activity, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DayDetails = {
  date: Date;
  attendance?: "present" | "absent" | "late";
  reports?: Array<any>;
  exam?: { title: string; time: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results?: Array<any>;
  notice?: { title: string };
};

interface DayDetailsModalProps {
  details: DayDetails | null;
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  studentId?: number;
  batchId?: number | null;
  onReportAdded?: () => void;
  onAttendanceUpdated?: () => void;
}

export function DayDetailsModal({
  details,
  isOpen,
  onClose,
  readOnly = true,
  studentId,
  batchId,
  onReportAdded,
  onAttendanceUpdated,
}: DayDetailsModalProps) {
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<"present" | "absent" | "late">("present");
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  useEffect(() => {
    if (details?.attendance) {
      setAttendanceStatus(details.attendance);
    } else {
      setAttendanceStatus("present");
    }
  }, [details]);

  if (!details) return null;

  const hasAttendanceRecord = Boolean(details.attendance);

  const handleSaveAttendance = async () => {
    if (!studentId || !batchId) return;
    setIsSavingAttendance(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/attendance-summary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(details.date, "yyyy-MM-dd"),
          status: attendanceStatus,
          batch_id: batchId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update attendance");
      }
      onAttendanceUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update attendance");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleAddReport = async () => {
    if (!reportTitle || !reportDesc || !studentId) return;
    
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/students/${studentId}/reports/by-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reportTitle,
          description: reportDesc,
          type: "general",
          date: format(details.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        })
      });
      
      if (res.ok) {
        setReportTitle("");
        setReportDesc("");
        setIsAddingReport(false);
        if (onReportAdded) onReportAdded();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsAddingReport(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl sm:rounded-2xl border-0 overflow-hidden">
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 sm:p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                <CalendarDays className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-300 mb-0.5">Daily Log</span>
                {format(details.date, "MMMM d, yyyy")}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900">
          {/* Attendance Section */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                details.attendance === "present" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" :
                details.attendance === "absent" ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" :
                details.attendance === "late" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" :
                "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              }`}>
                {details.attendance === "present" ? <CheckCircle2 className="h-7 w-7" /> :
                 details.attendance === "absent" ? <XCircle className="h-7 w-7" /> :
                 details.attendance === "late" ? <Clock className="h-7 w-7" /> :
                 <Activity className="h-7 w-7" />}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Attendance Status</h4>
                <p className="text-sm font-medium uppercase tracking-wider mt-0.5 text-slate-500 dark:text-slate-400">
                  {hasAttendanceRecord ? details.attendance : "No Record Found"}
                </p>
              </div>
            </div>
            
            {!readOnly && batchId ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                  {hasAttendanceRecord ? "Update Status" : "Mark Attendance"}
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    className="flex-1 h-10 rounded-xl border border-input bg-white dark:bg-slate-950 px-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    value={attendanceStatus}
                    onChange={(e) =>
                      setAttendanceStatus(e.target.value as "present" | "absent" | "late")
                    }
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                  <Button
                    className="w-full sm:w-auto h-10 rounded-xl font-semibold"
                    onClick={handleSaveAttendance}
                    disabled={isSavingAttendance}
                  >
                    {isSavingAttendance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Results Section */}
          {details.results && details.results.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-500" /> Exam Results ({details.results.length})
              </h4>
              {details.results.map((res, idx) => (
                <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/50">
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm h-fit">
                    <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-lg text-blue-900 dark:text-blue-200 leading-tight mb-3">
                      {res.exam?.title || "Exam"}
                    </h5>
                    <div className="flex gap-6">
                      <div className="bg-white/50 dark:bg-slate-950/50 px-4 py-2 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 block mb-0.5">Marks</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-2xl text-blue-900 dark:text-blue-100">{res.obtained_marks}</span>
                          <span className="text-sm font-semibold text-blue-700/60 dark:text-blue-300/60">/ {res.exam?.total_marks || res.total_marks || "-"}</span>
                        </div>
                      </div>
                      {res.grade && (
                        <div className="bg-white/50 dark:bg-slate-950/50 px-4 py-2 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 block mb-0.5">Grade</span>
                          <span className="font-extrabold text-2xl text-blue-900 dark:text-blue-100">{res.grade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reports Section */}
          {details.reports && details.reports.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> Reports ({details.reports.length})
              </h4>
              {details.reports.map((report, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-800/20 rounded-bl-full -mr-10 -mt-10" />
                  <div className="flex gap-4 relative z-10">
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm h-fit">
                      <FileText className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg text-amber-900 dark:text-amber-200 mb-1">{report.title}</h5>
                      <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed whitespace-pre-wrap text-sm">{report.description}</p>
                      <Badge variant="outline" className="mt-3 bg-white dark:bg-slate-950 uppercase text-[10px] tracking-wider font-bold border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Report Actions (Admin only) */}
          {!readOnly && (
            <div className="pt-2">
              {!isAddingReport ? (
                <Button variant="outline" className="w-full h-12 gap-2 border-dashed border-2 rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors bg-transparent" onClick={() => setIsAddingReport(true)}>
                  <Plus className="w-5 h-5" /> File New Report for this Date
                </Button>
              ) : (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-4 duration-300">
                  <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> New Report
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Report Title</Label>
                      <Input 
                        placeholder="e.g. Needs disciplinary action" 
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Description</Label>
                      <Textarea 
                        placeholder="Provide detailed notes about the student's behavior or performance..." 
                        className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary resize-none p-3"
                        value={reportDesc}
                        onChange={(e) => setReportDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                      <Button variant="ghost" className="rounded-xl h-11 font-semibold" onClick={() => setIsAddingReport(false)} disabled={isSubmitting}>Cancel</Button>
                      <Button className="rounded-xl h-11 font-semibold px-8 shadow-md" onClick={handleAddReport} disabled={isSubmitting || !reportTitle || !reportDesc}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Submit Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
