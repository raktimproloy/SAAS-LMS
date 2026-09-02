import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const examId = parseInt(params.id);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, title: true, is_public: true }
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const results = await prisma.examResult.findMany({
      where: { exam_id: examId },
      orderBy: [
        { obtained_marks: 'desc' },
        { time_taken_seconds: 'asc' }
      ],
      include: {
        student: {
          select: { id: true, name: true, phone: true, student_id: true, email: true, batch: { select: { name: true } } }
        },
        public_participant: {
          select: { id: true, name: true, phone: true, institution: true, study_level: true, location: true }
        }
      }
    });

    return NextResponse.json({
      exam,
      results
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const resultId = parseInt(searchParams.get('resultId') || '0');
    if (!resultId) return NextResponse.json({ error: "Result ID required" }, { status: 400 });
    
    await prisma.examResult.delete({
      where: { id: resultId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
