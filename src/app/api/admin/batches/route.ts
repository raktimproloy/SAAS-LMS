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

export async function GET() {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const batches = await prisma.batch.findMany({
      include: {
        course: true
      },
      orderBy: [
        { sort_order: "asc" },
        { created_at: "desc" }
      ],
    });
    return NextResponse.json(batches);
  } catch {
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { name, course_id, start_time, end_time, max_students, class_days } = body;

    if (!name || !course_id || !start_time || !end_time) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const newBatch = await prisma.batch.create({
      data: { 
        name, 
        course_id: parseInt(course_id), 
        start_time,
        end_time,
        max_students: max_students ? parseInt(max_students) : null,
        class_days: class_days || []
      },
    });

    return NextResponse.json({ success: true, data: newBatch }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
