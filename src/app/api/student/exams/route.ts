import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const studentId = payload.id as number;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { batch: true }
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const exams = await prisma.exam.findMany({
      where: {
        status: { in: ["active", "published", "completed"] },
        OR: [
          { batch_id: student.batch_id },
          { course_id: student.batch.course_id },
          { is_public: true }
        ]
      },
      include: {
        _count: {
          select: { questions: { where: { type: 'mcq' } } }
        },
        results: {
          where: { student_id: studentId },
          select: {
            id: true,
            obtained_marks: true,
            total_marks: true,
            correct_count: true,
            wrong_count: true,
            skipped_count: true,
            time_taken_seconds: true
          }
        }
      },
      orderBy: { start_time: 'desc' }
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Student exams API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
