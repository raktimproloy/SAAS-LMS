import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { fetchPaperById } from "@/lib/question-bank";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const examId = parseInt(params.id, 10);
    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const body = await request.json();
    const { paper_id, replace = false } = body as { paper_id?: string; replace?: boolean };

    if (!paper_id?.trim()) {
      return NextResponse.json({ error: "paper_id is required" }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { _count: { select: { questions: true } } },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam._count.questions > 0 && !replace) {
      return NextResponse.json(
        { error: "Exam already has questions. Pass replace: true to overwrite." },
        { status: 409 }
      );
    }

    const paper = await fetchPaperById(paper_id.trim());

    if (!paper.questions?.length) {
      return NextResponse.json({ error: "Paper has no questions" }, { status: 400 });
    }

    const totalMarks = paper.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    await prisma.$transaction(async (tx) => {
      if (replace && exam._count.questions > 0) {
        await tx.examQuestion.deleteMany({ where: { exam_id: examId } });
      }

      for (let i = 0; i < paper.questions.length; i++) {
        const q = paper.questions[i];
        await tx.examQuestion.create({
          data: {
            exam_id: examId,
            type: "mcq",
            question_text: q.question_text,
            options: q.options,
            correct_option: q.correct_option,
            marks: q.marks ?? 1,
            explanation: q.explanation ?? null,
            sort_order: i,
          },
        });
      }

      await tx.exam.update({
        where: { id: examId },
        data: { total_marks: totalMarks },
      });
    });

    return NextResponse.json({
      success: true,
      imported: paper.questions.length,
      total_marks: totalMarks,
      paper_id: paper.id,
    });
  } catch (error) {
    console.error("Import question bank error:", error);
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
