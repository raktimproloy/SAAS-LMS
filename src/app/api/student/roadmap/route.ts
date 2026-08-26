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

async function getStudent() {
  const token = cookies().get("student_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== "student") return null;
  return prisma.student.findUnique({
    where: { id: payload.id as number },
    select: { id: true, batch_id: true, status: true },
  });
}

/** List public active curricula for the student's batch */
export async function GET() {
  const student = await getStudent();
  if (!student || student.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!student.batch_id) {
    return NextResponse.json([]);
  }

  try {
    const list = await prisma.curriculum.findMany({
      where: {
        batch_id: student.batch_id,
        is_public: true,
        status: "active",
      },
      orderBy: { updated_at: "desc" },
      select: {
        id: true,
        title: true,
        start_date: true,
        end_date: true,
        course: { select: { title: true } },
        batch: { select: { name: true } },
        _count: { select: { sessions: true } },
      },
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load roadmaps" }, { status: 500 });
  }
}
