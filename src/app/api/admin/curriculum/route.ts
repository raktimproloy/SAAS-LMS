import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkCurriculumPermission } from "@/lib/curriculum-auth";
import { getHolidays } from "@/lib/holidays";
import {
  generateInitialSchedule,
  DraftSession,
  toDateKey,
} from "@/lib/curriculum-scheduler";
import { upsertSessionsFromDraft, loadCurriculumFull } from "@/lib/curriculum-scheduler/persist";

async function buildHolidayMap(startDate: string, endDate: string) {
  const startYear = new Date(startDate).getUTCFullYear();
  const endYear = new Date(endDate).getUTCFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
  const holidayMap = new Map<string, string>();
  for (const year of years) {
    const yearHolidays = await getHolidays("BD", year);
    yearHolidays.forEach((h: any) => {
      const dateStr = new Date(h.date).toISOString().split("T")[0];
      holidayMap.set(dateStr, h.name);
    });
  }
  return holidayMap;
}

async function cloneSessionsFromTemplate(
  templateId: number,
  newStart: string
): Promise<DraftSession[] | null> {
  const template = await prisma.curriculum.findUnique({
    where: { id: templateId },
    include: {
      sessions: {
        orderBy: { date: "asc" },
        include: { topics: { orderBy: { sort_order: "asc" } } },
      },
    },
  });
  if (!template || template.sessions.length === 0) return null;

  const oldStart = toDateKey(template.start_date);
  const oldStartMs = new Date(`${oldStart}T00:00:00.000Z`).getTime();
  const newStartMs = new Date(`${toDateKey(newStart)}T00:00:00.000Z`).getTime();
  const offsetDays = Math.round((newStartMs - oldStartMs) / 86400000);

  return template.sessions.map((s, i) => {
    const d = new Date(s.date);
    d.setUTCDate(d.getUTCDate() + offsetDays);
    const sessionType =
      (s as any).session_type ||
      (s.holiday_name === "Skipped Class"
        ? "skipped"
        : s.is_holiday
          ? "holiday"
          : (s as any).is_exam
            ? "exam"
            : "class");

    return {
      id: -(i + 1),
      date: d.toISOString(),
      session_number: i + 1,
      session_type: sessionType as any,
      is_holiday: !!s.is_holiday,
      holiday_name: s.holiday_name,
      is_exam: !!(s as any).is_exam,
      exam_title: (s as any).exam_title || null,
      is_cancelled: !!s.is_cancelled,
      is_completed: false,
      extra_days: s.extra_days || 0,
      notes: s.notes,
      topics: (s.topics || []).map((t, j) => ({
        id: -(1000 + i * 100 + j),
        nctb_book_id: t.nctb_book_id,
        subject: t.subject,
        chapter_name: t.chapter_name,
        topic_name: t.topic_name,
        size: t.size,
        sort_order: t.sort_order,
        is_custom: t.is_custom,
      })),
    };
  });
}

export async function GET() {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const curricula = await prisma.curriculum.findMany({
      orderBy: { created_at: "desc" },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
        _count: { select: { sessions: true } },
      },
    });
    return NextResponse.json(curricula);
  } catch (error) {
    console.error("Failed to fetch curricula:", error);
    return NextResponse.json({ error: "Failed to fetch curricula" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkCurriculumPermission();
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const {
      title,
      course_id,
      batch_id,
      start_date,
      end_date,
      class_days,
      is_public,
      books,
      template_id,
      config,
    } = body;

    if (!title || !course_id || !batch_id || !start_date || !end_date || !class_days) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookIds: number[] = Array.isArray(books) ? books.map(Number) : [];

    const newCurriculum = await prisma.curriculum.create({
      data: {
        title,
        course_id: parseInt(course_id),
        batch_id: parseInt(batch_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        class_days,
        is_public: is_public || false,
        books: bookIds.length ? bookIds : undefined,
        template_id: template_id ? parseInt(template_id) : null,
        status: "draft",
        revision: 0,
      },
    });

    let sessions: DraftSession[] | null = null;

    if (template_id) {
      sessions = await cloneSessionsFromTemplate(parseInt(template_id), start_date);
    }

    if (!sessions) {
      const holidayMap = await buildHolidayMap(start_date, end_date);
      let selectedBooks: any[] = [];
      if (bookIds.length > 0) {
        selectedBooks = await prisma.nCTBBook.findMany({
          where: { id: { in: bookIds } },
          orderBy: { sort_order: "asc" },
        });
      }

      sessions = generateInitialSchedule(
        {
          start_date,
          end_date,
          class_days,
          holidays: holidayMap,
          config,
        },
        selectedBooks as any
      );

      // Persist CurriculumHoliday rows for overrides
      const holidayRows = Array.from(holidayMap.entries()).map(([date, name]) => ({
        curriculum_id: newCurriculum.id,
        date: new Date(`${date}T00:00:00.000Z`),
        name,
        is_custom: false,
        source: "calendarific",
      }));
      if (holidayRows.length > 0) {
        await prisma.curriculumHoliday.createMany({ data: holidayRows });
      }
    }

    await upsertSessionsFromDraft(newCurriculum.id, sessions);

    const full = await loadCurriculumFull(newCurriculum.id);
    return NextResponse.json(full, { status: 201 });
  } catch (error) {
    console.error("Failed to create curriculum:", error);
    return NextResponse.json({ error: "Failed to create curriculum" }, { status: 500 });
  }
}
