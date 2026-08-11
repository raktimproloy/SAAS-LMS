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
    const body = await request.json();
    const { batch_id, date, student_ids } = body;

    if (!batch_id || !date || !Array.isArray(student_ids)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const attendanceDate = new Date(date);

    // Upsert 'present' for each student_id
    const upsertPromises = student_ids.map(async (student_id: number) => {
      const existing = await prisma.attendance.findFirst({
        where: {
          student_id: student_id,
          date: attendanceDate,
        }
      });

      if (existing) {
        return prisma.attendance.update({
          where: { id: existing.id },
          data: { status: "present", batch_id: parseInt(batch_id) }
        });
      } else {
        return prisma.attendance.create({
          data: {
            student_id: student_id,
            batch_id: parseInt(batch_id),
            date: attendanceDate,
            status: "present"
          }
        });
      }
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ success: true, count: student_ids.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to batch save attendance" }, { status: 500 });
  }
}
