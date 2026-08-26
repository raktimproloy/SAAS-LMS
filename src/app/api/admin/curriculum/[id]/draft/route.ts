import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkCurriculumPermission } from "@/lib/curriculum-auth";
import { loadCurriculumFull, upsertSessionsFromDraft } from "@/lib/curriculum-scheduler/persist";
import {
  buildSyllabusPool,
  computeProgress,
  DraftSession,
} from "@/lib/curriculum-scheduler";

/** Silent autosave — upsert sessions + optional meta. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const curriculumId = parseInt(params.id);
    const body = await request.json();
    const { sessions, meta, revision } = body;

    const current = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      select: { id: true, revision: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Curriculum not found" }, { status: 404 });
    }

    // Soft conflict: client behind server — still accept but warn
    const conflict =
      typeof revision === "number" && revision < current.revision;

    if (meta) {
      const updateData: any = {};
      if (meta.title !== undefined) updateData.title = meta.title;
      if (meta.class_days !== undefined) updateData.class_days = meta.class_days;
      if (meta.books !== undefined) updateData.books = meta.books;
      if (meta.start_date !== undefined)
        updateData.start_date = new Date(meta.start_date);
      if (meta.end_date !== undefined) updateData.end_date = new Date(meta.end_date);
      if (meta.is_public !== undefined) updateData.is_public = meta.is_public;
      if (Object.keys(updateData).length > 0) {
        await prisma.curriculum.update({
          where: { id: curriculumId },
          data: updateData,
        });
      }
    }

    if (Array.isArray(sessions)) {
      await upsertSessionsFromDraft(curriculumId, sessions as DraftSession[]);
    }

    const updated = await prisma.curriculum.update({
      where: { id: curriculumId },
      data: { revision: { increment: 1 } },
      select: { revision: true, status: true, updated_at: true },
    });

    // Lightweight response for silent save — full reload optional via ?full=1
    const url = new URL(request.url);
    if (url.searchParams.get("full") === "1") {
      const full = await loadCurriculumFull(curriculumId);
      const bookIds = Array.isArray(full?.books) ? (full!.books as number[]) : [];
      const books =
        bookIds.length > 0
          ? await prisma.nCTBBook.findMany({
              where: { id: { in: bookIds } },
              orderBy: { sort_order: "asc" },
            })
          : [];
      const pool = buildSyllabusPool(
        (full?.sessions || []) as DraftSession[],
        books as any
      );
      const progress = computeProgress(
        (full?.sessions || []) as DraftSession[],
        pool.total
      );
      return NextResponse.json({
        ...full,
        pool,
        progress,
        selectedBooks: books,
        conflict,
      });
    }

    return NextResponse.json({
      success: true,
      revision: updated.revision,
      status: updated.status,
      updated_at: updated.updated_at,
      conflict,
    });
  } catch (error) {
    console.error("Draft save failed:", error);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
