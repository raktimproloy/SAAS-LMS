"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DayDetailsModal, DayDetails } from "./day-details-modal";

interface AttendanceCalendarProps {
  attendanceData: Array<{
    date: string | Date;
    status: "present" | "absent" | "late";
  }>;
}

export function AttendanceCalendar({ attendanceData }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);

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
    // Find attendance
    const attendanceStr = format(date, "yyyy-MM-dd");
    const record = attendanceData.find(a => {
      const d = typeof a.date === 'string' ? a.date.split('T')[0] : format(a.date, "yyyy-MM-dd");
      return d === attendanceStr;
    });

    // In a real app we would pass down events, exams, results here from API data
    // For now we'll construct the details with just attendance
    setSelectedDay({
      date,
      attendance: record?.status,
      // Mocking notice randomly for demonstration of UI design aesthetics as required by user
      ...(Math.random() > 0.8 && { notice: { title: "Reminder: Fee payment due" } })
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">{format(currentDate, "MMMM yyyy")}</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map(empty => (
            <div key={`empty-${empty}`} className="h-10 rounded-md bg-transparent" />
          ))}

          {daysInMonth.map((date, i) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const record = attendanceData.find(a => {
              const d = typeof a.date === 'string' ? a.date.split('T')[0] : format(a.date, "yyyy-MM-dd");
              return d === dateStr;
            });

            return (
              <button
                key={i}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "h-10 rounded-md flex items-center justify-center text-sm transition-all hover:ring-2 hover:ring-slate-300 relative group",
                  isToday(date) && "font-bold border-2 border-primary",
                  !isSameMonth(date, currentDate) && "text-slate-300",
                  record?.status === "present" && "bg-green-100 text-green-700 hover:bg-green-200",
                  record?.status === "absent" && "bg-red-100 text-red-700 hover:bg-red-200",
                  record?.status === "late" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                  !record && "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {format(date, "d")}
                {/* Micro-interaction dot if they have a notification */}
                <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full opacity-0 group-hover:opacity-100 bg-slate-400 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      <DayDetailsModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        details={selectedDay}
      />
    </div>
  );
}
