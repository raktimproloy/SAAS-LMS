import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, AlertTriangle, FileText, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type DayDetails = {
  date: Date;
  attendance?: "present" | "absent" | "late";
  exam?: { title: string; time: string };
  result?: { examTitle: string; marks: number; rank?: number; total: number };
  notice?: { title: string };
};

interface DayDetailsModalProps {
  details: DayDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DayDetailsModal({ details, isOpen, onClose }: DayDetailsModalProps) {
  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            📅 {format(details.date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Attendance Section */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
            {details.attendance === "present" ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : details.attendance === "absent" ? (
              <XCircle className="h-6 w-6 text-red-500" />
            ) : details.attendance === "late" ? (
              <Clock className="h-6 w-6 text-yellow-500" />
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-slate-300" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Attendance</h4>
              <p className="text-sm text-slate-500 capitalize">
                {details.attendance || "No record"}
              </p>
            </div>
          </div>

          {/* Exam Section */}
          {details.exam && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <FileText className="h-6 w-6 text-blue-500" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Exam Scheduled</h4>
                <p className="text-sm text-blue-700">{details.exam.title}</p>
                <p className="text-xs text-blue-600 mt-1">{details.exam.time}</p>
              </div>
            </div>
          )}

          {/* Result Section */}
          {details.result && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <BarChart className="h-6 w-6 text-purple-500" />
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900">Result Published</h4>
                <p className="text-sm text-purple-700">{details.result.examTitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-white border-purple-200">
                    Score: {details.result.marks}/{details.result.total}
                  </Badge>
                  {details.result.rank && (
                    <Badge className="bg-purple-500 hover:bg-purple-600">
                      Rank #{details.result.rank}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notice Section */}
          {details.notice && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900">Notice</h4>
                <p className="text-sm text-amber-700">{details.notice.title}</p>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
