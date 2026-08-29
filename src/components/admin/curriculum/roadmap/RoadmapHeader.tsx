"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  Settings2,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/hooks/useCurriculumDraft";

type Props = {
  curriculum: any;
  progress: any;
  saveStatus: SaveStatus;
  onSettings: () => void;
  showFullCalendar?: boolean;
  onToggleFullCalendar?: (checked: boolean) => void;
};

export function RoadmapHeader({ curriculum, progress, saveStatus, onSettings, showFullCalendar, onToggleFullCalendar }: Props) {
  return (
    <div className="bg-background/95 backdrop-blur-md p-3 sm:p-5 rounded-xl sm:rounded-2xl border shadow-sm flex flex-col gap-3 sm:gap-6 transition-all duration-300">
      
      {/* TOP ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-6">
        
        {/* Top Left: Title & Info */}
        <div className="flex items-start gap-3 lg:w-1/2 min-w-0">
          <Link href="/admin/curriculum">
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 shadow-sm rounded-xl hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words text-foreground/90">
                {curriculum.title}
              </h1>
              <Badge variant={curriculum.status === "active" ? "default" : "secondary"} className="shadow-sm">
                {curriculum.status === "active"
                  ? "চালু"
                  : curriculum.status === "draft"
                    ? "খসড়া"
                    : curriculum.status}
              </Badge>
              {curriculum.is_public && (
                <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 shadow-sm">
                  স্টুডেন্ট দেখতে পারবে
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-3 gap-y-1 mt-2 text-xs sm:text-sm text-muted-foreground font-medium">
              <span className="text-foreground/80 font-bold">{curriculum.course?.title}</span>
              <span className="hidden sm:inline opacity-50">•</span>
              <span className="text-foreground/80">{curriculum.batch?.name}</span>
              <span className="hidden sm:inline opacity-50">•</span>
              <span className="inline-flex items-center gap-1.5 opacity-80">
                <CalendarIcon className="w-4 h-4 shrink-0" />
                {format(parseISO(curriculum.start_date), "MMM d")} –{" "}
                {format(parseISO(curriculum.end_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: Mini Stats */}
        {progress && (
          <div className="grid grid-cols-4 gap-2 w-full lg:w-1/2 mt-1 lg:mt-0">
            <MiniStat label="ক্লাস" value={progress.classes} color="text-green-600 dark:text-green-500" />
            <MiniStat label="পরীক্ষা" value={progress.exams} color="text-blue-600 dark:text-blue-500" />
            <MiniStat label="ছুটি" value={progress.holidays} color="text-orange-600 dark:text-orange-500" />
            <MiniStat label="স্কিপ" value={progress.skipped} color="text-red-600 dark:text-red-500" />
          </div>
        )}
      </div>

      {/* BOTTOM ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 lg:gap-6">
        
        {/* Bottom Left: Progress */}
        {progress ? (
          <div className="w-full lg:w-1/2 pl-0 lg:pl-[3.25rem] space-y-2.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-muted-foreground font-semibold tracking-wide">সিলেবাস কভারেজ</span>
              <span className="font-bold text-foreground">
                {progress.assignedTopics}/{progress.poolTotal || "—"} ({progress.coveragePct}%)
              </span>
            </div>
            <Progress value={progress.coveragePct} className="h-2 shadow-sm" indicatorClassName="bg-green-500" />
          </div>
        ) : <div className="hidden lg:block lg:w-1/2" />}

        {/* Bottom Right: Controls */}
        <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-6 w-full lg:w-1/2">
          <div className="hidden sm:block shrink-0">
            <SaveIndicator status={saveStatus} />
          </div>
          
          <div className="flex items-center bg-muted/30 p-1 rounded-xl border shadow-sm flex-1 sm:flex-none justify-center">
            <button
              type="button"
              onClick={() => onToggleFullCalendar?.(false)}
              className={cn(
                "px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 flex-1 sm:flex-none",
                !showFullCalendar 
                  ? "bg-background shadow-sm text-foreground ring-1 ring-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Routine
            </button>
            <button
              type="button"
              onClick={() => onToggleFullCalendar?.(true)}
              className={cn(
                "px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 flex-1 sm:flex-none",
                showFullCalendar 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Full Calendar
            </button>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2 h-9 shadow-sm hover:bg-muted/50 rounded-lg shrink-0 px-2 sm:px-3" onClick={onSettings}>
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">সেটিংস</span>
          </Button>
        </div>
      </div>
      
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="w-full rounded-xl border bg-card/60 px-2 sm:px-4 py-1.5 sm:py-3 flex flex-col justify-center items-center sm:items-start gap-0.5 sm:gap-1 shadow-sm transition-all hover:bg-muted/40 hover:shadow-md">
      <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider text-center sm:text-left">
        {label}
      </p>
      <p className={`text-base sm:text-xl md:text-2xl font-black leading-none ${color}`}>{value}</p>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> সেভ হচ্ছে…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
        <Check className="w-3.5 h-3.5" /> সেভ হয়েছে
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
        <CloudOff className="w-3.5 h-3.5" /> সেভ হয়নি
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Cloud className="w-3.5 h-3.5" /> অটোসেভ চালু
    </span>
  );
}
