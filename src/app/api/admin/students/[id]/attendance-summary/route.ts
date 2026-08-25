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

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const yearStr = searchParams.get("year");
  const monthStr = searchParams.get("month");

  try {
    const studentId = parseInt(params.id);
    if (isNaN(studentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: { include: { course: true } },
      },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const year = yearStr ? parseInt(yearStr) : null;
    const month = monthStr ? parseInt(monthStr) : null;

    const dateFilter =
      year && month
        ? {
            gte: startOfMonth(new Date(year, month - 1)),
            lte: endOfMonth(new Date(year, month - 1)),
          }
        : undefined;

    const [attendance, reports] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          student_id: studentId,
          ...(dateFilter ? { date: dateFilter } : {}),
        },
        orderBy: { date: "asc" },
      }),
      prisma.studentReport.findMany({
        where: {
          student_id: studentId,
          ...(dateFilter ? { created_at: dateFilter } : {}),
        },
        orderBy: { created_at: "desc" },
      }),
    ]);

    const calendar: Record<string, { status: string; attendanceId: number }> = {};
    for (const row of attendance) {
      calendar[toDateKey(row.date)] = { status: row.status, attendanceId: row.id };
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        student_id: student.student_id,
        photo: student.photo,
        batch: student.batch,
      },
      calendar,
      attendance: attendance.map((a) => ({ date: a.date, status: a.status, id: a.id })),
      reports,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const studentId = parseInt(params.id);
    if (isNaN(studentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { date, status, batch_id } = body;

    if (!date || !status) {
      return NextResponse.json({ error: "date and status are required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { batch_id: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const resolvedBatchId = batch_id ? parseInt(batch_id) : student.batch_id;
    if (!resolvedBatchId) {
      return NextResponse.json({ error: "Student has no batch assigned" }, { status: 400 });
    }

    const attendanceDate = new Date(`${date}T12:00:00.000Z`);

    const existing = await prisma.attendance.findFirst({
      where: { student_id: studentId, date: attendanceDate },
    });

    let record;
    if (existing) {
      record = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status, batch_id: resolvedBatchId },
      });
    } else {
      record = await prisma.attendance.create({
        data: {
          student_id: studentId,
          batch_id: resolvedBatchId,
          date: attendanceDate,
          status,
        },
      });
    }

    return NextResponse.json({
      day: {
        status: record.status,
        attendanceId: record.id,
        date: toDateKey(record.date),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}
