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
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const exams = await prisma.exam.findMany({
      include: {
        batch: { include: { course: true } },
        course: true,
        _count: {
          select: { questions: { where: { type: 'mcq' } } }
        }
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(exams);
  } catch {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { 
      title, type, start_time, end_time, duration_minutes, 
      total_marks, negative_marking, is_public, batch_id, course_id, status 
    } = body;

    if (!title || !type || !duration_minutes || !total_marks) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }
    
    if (!is_public && !course_id) {
      return NextResponse.json({ error: "Course is required for private exams" }, { status: 400 });
    }

    const newExam = await prisma.exam.create({
      data: {
        title,
        type,
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        duration_minutes: parseInt(duration_minutes),
        total_marks: parseFloat(total_marks),
        negative_marking: negative_marking ? parseFloat(negative_marking) : 0,
        status: status || "inactive",
        is_public: is_public || false,
        batch_id: batch_id ? parseInt(batch_id) : null,
        course_id: course_id ? parseInt(course_id) : null,
      }
    });

    return NextResponse.json({ success: true, data: newExam }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
