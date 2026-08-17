import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { endOfMonth, startOfMonth } from "date-fns";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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

/** Days of the month that fall on the batch's class weekdays (e.g. Sat/Mon/Wed). */
function getSessionDates(year: number, month: number, classDays: string[]) {
  const daysInMonth = endOfMonth(new Date(year, month - 1)).getDate();
  const allowed = new Set(classDays);
  const sessions: { day: number; weekday: string }[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
    if (allowed.size === 0 || allowed.has(weekday)) {
      sessions.push({ day, weekday });
    }
  }
  return sessions;
}

export async function GET(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const batch_id = searchParams.get("batch_id");
  const yearStr = searchParams.get("year");
  const monthStr = searchParams.get("month"); // 1-12

  if (!batch_id || !yearStr || !monthStr) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const batchId = parseInt(batch_id);

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      select: {
        id: true,
        name: true,
        class_days: true,
        course: { select: { title: true } },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const classDays = parseClassDays(batch.class_days);
    const sessionDates = getSessionDates(year, month, classDays);

    const batchStudents = await prisma.student.findMany({
      where: { batch_id: batchId, status: "active" },
      select: { id: true, student_id: true, name: true, photo: true },
      orderBy: { name: "asc" },
    });

    const attendances = await prisma.attendance.findMany({
      where: {
        batch_id: batchId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        student_id: true,
        date: true,
        status: true,
      },
    });

    const records: Record<number, Record<number, string>> = {};
    batchStudents.forEach((s) => {
      records[s.id] = {};
    });

    attendances.forEach((a) => {
      if (!records[a.student_id]) records[a.student_id] = {};
      const day = a.date.getDate();
      records[a.student_id][day] = a.status;
    });

    return NextResponse.json({
      students: batchStudents,
      records,
      daysInMonth: endDate.getDate(),
      classDays,
      sessionDates,
      batch: {
        id: batch.id,
        name: batch.name,
        course: batch.course?.title || "",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch monthly report" }, { status: 500 });
  }
}
