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

    const videos = await prisma.videoCourse.findMany({
      where: {
        course_id: student.batch?.course_id ?? -1,
        status: 'active'
      },
      orderBy: { sort_order: 'asc' }
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Student videos API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
