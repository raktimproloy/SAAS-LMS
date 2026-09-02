import prisma from "@/lib/db";
import { SingleExamLeaderboardClient } from "@/components/public/leaderboard/SingleExamLeaderboardClient";
import { Trophy } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60; // 1 minute

export default async function ExamLeaderboardPage({ params }: { params: { id: string } }) {
  const examId = parseInt(params.id);
  if (isNaN(examId)) return notFound();

  // Fetch the active public exam
  const exam = await prisma.exam.findUnique({
    where: { id: examId, status: 'active', is_public: true },
    select: { id: true, title: true }
  });

  if (!exam) {
    return notFound();
  }

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
            <Trophy className="w-4 h-4" />
            Hall of Fame
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            লিডারবোর্ড
          </h1>
          <p className="text-foreground/90 text-lg sm:text-xl max-w-2xl mx-auto">
            সেরা পারফর্মারদের তালিকা দেখুন।
          </p>
        </div>

        <SingleExamLeaderboardClient exam={exam} />
      </div>
    </div>
  );
}
