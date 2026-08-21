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
    const { title, fee, discount_fee, start_date, end_date, details, thumbnail, status } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (title) {
      dataToUpdate.title = title;
      // Optional: don't auto-update slug on edit, or do it only if title changed significantly
    }
    if (fee !== undefined) dataToUpdate.fee = fee ? parseFloat(fee) : null;
    if (discount_fee !== undefined) dataToUpdate.discount_fee = discount_fee ? parseFloat(discount_fee) : null;
    if (start_date !== undefined) dataToUpdate.start_date = start_date ? new Date(start_date) : null;
    if (end_date !== undefined) dataToUpdate.end_date = end_date ? new Date(end_date) : null;
    if (details !== undefined) dataToUpdate.details = details || null;
    if (thumbnail !== undefined) dataToUpdate.thumbnail = thumbnail || null;
    if (status !== undefined) dataToUpdate.status = status;

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(params.id) },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updatedCourse });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    await prisma.course.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete course:", err);
    return NextResponse.json({ error: err.message || "Failed to delete course. Ensure no batches are linked." }, { status: 500 });
  }
}
