import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const studentId = payload.id as number;
    const examId = parseInt(params.id);

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, title: true }
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    // Fetch leaderboard
    const leaderboard = await prisma.examResult.findMany({
      where: { exam_id: examId },
      take: 50,
      orderBy: [
        { obtained_marks: 'desc' },
        { time_taken_seconds: 'asc' }
      ],
      include: {
        student: {
          select: { name: true, photo: true, batch: { select: { name: true } } }
        },
        public_participant: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      exam,
      leaderboard,
      currentStudentId: studentId
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
