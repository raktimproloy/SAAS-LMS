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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { name, course_id, start_time, end_time, max_students, status } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (course_id !== undefined) dataToUpdate.course_id = parseInt(course_id);
    if (start_time !== undefined) dataToUpdate.start_time = start_time;
    if (end_time !== undefined) dataToUpdate.end_time = end_time;
    if (max_students !== undefined) dataToUpdate.max_students = max_students ? parseInt(max_students) : null;
    if (status !== undefined) dataToUpdate.status = status;

    const updatedBatch = await prisma.batch.update({
      where: { id: parseInt(params.id) },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updatedBatch });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    await prisma.batch.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete batch. Ensure no students are linked." }, { status: 500 });
  }
}
