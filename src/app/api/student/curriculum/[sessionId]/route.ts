import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkStudent() {
  const token = cookies().get("student_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== "student") return null;
  return payload.id as number;
}

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const studentId = await checkStudent();
  if (!studentId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sessionId = parseInt(params.sessionId, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId, status: "active" },
      select: { batch_id: true },
    });

    if (!student || !student.batch_id) {
      return NextResponse.json({ error: "Student not assigned to any batch" }, { status: 403 });
    }

    const session = await prisma.curriculumSession.findUnique({
      where: { id: sessionId },
      include: {
        curriculum: {
          select: { batch_id: true, title: true, course: { select: { title: true } } },
        },
        topics: {
          orderBy: { sort_order: "asc" },
        },
        sessionNotes: {
          orderBy: { created_at: "asc" },
        },
        homework: {
          where: { batch_id: student.batch_id },
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Ensure the student's batch is the one associated with this session's curriculum
    if (session.curriculum.batch_id !== student.batch_id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Student curriculum session API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
