import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function GET(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const batch_id = searchParams.get("batch_id");
  const dateStr = searchParams.get("date");

  if (!batch_id || !dateStr) {
    return NextResponse.json({ error: "Missing batch_id or date" }, { status: 400 });
  }

  try {
    const date = new Date(dateStr);
    
    // 1. Get all students in this batch
    const batchStudents = await prisma.student.findMany({
      where: { batch_id: parseInt(batch_id), status: "active" },
      select: { id: true, student_id: true, name: true, photo: true }
    });

    // 2. Get all attendance records for this batch on this date (including cross-batch students)
    const attendances = await prisma.attendance.findMany({
      where: {
        batch_id: parseInt(batch_id),
        date: date
      },
      include: {
        student: { select: { id: true, student_id: true, name: true, photo: true } }
      }
    });

    // Merge them
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mergedStudents = new Map<number, any>();
    batchStudents.forEach(s => {
      mergedStudents.set(s.id, { ...s, attendance: null });
    });

    // Add attendance data and cross-batch students
    attendances.forEach(a => {
      if (mergedStudents.has(a.student_id)) {
        mergedStudents.get(a.student_id).attendance = { id: a.id, status: a.status };
      } else {
        mergedStudents.set(a.student_id, {
          ...a.student,
          attendance: { id: a.id, status: a.status }
        });
      }
    });

    const studentsArray = Array.from(mergedStudents.values()).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ students: studentsArray });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { student_id, batch_id, date, status } = await request.json();
    
    if (!student_id || !batch_id || !date || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    
    const existing = await prisma.attendance.findFirst({
      where: {
        student_id: parseInt(student_id),
        date: attendanceDate
      }
    });

    if (existing) {
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status, batch_id: parseInt(batch_id) }
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.attendance.create({
        data: {
          student_id: parseInt(student_id),
          batch_id: parseInt(batch_id),
          date: attendanceDate,
          status
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
