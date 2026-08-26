import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkCurriculumPermission } from "@/lib/curriculum-auth";
import { loadCurriculumFull, upsertSessionsFromDraft } from "@/lib/curriculum-scheduler/persist";
import { DraftSession } from "@/lib/curriculum-scheduler";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const curriculumId = parseInt(params.id);
    const body = await request.json().catch(() => ({}));
    const { sessions, is_public } = body;

    const existing = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Curriculum not found" }, { status: 404 });
    }

    // Optional final sync of sessions before publishing
    if (Array.isArray(sessions) && sessions.length > 0) {
      await upsertSessionsFromDraft(curriculumId, sessions as DraftSession[]);
    }

    await prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        status: "active",
        ...(is_public !== undefined ? { is_public: !!is_public } : {}),
        revision: { increment: 1 },
      },
    });

    const full = await loadCurriculumFull(curriculumId);
    return NextResponse.json({
      success: true,
      message: "Curriculum published",
      curriculum: full,
    });
  } catch (error) {
    console.error("Publish failed:", error);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
