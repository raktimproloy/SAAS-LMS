import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkCurriculumPermission } from "@/lib/curriculum-auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const curriculumId = parseInt(params.id, 10);

    if (sessionId) {
      const notes = await prisma.curriculumSessionNote.findMany({
        where: {
          session_id: parseInt(sessionId, 10),
          session: { curriculum_id: curriculumId },
        },
        orderBy: { created_at: "desc" },
      });
      return NextResponse.json(notes);
    }

    const notes = await prisma.curriculumSessionNote.findMany({
      where: { session: { curriculum_id: curriculumId } },
      include: {
        session: {
          select: {
            id: true,
            date: true,
            session_number: true,
            session_type: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { session_id, title, body: noteBody, file_url } = body;

    if (!session_id || !noteBody?.trim()) {
      return NextResponse.json(
        { error: "session_id and body are required" },
        { status: 400 }
      );
    }

    const session = await prisma.curriculumSession.findFirst({
      where: {
        id: parseInt(session_id, 10),
        curriculum_id: parseInt(params.id, 10),
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const note = await prisma.curriculumSessionNote.create({
      data: {
        session_id: session.id,
        title: title?.trim() || null,
        body: noteBody.trim(),
        file_url: file_url || null,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
