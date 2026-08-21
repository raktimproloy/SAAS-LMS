"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Pin, CalendarDays, Loader2, Bell } from "lucide-react";
import { getNotices } from "@/app/(public)/notices/actions";
import { Button } from "@/components/ui/button";

export function NoticesClient({ initialNotices }: { initialNotices: any[] }) {
  const [notices, setNotices] = useState<any[]>(initialNotices);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialNotices.length >= 10);

  const loadMore = async () => {
    setLoading(true);
    try {
      const newNotices = await getNotices(notices.length, 10);
      if (newNotices.length < 10) {
        setHasMore(false);
      }
      setNotices([...notices, ...newNotices]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (notices.length === 0) {
    return (
      <div className="text-center py-24 bg-card/40 backdrop-blur-md rounded-3xl border border-border">
        <Bell className="w-16 h-16 text-foreground/90/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground">বর্তমানে কোনো নোটিশ নেই</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notices.map((notice) => (
        <div 
          key={notice.id}
          className={`bg-card/60 backdrop-blur-xl border rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${
            notice.is_pinned 
            ? "border-primary/40 bg-gradient-to-r from-primary/5 to-transparent" 
            : "border-border/60 hover:border-primary/30"
          }`}
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${
                notice.is_pinned 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "bg-secondary text-secondary-foreground"
              }`}>
                {notice.type || "আপডেট"}
              </span>
              
              {notice.is_pinned && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                  <Pin className="w-3.5 h-3.5" />
                  PINNED
                </span>
              )}

              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90 ml-auto">
                <CalendarDays className="w-3.5 h-3.5" />
                {format(new Date(notice.created_at), "dd MMM, yyyy")}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
              {notice.title}
            </h3>

            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {notice.content}
            </p>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="flex justify-center mt-12 pt-8">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            size="lg"
            className="rounded-full px-8 text-base shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                লোডিং...
              </>
            ) : (
              "আরও নোটিশ দেখুন"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
