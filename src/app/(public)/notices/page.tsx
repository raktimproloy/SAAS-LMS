import prisma from "@/lib/db";
import { format } from "date-fns";
import { Pin, Bell, CalendarDays } from "lucide-react";
import Link from "next/link";
import { FloatingBackground } from "@/components/public/ui/FloatingBackground";

export const revalidate = 3600;

export default async function NoticesPage() {
  const notices = await prisma.notice.findMany({
    orderBy: [
      { is_pinned: 'desc' },
      { created_at: 'desc' }
    ]
  });

  return (
    <div className="relative min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      <FloatingBackground />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
            <Bell className="w-4 h-4" />
            Official Updates
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            সকল নোটিশ বোর্ড
          </h1>
          <p className="text-foreground/90 text-lg sm:text-xl max-w-2xl mx-auto">
            ক্লাস, পরীক্ষা, ও অন্যান্য আপডেট সম্পর্কে বিস্তারিত জানতে নিয়মিত নোটিশ বোর্ড ভিজিট করুন।
          </p>
        </div>

        <div className="space-y-6">
          {notices.length === 0 ? (
            <div className="text-center py-24 bg-card/40 backdrop-blur-md rounded-3xl border border-border">
              <Bell className="w-16 h-16 text-foreground/90/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground">বর্তমানে কোনো নোটিশ নেই</h3>
            </div>
          ) : (
            notices.map((notice) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
