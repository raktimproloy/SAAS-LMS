import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { loadCurriculumFull } from "@/lib/curriculum-scheduler/persist";
import {
  buildSyllabusPool,
  computeProgress,
  DraftSession,
} from "@/lib/curriculum-scheduler";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: payload.id as number },
      select: { batch_id: true, status: true },
    });
    if (!student || student.status !== "active") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const curriculum = await loadCurriculumFull(parseInt(params.id));
    if (!curriculum) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      !curriculum.is_public ||
      curriculum.status !== "active" ||
      curriculum.batch_id !== student.batch_id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookIds = Array.isArray(curriculum.books)
      ? (curriculum.books as number[])
      : [];
    const books =
      bookIds.length > 0
        ? await prisma.nCTBBook.findMany({
            where: { id: { in: bookIds } },
            orderBy: { sort_order: "asc" },
          })
        : [];

    const pool = buildSyllabusPool(curriculum.sessions as DraftSession[], books as any);
    const progress = computeProgress(
      curriculum.sessions as DraftSession[],
      pool.total
    );

    const today = new Date().toISOString().slice(0, 10);
    const nextClass = (curriculum.sessions as DraftSession[]).find(
      (s) =>
        s.date.slice(0, 10) >= today &&
        (s.session_type === "class" || s.session_type === "exam") &&
        !s.is_completed
    );

    return NextResponse.json({
      id: curriculum.id,
      title: curriculum.title,
      start_date: curriculum.start_date,
      end_date: curriculum.end_date,
      course: curriculum.course,
      batch: curriculum.batch,
      sessions: curriculum.sessions,
      progress,
      nextClass,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load roadmap" }, { status: 500 });
  }
}
