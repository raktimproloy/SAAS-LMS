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

export async function POST(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { batch_id, date } = await request.json();
    
    if (!batch_id || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const attendanceDate = new Date(date);

    // Get all active students in the batch
    const students = await prisma.student.findMany({
      where: { batch_id: parseInt(batch_id), status: "active" },
      select: { id: true }
    });

    // Get existing attendance records for this date
    const existingRecords = await prisma.attendance.findMany({
      where: {
        date: attendanceDate,
        student_id: { in: students.map(s => s.id) }
      },
      select: { student_id: true }
    });

    const existingStudentIds = new Set(existingRecords.map(r => r.student_id));
    
    // Find students who don't have an attendance record
    const unmarkedStudents = students.filter(s => !existingStudentIds.has(s.id));

    if (unmarkedStudents.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Create 'absent' records for them
    const newRecords = unmarkedStudents.map(s => ({
      student_id: s.id,
      batch_id: parseInt(batch_id),
      date: attendanceDate,
      status: "absent"
    }));

    const result = await prisma.attendance.createMany({
      data: newRecords
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
