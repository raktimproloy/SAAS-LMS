import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { isOfflineExamType } from "@/lib/exam-type";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const studentId = payload.id as number;
    const examId = Number.parseInt(params.id, 10);

    if (!Number.isFinite(examId)) {
      return NextResponse.json({ error: "Invalid exam id" }, { status: 400 });
    }

    // Get student's result
    const result = await prisma.examResult.findFirst({
      where: { exam_id: examId, student_id: studentId },
      include: {
        exam: {
          include: {
            questions: true,
            course: { select: { title: true } },
            batch: { select: { name: true } },
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const isOffline = isOfflineExamType(result.exam.type);

    // Offline: full class list (admin-style table)
    if (isOffline) {
      const classResults = await prisma.examResult.findMany({
        where: { exam_id: examId, student_id: { not: null } },
        orderBy: [{ obtained_marks: "desc" }, { created_at: "asc" }],
        include: {
          student: {
            select: {
              id: true,
              name: true,
              photo: true,
              student_id: true,
            },
          },
        },
      });

      const ranked = classResults.map((row, index) => ({
        ...row,
        rank: row.rank ?? index + 1,
      }));

      return NextResponse.json({
        result,
        classResults: ranked,
        leaderboard: ranked.slice(0, 10),
        isOffline: true,
      });
    }

    // Online: top 10 leaderboard
    const leaderboard = await prisma.examResult.findMany({
      where: { exam_id: examId },
      take: 10,
      orderBy: [
        { obtained_marks: "desc" },
        { time_taken_seconds: "asc" },
      ],
      include: {
        student: {
          select: { name: true, photo: true, batch: { select: { name: true } } },
        },
        public_participant: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      result,
      leaderboard,
      isOffline: false,
    });
  } catch (error) {
    console.error("Student exam result API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
