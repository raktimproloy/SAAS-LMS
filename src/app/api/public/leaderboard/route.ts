import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = parseInt(searchParams.get('examId') || '0');

    if (!examId) {
      return NextResponse.json({ error: "Exam ID required" }, { status: 400 });
    }

    const results = await prisma.examResult.findMany({
      where: { exam_id: examId },
      orderBy: [
        { obtained_marks: 'desc' },
        { time_taken_seconds: 'asc' }
      ],
      take: 50,
      include: {
        student: { select: { name: true, photo: true } },
        public_participant: { select: { name: true, institution: true } }
      }
    });

    const leaderboard = results.map((r, index) => {
      const isPublic = !!r.public_participant;
      return {
        id: r.id,
        rank: index + 1,
        name: isPublic ? r.public_participant?.name : r.student?.name,
        score: r.obtained_marks,
        institution: isPublic ? (r.public_participant?.institution || "Public User") : "Registered Student",
        avatar: (!isPublic && r.student?.photo) ? r.student.photo : `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.id}`
      };
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
