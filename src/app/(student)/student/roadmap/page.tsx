"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Map, ArrowRight, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function StudentRoadmapListPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/roadmap")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setList(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Map className="w-7 h-7 text-primary" />
          Course Roadmap
        </h1>
        <p className="text-muted-foreground mt-1">
          See upcoming classes and exams planned by your teacher.
        </p>
      </div>

      {list.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            No published roadmap for your batch yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {list.map((item) => (
            <Card key={item.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.course?.title} · {item.batch?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(parseISO(item.start_date), "MMM d")} –{" "}
                    {format(parseISO(item.end_date), "MMM d, yyyy")}
                    <Badge variant="secondary" className="ml-2">
                      {item._count?.sessions || 0} days
                    </Badge>
                  </p>
                </div>
                <Link href={`/student/roadmap/${item.id}`}>
                  <Button className="gap-2">
                    View roadmap <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
