import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkCurriculumPermission } from "@/lib/curriculum-auth";
import { loadCurriculumFull } from "@/lib/curriculum-scheduler/persist";
import {
  buildSyllabusPool,
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
    const books =
      bookIds.length > 0
        ? await prisma.nCTBBook.findMany({
            where: { id: { in: bookIds } },
            orderBy: { sort_order: "asc" },
          })
        : [];

    const pool = buildSyllabusPool(curriculum.sessions as DraftSession[], books as any);
    return NextResponse.json(pool);
  } catch (error) {
    console.error("Failed to load pool:", error);
    return NextResponse.json({ error: "Failed to load syllabus pool" }, { status: 500 });
  }
}
