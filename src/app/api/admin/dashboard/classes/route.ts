import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { dateKeyLocal, parseBatchTimeToMinutes } from "@/lib/curriculum-class-status";

async function checkAdmin() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  return !!verifyToken(token);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function parseClassDays(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Match batch class_days against today (supports Sun/Sunday/etc). */
function isClassDayToday(classDays: string[], now: Date): boolean {
  if (classDays.length === 0) return true; // no restriction → show every day
  const short = WEEKDAYS[now.getDay()];
  const full = WEEKDAYS_FULL[now.getDay()];
  const normalized = classDays.map((d) => d.trim().toLowerCase());
  return (
    normalized.includes(short.toLowerCase()) ||
    normalized.includes(full.toLowerCase()) ||
    normalized.some((d) => d.startsWith(short.toLowerCase().slice(0, 3)))
  );
}

function timeStatus(
  startTime: string,
  endTime: string,
  isCompleted: boolean,
  now: Date
): "done" | "running" | "upcoming" {
  if (isCompleted) return "done";
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startM = parseBatchTimeToMinutes(startTime);
  const endM = parseBatchTimeToMinutes(endTime);

  if (startM != null && nowMins < startM) return "upcoming";
  // Past end without Done → still running until Done (manual for no-curriculum;
  // curriculum may be auto-finished separately)
  if (endM != null && nowMins >= endM) return "running";
  return "running";
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const now = new Date();
    const today = dateKeyLocal(now);
    const todayStart = new Date(`${today}T00:00:00.000Z`);

    const batches = await prisma.batch.findMany({
      where: { status: "active" },
      include: {
        course: { select: { id: true, title: true } },
        curriculums: {
          where: { status: "active" },
          orderBy: { updated_at: "desc" },
          take: 1,
          include: {
            sessions: {
              where: {
                is_cancelled: false,
                session_type: { in: ["class", "exam"] },
                date: todayStart,
              },
              include: {
                topics: { orderBy: { sort_order: "asc" }, take: 4 },
              },
              take: 3,
            },
          },
        },
      },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    });

    // Only batches that have class today
    const todayBatches = batches.filter((b) =>
      isClassDayToday(parseClassDays(b.class_days), now)
    );

    // Sort by start_time
    todayBatches.sort((a, b) => {
      const am = parseBatchTimeToMinutes(a.start_time) ?? 0;
      const bm = parseBatchTimeToMinutes(b.start_time) ?? 0;
      if (am !== bm) return am - bm;
      return a.sort_order - b.sort_order;
    });

    // Pick today's session per batch (local date key)
    type BatchRow = (typeof todayBatches)[number];
    type SessionRow = BatchRow["curriculums"][number]["sessions"][number];
    const sessionToday = new Map<number, { curriculum: BatchRow["curriculums"][number]; session: SessionRow }>();
    for (const b of todayBatches) {
      const cur = b.curriculums[0];
      if (!cur) continue;
      const session = cur.sessions.find((s) => dateKeyLocal(s.date) === today);
      if (session) sessionToday.set(b.id, { curriculum: cur, session });
    }

    const attendanceByBatch = new Map<
      number,
      { present: number; absent: number; late: number; total: number }
    >();

    await Promise.all(
      todayBatches.map(async (b) => {
        const [students, attendances] = await Promise.all([
          prisma.student.count({ where: { batch_id: b.id, status: "active" } }),
          prisma.attendance.findMany({
            where: { batch_id: b.id, date: todayStart },
            select: { status: true },
          }),
        ]);
        let present = 0;
        let absent = 0;
        let late = 0;
        for (const a of attendances) {
          const st = (a.status || "").toLowerCase();
          if (st === "present") present++;
          else if (st === "late") late++;
          else if (st === "absent") absent++;
        }
        attendanceByBatch.set(b.id, { present, absent, late, total: students });
      })
    );

    const classes = todayBatches.map((b) => {
      const activeCurriculum = b.curriculums[0] || null;
      const row = sessionToday.get(b.id);
      const session = row?.session || null;
      const hasCurriculum = !!activeCurriculum;
      const hasSession = !!session;
      const isCompleted = session ? session.is_completed : false;
      const status = timeStatus(b.start_time, b.end_time, isCompleted, now);

      return {
        id: session?.id ?? -b.id,
        batch_id: b.id,
        curriculum_id: activeCurriculum?.id ?? null,
        session_id: session?.id ?? null,
        session_number: session?.session_number ?? null,
        session_type: session?.session_type ?? "class",
        date: today,
        is_completed: isCompleted,
        exam_title: session?.exam_title ?? null,
        status,
        has_curriculum: hasCurriculum,
        has_session: hasSession,
        /** Only slots with today's curriculum session auto-focus in their time window */
        auto_focus: hasSession && status === "running" && !isCompleted,
        course: b.course,
        batch: {
          id: b.id,
          name: b.name,
          start_time: b.start_time,
          end_time: b.end_time,
        },
        curriculum_title: activeCurriculum?.title ?? null,
        topics: (session?.topics || []).map((t) => ({
          chapter_name: t.chapter_name,
          topic_name: t.topic_name,
        })),
        attendance: attendanceByBatch.get(b.id) || {
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        },
      };
    });

    return NextResponse.json({
      date: today,
      classes,
      hasActiveCurriculum: classes.some((c) => c.has_curriculum),
    });
  } catch (error) {
    console.error("dashboard classes:", error);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }
}
