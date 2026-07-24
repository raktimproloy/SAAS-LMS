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
  const hasPerm = await checkPermission("materials");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await request.json();
    
    // Accept a partial body for toggles, or a full body for edits
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.file_path !== undefined) updateData.file_path = body.file_path;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.batch_id !== undefined) updateData.batch_id = body.batch_id ? parseInt(body.batch_id) : null;
    if (body.course_id !== undefined) updateData.course_id = body.course_id ? parseInt(body.course_id) : null;

    const updatedNote = await prisma.noteMaterial.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("materials");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await prisma.noteMaterial.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
