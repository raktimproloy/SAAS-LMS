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
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const url = new URL(request.url);
  const courseId = url.searchParams.get("course_id");
  const batchId = url.searchParams.get("batch_id");
  const search = url.searchParams.get("search");

  let whereClause: any = { type: "offline" };

  if (courseId) whereClause.course_id = parseInt(courseId);
  if (batchId) whereClause.batch_id = parseInt(batchId);
  if (search) whereClause.title = { contains: search };

  try {
    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        batch: { include: { course: true } },
        course: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(exams);
  } catch {
    return NextResponse.json({ error: "Failed to fetch offline exams" }, { status: 500 });
  }
}
