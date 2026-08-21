import prisma from "@/lib/db";
import { Bell } from "lucide-react";
import { NoticesClient } from "@/components/public/notices/NoticesClient";

export const revalidate = 3600;

export default async function NoticesPage() {
  const notices = await prisma.notice.findMany({
    take: 10,
    orderBy: [
      { is_pinned: 'desc' },
      { created_at: 'desc' }
    ]
  });

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
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

        <NoticesClient initialNotices={JSON.parse(JSON.stringify(notices))} />
      </div>
    </div>
  );
}
