"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateKeyLocal } from "@/lib/curriculum-class-status";

type SessionDay = {
  id: number;
  date: string;
  session_number: number;
  session_type: string;
  is_completed: boolean;
  is_cancelled?: boolean;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(d: string | Date) {
  if (typeof d === "string") {
    return d.includes("T") ? dateKeyLocal(d) : d.slice(0, 10);
  }
  return dateKeyLocal(d);
}

export function ClassSessionCalendar({
  curriculumId,
  sessions,
  currentDate,
}: {
  curriculumId: number | string;
  sessions: SessionDay[];
  currentDate: string;
}) {
  const [viewDate, setViewDate] = useState(() =>
    parseISO(currentDate + "T12:00:00")
  );

  const sessionMap = useMemo(() => {
    const map = new Map<string, SessionDay>();
    for (const s of sessions) {
      if (s.is_cancelled) continue;
      if (!["class", "exam"].includes(s.session_type)) continue;
      map.set(toKey(s.date), s);
    }
    return map;
  }, [sessions]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const emptyDays = monthStart.getDay();

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{format(viewDate, "MMMM yyyy")}</h3>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
            onClick={() =>
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
            onClick={() =>
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`e-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const session = sessionMap.get(key);
          const isCurrent = key === currentDate;
          const isToday = key === format(new Date(), "yyyy-MM-dd");

          if (!session) {
            return (
              <div
                key={key}
                className={cn(
                  "aspect-square rounded-lg border border-transparent p-0.5 text-xs text-muted-foreground/40 flex flex-col items-center justify-center",
                  !isSameMonth(day, viewDate) && "opacity-30"
                )}
              >
                {format(day, "d")}
              </div>
            );
          }

          const href = `/admin/curriculum/${curriculumId}/class/${key}`;

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "aspect-square rounded-lg border p-0.5 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5",
                isCurrent && "border-primary bg-primary/10 ring-1 ring-primary/30 font-bold",
                !isCurrent && session.is_completed && "border-emerald-300/60 bg-emerald-50/80 dark:bg-emerald-950/30",
                !isCurrent && !session.is_completed && "border-sky-300/50 bg-sky-50/60 dark:bg-sky-950/20",
                isToday && !isCurrent && "ring-1 ring-amber-400/60"
              )}
            >
              <span>{format(day, "d")}</span>
              <span className="text-[9px] font-medium truncate max-w-full px-0.5">
                {session.session_type === "exam" ? "Exam" : `C${session.session_number}`}
              </span>
              {session.is_completed && (
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded border border-primary bg-primary/20" /> Current
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded border border-emerald-400 bg-emerald-100" /> Done
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded border border-sky-400 bg-sky-100" /> Scheduled
        </span>
      </div>
    </div>
  );
}
