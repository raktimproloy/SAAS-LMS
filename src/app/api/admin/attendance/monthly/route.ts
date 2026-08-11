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
    const month = parseInt(monthStr); // 1-12
    
    // Create Date objects for start and end of month
    // Note: month in Date constructor is 0-indexed, so month - 1
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // 1. Get all students in this batch
    const batchStudents = await prisma.student.findMany({
      where: { batch_id: parseInt(batch_id), status: "active" },
      select: { id: true, student_id: true, name: true }
    });

    // 2. Get all attendance records for this batch in this month
    const attendances = await prisma.attendance.findMany({
      where: {
        batch_id: parseInt(batch_id),
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      select: {
        student_id: true,
        date: true,
        status: true
      }
    });

    // 3. Structure the response
    // { students: [...], records: { [studentId]: { [day]: status } } }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: Record<number, Record<number, string>> = {};
    
    batchStudents.forEach(s => {
      records[s.id] = {};
    });

    attendances.forEach(a => {
      // Create record entry if student is from cross-batch or just missing
      if (!records[a.student_id]) {
        records[a.student_id] = {};
        // We could fetch cross-batch student details here if needed, 
        // but for now, we just map what we have.
      }
      
      const day = a.date.getDate(); // 1-31
      records[a.student_id][day] = a.status;
    });

    // Sort students alphabetically
    const sortedStudents = batchStudents.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ 
      students: sortedStudents, 
      records,
      daysInMonth: endDate.getDate()
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch monthly report" }, { status: 500 });
  }
}
