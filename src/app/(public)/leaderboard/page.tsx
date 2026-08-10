import prisma from "@/lib/db";
import { LeaderboardClient } from "@/components/public/leaderboard/LeaderboardClient";
import { FloatingBackground } from "@/components/public/ui/FloatingBackground";
import { Trophy } from "lucide-react";

export const revalidate = 3600;

export default async function LeaderboardPage() {
  // Fetch active courses to use as categories
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="relative min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      <FloatingBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
            <Trophy className="w-4 h-4" />
            Hall of Fame
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            লিডারবোর্ড
          </h1>
          <p className="text-foreground/90 text-lg sm:text-xl max-w-2xl mx-auto">
            সেরা পারফর্মারদের তালিকা দেখুন। কোর্স ও ব্যাচ অনুযায়ী আপনার পজিশন চেক করুন।
          </p>
        </div>

        <LeaderboardClient courses={courses} />
      </div>
    </div>
  );
}
