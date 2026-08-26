"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { RoadmapTimeline } from "@/components/admin/curriculum/roadmap/RoadmapTimeline";
import type { DraftSession } from "@/lib/curriculum-scheduler";

export default function StudentRoadmapDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "class" | "exam">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/roadmap/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          setError(r.status === 403 ? "forbidden" : "error");
          return null;
        }
        return r.json();
      })
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  const sessions: DraftSession[] = useMemo(() => {
    if (!data?.sessions) return [];
    if (filter === "all") return data.sessions;
    return data.sessions.filter((s: DraftSession) => s.session_type === filter);
  }, [data, filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <p className="text-muted-foreground">
          {error === "forbidden"
            ? "This roadmap is not available for your batch."
            : "Could not load roadmap."}
        </p>
        <Link href="/student/roadmap">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-start gap-3">
        <Link href="/student/roadmap">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.course?.title} · {data.batch?.name}
          </p>
        </div>
      </div>

      {data.nextClass && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-primary">
                Next up
              </p>
              <p className="font-semibold mt-0.5">
                {format(parseISO(data.nextClass.date), "EEEE, MMM d")} —{" "}
                {data.nextClass.session_type === "exam"
                  ? data.nextClass.exam_title || "Exam"
                  : data.nextClass.topics?.[0]
                    ? `${data.nextClass.topics[0].chapter_name}${
                        data.nextClass.topics[0].topic_name
                          ? ` — ${data.nextClass.topics[0].topic_name}`
                          : ""
                      }`
                    : "Class"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {data.progress && (
        <div className="rounded-xl border bg-background p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold">{data.progress.completionPct}% completed</span>
          </div>
          <Progress value={data.progress.completionPct} />
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            <span>{data.progress.exams} exams</span>
            <span>·</span>
            <span>{data.progress.holidays} holidays</span>
            <span>·</span>
            <span>
              {data.progress.assignedTopics}/{data.progress.poolTotal || "—"} topics planned
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(["all", "class", "exam"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "class" ? "Classes" : "Exams"}
          </Button>
        ))}
      </div>

      <div className="bg-background rounded-xl border p-4 md:p-6">
        <RoadmapTimeline sessions={sessions} readOnly />
      </div>
    </div>
  );
}
