"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function StartExamButton({ examId, startTimeStr, endTimeStr }: { examId: number, startTimeStr: string | null, endTimeStr: string | null }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto rounded-xl font-bold h-14 px-8 bg-slate-200 text-slate-400">
        অপেক্ষা করুন...
      </Button>
    );
  }
  
  const hasStarted = !startTimeStr || new Date(startTimeStr) <= now;
  const hasEnded = endTimeStr && new Date(endTimeStr) < now;

  if (!hasStarted) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto rounded-xl font-bold h-14 px-8 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        এখনো শুরু হয়নি
      </Button>
    );
  }

  if (hasEnded) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto rounded-xl font-bold h-14 px-8 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
        সময় শেষ
      </Button>
    );
  }

  return (
    <Link href={`/exams/${examId}/take`}>
      <Button size="lg" className="w-full sm:w-auto rounded-xl font-bold h-14 px-8 shadow-md hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-white">
        পরীক্ষা দিন <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </Link>
  );
}
