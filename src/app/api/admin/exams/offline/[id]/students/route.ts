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
    if (isNaN(examId)) return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || !exam.batch_id) {
      return NextResponse.json({ error: "Exam or batch not found" }, { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: { batch_id: exam.batch_id, status: "active" },
      select: {
        id: true,
        student_id: true,
        name: true,
        exam_results: {
          where: { exam_id: examId },
          select: {
            id: true,
            obtained_marks: true,
            grade: true,
            comment: true
          }
        }
      },
      orderBy: { student_id: 'asc' }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
