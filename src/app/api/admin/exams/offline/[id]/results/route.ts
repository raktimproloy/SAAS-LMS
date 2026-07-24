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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const examId = parseInt(params.id);
    if (isNaN(examId)) return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });

    const body = await request.json();
    const { student_id, obtained_marks, grade, comment } = body;

    if (!student_id || obtained_marks === undefined) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const existingResult = await prisma.examResult.findFirst({
      where: { exam_id: examId, student_id: parseInt(student_id) }
    });

    if (existingResult) {
      const updated = await prisma.examResult.update({
        where: { id: existingResult.id },
        data: {
          obtained_marks: parseFloat(obtained_marks),
          grade: grade || null,
          comment: comment || null
        }
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await prisma.examResult.create({
        data: {
          exam_id: examId,
          student_id: parseInt(student_id),
          obtained_marks: parseFloat(obtained_marks),
          total_marks: exam.total_marks,
          grade: grade || null,
          comment: comment || null
        }
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}
