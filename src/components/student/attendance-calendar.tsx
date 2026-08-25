"use client";

import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday as isTodayFn,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DayDetailsModal, DayDetails } from "./day-details-modal";
import { useRouter } from "next/navigation";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceCalendarProps {
  attendanceData: Array<{
    date: string | Date;
    status: AttendanceStatus;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports?: Array<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allResults?: Array<any>;
  studentId?: number;
  batchId?: number | null;
  readOnly?: boolean;
  /** Tighter cells — useful inside tables / narrow panels */
  compact?: boolean;
  className?: string;
  onAttendanceUpdated?: () => void;
  onReportAdded?: () => void;
}

function toDateKey(value: string | Date): string {
  if (typeof value === "string") return value.split("T")[0];
  return format(value, "yyyy-MM-dd");
}

function firstPresentLabel(
  days: Date[],
  statusByDate: Map<string, AttendanceStatus>
): string | null {
  for (const date of days) {
    const status = statusByDate.get(format(date, "yyyy-MM-dd"));
    if (status === "present" || status === "late") {
      return format(date, "MMMM d, yyyy");
    }
  }
  return null;
}

export function AttendanceCalendar({
  attendanceData,
  reports = [],
  allResults = [],
  studentId,
  batchId,
  readOnly = true,
  compact = false,
  className,
  onAttendanceUpdated,
  onReportAdded,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);
  const router = useRouter();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const emptyDays = Array.from({ length: monthStart.getDay() }, (_, i) => i);

  const statusByDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const row of attendanceData) {
      map.set(toDateKey(row.date), row.status);
    }
    return map;
  }, [attendanceData]);

  const firstPresent = firstPresentLabel(daysInMonth, statusByDate);
  const subtitle = firstPresent
    ? `First present: ${firstPresent}`
    : "No present day this month";

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const record = attendanceData.find((a) => toDateKey(a.date) === dateStr);

    const dayReports = reports.filter((r) => {
      const d =
        typeof r.created_at === "string"
          ? r.created_at.split("T")[0]
          : format(new Date(r.created_at), "yyyy-MM-dd");
      return d === dateStr;
    });

    const dayResults = allResults.filter((r) => {
      if (!r.exam || !r.exam.start_time) return false;
      const d =
        typeof r.exam.start_time === "string"
          ? r.exam.start_time.split("T")[0]
          : format(new Date(r.exam.start_time), "yyyy-MM-dd");
      return d === dateStr;
    });

    setSelectedDay({
      date,
      attendance: record?.status,
      reports: dayReports,
      results: dayResults,
    });
  };

  const handleReportAdded = () => {
    onReportAdded?.();
    router.refresh();
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[10px] border border-border bg-card shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-3 sm:gap-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-start gap-2 sm:gap-2.5">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-foreground sm:text-base">
              {format(currentDate, "MMMM yyyy")}
            </h3>
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-xs">
              {subtitle}
              {" · Tap a day for times"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-[6px] border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-[6px] border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={cn(compact ? "p-2.5 sm:p-3" : "p-3 sm:p-5")}>
        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground sm:mb-2 sm:gap-1.5 sm:text-[11px]">
          {WEEKDAYS.map((day) => (
            <div key={day} className="truncate">
              <span className="sm:hidden">{day.slice(0, 1)}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {emptyDays.map((empty) => (
            <div
              key={`empty-${empty}`}
              className={cn(
                compact ? "min-h-[2.5rem] sm:min-h-[2.75rem]" : "min-h-[2.75rem] sm:min-h-[4.25rem]"
              )}
            />
          ))}

          {daysInMonth.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const status = statusByDate.get(dateStr);
            const isPresent = status === "present";
            const isAbsent = status === "absent";
            const isLate = status === "late";
            const today = isTodayFn(date);

            const hasReports = reports.some((r) => {
              const d =
                typeof r.created_at === "string"
                  ? r.created_at.split("T")[0]
                  : format(new Date(r.created_at), "yyyy-MM-dd");
              return d === dateStr;
            });

            const hasResults = allResults.some((r) => {
              if (!r.exam?.start_time) return false;
              const d =
                typeof r.exam.start_time === "string"
                  ? r.exam.start_time.split("T")[0]
                  : format(new Date(r.exam.start_time), "yyyy-MM-dd");
              return d === dateStr;
            });

            const tone = isPresent
              ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200"
              : isAbsent
                ? "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-200"
                : isLate
                  ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200"
                  : "bg-background border-border text-muted-foreground";

            return (
              <button
                key={dateStr}
                type="button"
                title={`${dateStr}${status ? ` · ${status}` : ""}`}
                onClick={() => handleDayClick(date)}
                className={cn(
                  "relative flex flex-col items-center justify-between rounded-[6px] border px-0.5 py-1 text-xs font-semibold transition-colors sm:px-1 sm:py-1.5 sm:text-sm",
                  compact
                    ? "min-h-[2.5rem] sm:min-h-[2.75rem]"
                    : "min-h-[2.75rem] sm:min-h-[4.25rem] md:min-h-[4.75rem]",
                  tone,
                  today &&
                    "ring-2 ring-slate-800 ring-offset-1 ring-offset-background dark:ring-white",
                  "cursor-pointer hover:brightness-[0.98] active:scale-[0.98]"
                )}
              >
                <span className="leading-none">{format(date, "d")}</span>

                {/* Status: icons on sm+, dots on mobile (and always when compact) */}
                {!compact && isPresent && (
                  <CheckCircle2 className="hidden h-4 w-4 text-emerald-500 sm:block" />
                )}
                {!compact && isAbsent && (
                  <XCircle className="hidden h-4 w-4 text-rose-500 sm:block" />
                )}
                {!compact && isLate && (
                  <Clock className="hidden h-4 w-4 text-amber-500 sm:block" />
                )}

                {(isPresent || isAbsent || isLate) && (
                  <span
                    className={cn(
                      "mb-0.5 h-1 w-1 rounded-full",
                      isPresent && "bg-emerald-500",
                      isAbsent && "bg-rose-500",
                      isLate && "bg-amber-500",
                      compact ? "block" : "sm:hidden"
                    )}
                  />
                )}

                {(hasReports || hasResults) && (
                  <div className="absolute right-0.5 top-0.5 flex gap-0.5 sm:right-1 sm:top-1">
                    {hasReports && (
                      <span className="h-1 w-1 rounded-full bg-amber-500 sm:h-1.5 sm:w-1.5" />
                    )}
                    {hasResults && (
                      <span className="h-1 w-1 rounded-full bg-blue-500 sm:h-1.5 sm:w-1.5" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-border pt-3 text-[10px] text-muted-foreground sm:mt-4 sm:gap-5 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40 sm:h-3 sm:w-3" />
            Present
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/40 sm:h-3 sm:w-3" />
            Absent
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-border bg-background sm:h-3 sm:w-3" />
            No Class/Future
          </span>
        </div>
      </div>

      <DayDetailsModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        details={selectedDay}
        readOnly={readOnly}
        studentId={studentId}
        batchId={batchId}
        onReportAdded={handleReportAdded}
        onAttendanceUpdated={onAttendanceUpdated}
      />
    </div>
  );
}
