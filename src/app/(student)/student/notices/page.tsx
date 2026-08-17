"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bell, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
    return (
      <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-20">
        {/* Header Banner Skeleton */}
        <div className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-6 border border-border mb-2 h-[220px]">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
              <Skeleton className="h-10 w-48 bg-muted rounded-xl" />
            </div>
            <Skeleton className="h-6 w-full max-w-lg bg-muted/50 rounded-md" />
          </div>
          <Skeleton className="w-32 h-12 rounded-2xl bg-muted shrink-0" />
        </div>

        {/* Notices Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col h-[280px] bg-card/90 dark:bg-card/40 backdrop-blur-md border border-border rounded-3xl overflow-hidden">
              <div className="bg-primary/5 p-5 flex items-center gap-4 border-b border-border">
                <Skeleton className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                <Skeleton className="h-4 w-32 bg-muted/50 rounded-md" />
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4">
                <Skeleton className="h-6 w-3/4 bg-muted rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted/50 rounded-md" />
                  <Skeleton className="h-4 w-5/6 bg-muted/50 rounded-md" />
                  <Skeleton className="h-4 w-4/6 bg-muted/50 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-20">
      {/* Header Banner */}
      <div 
        className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-border mb-2 w-full animate-in fade-in slide-in-from-top-4 duration-700"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform-gpu pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />
          <div className="absolute bottom-0 right-10 opacity-[0.03]">
            <Bell className="w-40 h-40" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4 text-foreground">
              <div className="p-3 bg-background/50 backdrop-blur-md rounded-2xl border border-border shadow-sm">
                <Bell className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              </div>
              Notice Board
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mt-4 font-medium">
              Stay updated with the latest announcements and important notices from the institute.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border shadow-sm shrink-0">
            <Bell className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-bold text-foreground">{notices.length} Updates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {notices.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-[2.5rem] relative overflow-hidden group min-h-[50vh]">
            {/* Ambient Background Glows for Empty State */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10 p-6 bg-background/50 rounded-full border border-border mb-6 shadow-xl group-hover:scale-110 group-hover:shadow-primary/20 transition-all duration-500">
              <Bell className="w-12 h-12 text-muted-foreground/50 group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
            </div>
            
            <h3 className="relative z-10 text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight text-center">You're all caught up!</h3>
            <p className="relative z-10 text-muted-foreground max-w-md text-center font-medium text-sm md:text-base leading-relaxed">
              There are no new notices or announcements from the institute at this moment. We'll let you know when something comes up.
            </p>
          </div>
        ) : (
          notices.map(notice => (
            <Card key={notice.id} className="hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full bg-card/90 dark:bg-card/40 backdrop-blur-md border border-border rounded-3xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col h-full">
                <div className="bg-primary/5 p-5 flex items-center gap-4 border-b border-border">
                  <div className="bg-primary/20 p-2.5 rounded-xl text-primary shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{format(new Date(notice.created_at), "MMMM d, yyyy")}</div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-2 leading-snug">{notice.title}</h3>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">{notice.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
