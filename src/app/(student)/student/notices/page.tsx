"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bell, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<{ id: number; title: string; content: string; created_at: string | Date }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/notices')
      .then(res => res.json())
      .then(data => {
        setNotices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Notice Board</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="w-4 h-4" /> {notices.length} Updates
        </div>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground bg-muted/50 border-dashed">
            No notices at this time.
          </Card>
        ) : (
          notices.map(notice => (
            <Card key={notice.id} className="hover:shadow-md transition-shadow group overflow-hidden" data-aos="fade-up">
              <div className="flex flex-col md:flex-row">
                <div className="bg-muted/50 p-6 flex md:flex-col items-center md:justify-center border-b md:border-b-0 md:border-r min-w-[140px] gap-3 border-border">
                  <Calendar className="w-6 h-6 text-primary/60" />
                  <div className="text-center">
                    <div className="font-bold text-lg">{format(new Date(notice.created_at), "MMM d")}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{format(new Date(notice.created_at), "yyyy")}</div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{notice.title}</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
