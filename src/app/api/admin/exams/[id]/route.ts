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
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        batch: { include: { course: true } },
        course: true,
      }
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    return NextResponse.json(exam);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    
    // We can accept a partial body for toggles, or a full body for edits
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.start_time !== undefined) updateData.start_time = body.start_time ? new Date(body.start_time) : null;
    if (body.end_time !== undefined) updateData.end_time = body.end_time ? new Date(body.end_time) : null;
    if (body.duration_minutes !== undefined) updateData.duration_minutes = parseInt(body.duration_minutes);
    if (body.total_marks !== undefined) updateData.total_marks = parseFloat(body.total_marks);
    if (body.negative_marking !== undefined) updateData.negative_marking = parseFloat(body.negative_marking);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.batch_id !== undefined) updateData.batch_id = body.batch_id ? parseInt(body.batch_id) : null;
    if (body.course_id !== undefined) updateData.course_id = body.course_id ? parseInt(body.course_id) : null;
    if (body.is_grading_enabled !== undefined) updateData.is_grading_enabled = body.is_grading_enabled;

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updatedExam });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Must delete related ExamQuestions and possibly ExamResults first or rely on cascade
    // Prisma schema does not have onDelete: Cascade for exam questions, so we must manually delete them
    
    // Get all question IDs (if needed later for cascading results, currently we just delete them)
    // const questions = await prisma.examQuestion.findMany({ where: { exam_id: id } });
    
    // Check if exam has results
    const resultsCount = await prisma.examResult.count({ where: { exam_id: id } });
    if (resultsCount > 0) {
      return NextResponse.json({ error: "Cannot delete exam with existing results. Make it inactive instead." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.examQuestion.deleteMany({ where: { exam_id: id } }),
      prisma.exam.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}
