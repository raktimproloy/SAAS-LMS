import prisma from "@/lib/db";
import {
  DraftSession,
  normalizeLoadedSessions,
  applySessionTypeFlags,
  toDateKey,
} from "@/lib/curriculum-scheduler";

/** Persist a full session snapshot without wiping homework/exam links when possible. */
export async function upsertSessionsFromDraft(
  curriculumId: number,
  sessions: DraftSession[]
) {
  const sorted = [...sessions].sort((a, b) =>
    toDateKey(a.date).localeCompare(toDateKey(b.date))
  );

  const existing = await prisma.curriculumSession.findMany({
    where: { curriculum_id: curriculumId },
    include: { topics: true },
  });

  const existingByDate = new Map(
    existing.map((s) => [toDateKey(s.date), s])
  );
  const keepIds = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    const draft = applySessionTypeFlags(sorted[i]);
    const dateKey = toDateKey(draft.date);
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    const prev = existingByDate.get(dateKey);

    let sessionId: number;
    if (prev) {
      sessionId = prev.id;
      keepIds.add(prev.id);
      await prisma.curriculumSession.update({
        where: { id: prev.id },
        data: {
          session_number: i + 1,
          session_type: draft.session_type,
          is_holiday: draft.is_holiday,
          holiday_name: draft.holiday_name,
          is_exam: !!draft.is_exam,
          exam_title: draft.exam_title || null,
          is_cancelled: !!draft.is_cancelled,
          is_completed: !!draft.is_completed,
          extra_days: draft.extra_days || 0,
          notes: draft.notes || null,
        },
      });
      await prisma.curriculumSessionTopic.deleteMany({
        where: { session_id: prev.id },
      });
    } else {
      const created = await prisma.curriculumSession.create({
        data: {
          curriculum_id: curriculumId,
          date,
          session_number: i + 1,
          session_type: draft.session_type,
          is_holiday: draft.is_holiday,
          holiday_name: draft.holiday_name,
          is_exam: !!draft.is_exam,
          exam_title: draft.exam_title || null,
          is_cancelled: !!draft.is_cancelled,
          is_completed: !!draft.is_completed,
          extra_days: draft.extra_days || 0,
          notes: draft.notes || null,
        },
      });
      sessionId = created.id;
      keepIds.add(created.id);
    }

    const topics = draft.topics || [];
    if (topics.length > 0) {
      await prisma.curriculumSessionTopic.createMany({
        data: topics.map((t, j) => ({
          session_id: sessionId,
          nctb_book_id: t.nctb_book_id ? Number(t.nctb_book_id) : null,
          subject: t.subject || null,
          chapter_name: t.chapter_name,
          topic_name: t.topic_name || null,
          size: t.size || 1,
          sort_order: t.sort_order ?? j,
          is_custom: !!t.is_custom,
        })),
      });
    }
  }

  // Delete sessions no longer in draft (homework cascades)
  const toDelete = existing.filter((s) => !keepIds.has(s.id)).map((s) => s.id);
  if (toDelete.length > 0) {
    await prisma.curriculumSession.deleteMany({
      where: { id: { in: toDelete } },
    });
  }
}

export async function loadCurriculumFull(id: number) {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id },
    include: {
      course: true,
      batch: true,
      sessions: {
        orderBy: { date: "asc" },
        include: { topics: { orderBy: { sort_order: "asc" } } },
      },
      holidays: true,
      exams: true,
    },
  });
  if (!curriculum) return null;

  return {
    ...curriculum,
    sessions: normalizeLoadedSessions(curriculum.sessions as any[]),
  };
}
