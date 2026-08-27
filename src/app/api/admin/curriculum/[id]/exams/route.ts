import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkCurriculumPermission } from "@/lib/curriculum-auth";
import { loadCurriculumFull, upsertSessionsFromDraft } from "@/lib/curriculum-scheduler/persist";
import {
  addExamAtSession,
  DraftSession,
  toDateKey,
} from "@/lib/curriculum-scheduler";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const exams = await prisma.examSchedule.findMany({
      where: { curriculum_id: parseInt(params.id) },
      orderBy: { exam_date: "asc" },
    });
    return NextResponse.json(exams);
  } catch (error) {
    console.error("Failed to fetch exams:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const curriculumId = parseInt(params.id);
    const body = await request.json();
    const { session_id, batch_id, title, exam_date, duration_min, total_marks, notes } = body;

    if (!batch_id || !title || !exam_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newExam = await prisma.examSchedule.create({
      data: {
        curriculum_id: curriculumId,
        session_id: session_id ? parseInt(session_id) : null,
        batch_id: parseInt(batch_id),
        title,
        exam_date: new Date(exam_date),
        duration_min: duration_min ? parseInt(duration_min) : null,
        total_marks: total_marks ? parseFloat(total_marks) : 100,
        notes: notes || null,
      },
    });

    if (session_id) {
      const full = await loadCurriculumFull(curriculumId);
      if (full) {
        const classDays = (full.class_days as string[]) || [];
        let sessions = full.sessions as DraftSession[];
        const sid = parseInt(session_id);
        const idx = sessions.findIndex((s) => Number(s.id) === sid);

        if (idx >= 0) {
          sessions = addExamAtSession(
            sessions,
            sid,
            title,
            classDays,
            toDateKey(full.end_date as any)
          );
          await upsertSessionsFromDraft(curriculumId, sessions);
        }
      }
    }

    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    console.error("Failed to create exam:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
