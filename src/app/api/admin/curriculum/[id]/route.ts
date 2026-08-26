import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkCurriculumPermission } from "@/lib/curriculum-auth";
import { loadCurriculumFull, upsertSessionsFromDraft } from "@/lib/curriculum-scheduler/persist";
import {
  buildSyllabusPool,
  computeProgress,
  DraftSession,
} from "@/lib/curriculum-scheduler";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const curriculum = await loadCurriculumFull(parseInt(params.id));
    if (!curriculum) {
      return NextResponse.json({ error: "Curriculum not found" }, { status: 404 });
    }

    const bookIds = Array.isArray(curriculum.books)
      ? (curriculum.books as number[])
      : [];
    let books: any[] = [];
    if (bookIds.length > 0) {
      books = await prisma.nCTBBook.findMany({
        where: { id: { in: bookIds } },
        orderBy: { sort_order: "asc" },
      });
    }

    const pool = buildSyllabusPool(curriculum.sessions as DraftSession[], books as any);
    const progress = computeProgress(curriculum.sessions as DraftSession[], pool.total);

    return NextResponse.json({
      ...curriculum,
      pool,
      progress,
      selectedBooks: books,
    });
  } catch (error) {
    console.error("Failed to fetch curriculum:", error);
    return NextResponse.json({ error: "Failed to fetch curriculum" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const curriculumId = parseInt(params.id);
    const body = await request.json();
    const {
      title,
      start_date,
      end_date,
      is_public,
      status,
      books,
      class_days,
      publish,
      sessions,
    } = body;

    // Legacy publish path still supported
    if (publish && Array.isArray(sessions)) {
      await upsertSessionsFromDraft(curriculumId, sessions);
      await prisma.curriculum.update({
        where: { id: curriculumId },
        data: {
          status: "active",
          ...(title !== undefined ? { title } : {}),
          ...(is_public !== undefined ? { is_public } : {}),
          ...(books !== undefined ? { books } : {}),
          revision: { increment: 1 },
        },
      });
      const full = await loadCurriculumFull(curriculumId);
      return NextResponse.json(full);
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = new Date(end_date);
    if (is_public !== undefined) updateData.is_public = is_public;
    if (status !== undefined) updateData.status = status;
    if (books !== undefined) updateData.books = books;
    if (class_days !== undefined) updateData.class_days = class_days;

    const updated = await prisma.curriculum.update({
      where: { id: curriculumId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update curriculum:", error);
    return NextResponse.json({ error: "Failed to update curriculum" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    await prisma.curriculum.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete curriculum:", error);
    return NextResponse.json({ error: "Failed to delete curriculum" }, { status: 500 });
  }
}
