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

    // Get student's result
    const result = await prisma.examResult.findFirst({
      where: { exam_id: examId, student_id: studentId },
      include: {
        exam: {
          include: {
            questions: true // Include correct answers to show what they got wrong
          }
        }
      }
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Get leaderboard (top 10)
    const leaderboard = await prisma.examResult.findMany({
      where: { exam_id: examId },
      take: 10,
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
      result,
      leaderboard
    });
  } catch (error) {
    console.error("Student exam result API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
