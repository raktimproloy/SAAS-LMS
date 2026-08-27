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
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { SaveStatus } from "@/hooks/useCurriculumDraft";

type Props = {
  curriculum: any;
  progress: any;
  saveStatus: SaveStatus;
  onSettings: () => void;
};

export function RoadmapHeader({ curriculum, progress, saveStatus, onSettings }: Props) {
  return (
    <div className="bg-background p-3 sm:p-5 rounded-xl border shadow-sm space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
          <Link href="/admin/curriculum">
            <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight break-words">
                {curriculum.title}
              </h1>
              <Badge variant={curriculum.status === "active" ? "default" : "secondary"}>
                {curriculum.status === "active"
                  ? "চালু"
                  : curriculum.status === "draft"
                    ? "খসড়া"
                    : curriculum.status}
              </Badge>
              {curriculum.is_public && (
                <Badge variant="outline" className="border-primary text-primary">
                  স্টুডেন্ট দেখতে পারবে
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{curriculum.course?.title}</span>
              <span className="hidden sm:inline">·</span>
              <span className="font-medium text-foreground">{curriculum.batch?.name}</span>
              <span className="hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                {format(parseISO(curriculum.start_date), "MMM d")} –{" "}
                {format(parseISO(curriculum.end_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-11 sm:pl-0">
          <SaveIndicator status={saveStatus} />
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={onSettings}>
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">সেটিংস</span>
          </Button>
        </div>
      </div>

      {progress && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">সিলেবাস কভারেজ</span>
              <span className="font-bold">
                {progress.assignedTopics}/{progress.poolTotal || "—"} ({progress.coveragePct}%)
              </span>
            </div>
            <Progress value={progress.coveragePct} className="h-2" />
          </div>
          <MiniStat label="পরীক্ষা" value={progress.exams} color="text-blue-600" />
          <MiniStat label="ছুটি" value={progress.holidays} color="text-orange-600" />
          <MiniStat label="স্কিপ" value={progress.skipped} color="text-red-600" />
        </div>
      )}
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
    <div className="rounded-lg border bg-muted/20 px-2.5 sm:px-3 py-1.5 sm:py-2">
      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </p>
      <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
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
