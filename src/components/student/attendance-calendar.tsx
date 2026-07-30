"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DayDetailsModal, DayDetails } from "./day-details-modal";
import { useRouter } from "next/navigation";

interface AttendanceCalendarProps {
  attendanceData: Array<{
    date: string | Date;
    status: "present" | "absent" | "late";
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports?: Array<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allResults?: Array<any>;
  studentId?: number;
  readOnly?: boolean;
}

export function AttendanceCalendar({ attendanceData, reports = [], allResults = [], studentId, readOnly = true }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);
  const router = useRouter();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Dummy start offset to align weekdays (0=Sun, 1=Mon, etc.)
  const startDay = monthStart.getDay();
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Find attendance
    const record = attendanceData.find(a => {
      const d = typeof a.date === 'string' ? a.date.split('T')[0] : format(a.date, "yyyy-MM-dd");
      return d === dateStr;
    });

    // Find reports for this date
    const dayReports = reports.filter(r => {
      const d = typeof r.created_at === 'string' ? r.created_at.split('T')[0] : format(new Date(r.created_at), "yyyy-MM-dd");
      return d === dateStr;
    });

    // Find results for this date
    const dayResults = allResults.filter(r => {
      if (!r.exam || !r.exam.start_time) return false;
      const d = typeof r.exam.start_time === 'string' ? r.exam.start_time.split('T')[0] : format(new Date(r.exam.start_time), "yyyy-MM-dd");
      return d === dateStr;
    });

    setSelectedDay({
      date,
      attendance: record?.status,
      reports: dayReports,
      results: dayResults
    });
  };

  const handleReportAdded = () => {
    // Refresh the current route to fetch the newly added report
    router.refresh();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <h3 className="font-semibold text-lg text-white">{format(currentDate, "MMMM yyyy")}</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-white mb-4 uppercase tracking-wider shrink-0">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4 flex-1 min-h-0 auto-rows-fr">
          {emptyDays.map(empty => (
            <div key={`empty-${empty}`} className="w-full h-full rounded-md bg-transparent" />
          ))}

          {daysInMonth.map((date, i) => {
            const dateStr = format(date, "yyyy-MM-dd");
            
            const record = attendanceData.find(a => {
              const d = typeof a.date === 'string' ? a.date.split('T')[0] : format(a.date, "yyyy-MM-dd");
              return d === dateStr;
            });

            const hasReports = reports.some(r => {
              const d = typeof r.created_at === 'string' ? r.created_at.split('T')[0] : format(new Date(r.created_at), "yyyy-MM-dd");
              return d === dateStr;
            });

            const hasResults = allResults.some(r => {
              if (!r.exam || !r.exam.start_time) return false;
              const d = typeof r.exam.start_time === 'string' ? r.exam.start_time.split('T')[0] : format(new Date(r.exam.start_time), "yyyy-MM-dd");
              return d === dateStr;
            });

            return (
              <button
                key={i}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "w-full h-full min-h-0 rounded-xl flex items-center justify-center text-sm font-medium transition-all hover:scale-105 hover:shadow-lg relative group",
                  isToday(date) && "font-black border-2 border-primary text-blue-300 shadow-sm bg-primary/10",
                  !isSameMonth(date, currentDate) && "text-muted-foreground/30",
                  record?.status === "present" && "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30",
                  record?.status === "absent" && "bg-destructive/20 text-red-300 hover:bg-destructive/30",
                  record?.status === "late" && "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30",
                  !record && !isToday(date) && "hover:bg-white/10 text-white",
                  hasReports && "ring-1 ring-amber-500/50 bg-amber-500/10 text-amber-300 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]",
                  hasResults && !hasReports && "ring-1 ring-blue-500/50 bg-blue-500/10 text-blue-300 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]"
                )}
              >
                {format(date, "d")}
                
                {/* Indicators */}
                <div className="absolute top-1 right-1 flex gap-0.5">
                  {hasReports && (
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-sm" />
                  )}
                  {hasResults && (
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <DayDetailsModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        details={selectedDay}
        readOnly={readOnly}
        studentId={studentId}
        onReportAdded={handleReportAdded}
      />
    </div>
  );
}
