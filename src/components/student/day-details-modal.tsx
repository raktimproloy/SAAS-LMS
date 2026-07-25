import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, AlertTriangle, FileText, BarChart, Plus, Loader2, Trophy } from "lucide-react";
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
  onReportAdded?: () => void;
}

export function DayDetailsModal({ details, isOpen, onClose, readOnly = true, studentId, onReportAdded }: DayDetailsModalProps) {
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!details) return null;

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
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            📅 {format(details.date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Attendance Section */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
            {details.attendance === "present" ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : details.attendance === "absent" ? (
              <XCircle className="h-6 w-6 text-red-500" />
            ) : details.attendance === "late" ? (
              <Clock className="h-6 w-6 text-yellow-500" />
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Attendance</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {details.attendance || "No record"}
              </p>
            </div>
          </div>

          {/* Results Section */}
          {details.results && details.results.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Exam Results ({details.results.length})</h4>
              {details.results.map((res, idx) => (
                <div key={idx} className="flex gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                  <div className="mt-0.5 shrink-0 p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full h-fit">
                    <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-blue-900 dark:text-blue-200">{res.exam?.title || "Exam"}</h5>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
                      <div>
                        <span className="opacity-70 text-xs uppercase tracking-wider block">Marks</span>
                        <span className="font-bold text-lg">{res.obtained_marks}</span> <span className="opacity-70 text-xs">/ {res.exam?.total_marks || res.total_marks || "-"}</span>
                      </div>
                      {res.grade && (
                        <div>
                          <span className="opacity-70 text-xs uppercase tracking-wider block">Grade</span>
                          <span className="font-bold text-lg">{res.grade}</span>
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
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Reports ({details.reports.length})</h4>
              {details.reports.map((report, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50">
                  <FileText className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-900 dark:text-amber-200">{report.title}</h5>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 whitespace-pre-wrap">{report.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-800 uppercase border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
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
            <div className="pt-2 border-t mt-4">
              {!isAddingReport ? (
                <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setIsAddingReport(true)}>
                  <Plus className="w-4 h-4" /> Add Report for this date
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                  <div>
                    <Label className="text-xs mb-1.5 block">Report Title</Label>
                    <Input 
                      placeholder="e.g. Disciplinary action" 
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Description</Label>
                    <Textarea 
                      placeholder="Detailed notes..." 
                      className="min-h-[80px]"
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingReport(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button size="sm" onClick={handleAddReport} disabled={isSubmitting || !reportTitle || !reportDesc}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Report
                    </Button>
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
