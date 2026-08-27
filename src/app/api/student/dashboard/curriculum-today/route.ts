import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { dateKeyLocal, parseBatchTimeToMinutes } from "@/lib/curriculum-class-status";

async function checkStudent() {
  const token = cookies().get("student_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== "student") return null;
  return payload.id as number;
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
  if (endM != null && nowMins >= endM) return "running"; // past end time but not done
  return "running";
}

export async function GET() {
  const studentId = await checkStudent();
  if (!studentId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId, status: "active" },
      include: {
        batch: {
          include: {
            course: { select: { id: true, title: true } },
            curriculums: {
              where: { status: "active" },
              orderBy: { updated_at: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!student || !student.batch) {
      return NextResponse.json({ classes: [] });
    }

    const b = student.batch;
    const activeCurriculum = b.curriculums[0] || null;
    const classDaysStr = parseClassDays(b.class_days);

    // Generate 11 days (3 past, today, 7 future)
    const baseDate = new Date();
    const targetDates: Date[] = [];
    
    for (let i = -3; i <= 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      if (isClassDayToday(classDaysStr, d)) {
        // Set to midnight UTC for Prisma matching
        targetDates.push(new Date(`${dateKeyLocal(d)}T00:00:00.000Z`));
      }
    }

    let sessions: any[] = [];
    if (activeCurriculum && targetDates.length > 0) {
      sessions = await prisma.curriculumSession.findMany({
        where: {
          curriculum_id: activeCurriculum.id,
          is_cancelled: false,
          session_type: { in: ["class", "exam"] },
          date: { in: targetDates },
        },
        include: {
          topics: { orderBy: { sort_order: "asc" }, take: 4 },
          homework: { select: { id: true } },
        },
      });
    }

    const todayDateKey = dateKeyLocal(baseDate);

    // Build the array of classes for target dates
    const classes = targetDates.map((d) => {
      const dKey = dateKeyLocal(d);
      const session = sessions.find((s) => dateKeyLocal(s.date) === dKey) || null;
      
      const hasCurriculum = !!activeCurriculum;
      const hasSession = !!session;
      const isCompleted = session ? session.is_completed : false;
      
      // We evaluate timeStatus strictly on the day. For past days, it's done. For future, upcoming.
      let status: "done" | "running" | "upcoming" = "upcoming";
      if (dKey < todayDateKey) {
        status = "done";
      } else if (dKey > todayDateKey) {
        status = "upcoming";
      } else {
        status = timeStatus(b.start_time, b.end_time, isCompleted, baseDate);
      }

      return {
        id: session?.id ?? Math.random(), // fallback temporary id
        batch_id: b.id,
        curriculum_id: activeCurriculum?.id ?? null,
        session_id: session?.id ?? null,
        session_number: session?.session_number ?? null,
        session_type: session?.session_type ?? "class",
        date: dKey,
        is_completed: isCompleted,
        exam_title: session?.exam_title ?? null,
        status,
        has_curriculum: hasCurriculum,
        has_session: hasSession,
        has_homework: session?.homework?.length > 0,
        course: b.course,
        batch: {
          id: b.id,
          name: b.name,
          start_time: b.start_time,
          end_time: b.end_time,
        },
        curriculum_title: activeCurriculum?.title ?? null,
        topics: (session?.topics || []).map((t: any) => ({
          chapter_name: t.chapter_name,
          topic_name: t.topic_name,
        })),
      };
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Student dashboard curriculum weekly:", error);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }
}
