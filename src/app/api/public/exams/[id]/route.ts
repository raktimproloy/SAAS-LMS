import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const examId = parseInt(params.id);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          select: {
            id: true,
            question_text: true,
            options: true,
            marks: true,
            sort_order: true,
            type: true,
            image_url: true,
            image_urls: true,
            parent_id: true
          },
          orderBy: { sort_order: 'asc' }
        },
        course: { select: { title: true } },
        batch: { select: { course: { select: { title: true } } } }
      }
    });

    if (!exam || !exam.is_public) {
      return NextResponse.json({ error: "Exam not available or not public" }, { status: 404 });
    }

    if (!["active", "published", "completed"].includes(exam.status)) {
      return NextResponse.json({ error: "Exam not available" }, { status: 404 });
    }

    const now = new Date();
    if (exam.start_time && now < exam.start_time) {
      return NextResponse.json({ error: "Exam has not started yet" }, { status: 403 });
    }

    if (exam.end_time && now > exam.end_time) {
      return NextResponse.json({ error: "Exam has ended" }, { status: 403 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Public exam API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
