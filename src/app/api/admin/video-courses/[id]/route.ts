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
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { 
      course_id, 
      batch_id, 
      title, 
      description, 
      url, 
      price, 
      is_free, 
      is_public, 
      tags, 
      thumbnail,
      status 
    } = body;

    const updatedVideoCourse = await prisma.videoCourse.update({
      where: { id },
      data: {
        ...(course_id && { course_id: parseInt(course_id) }),
        ...(batch_id !== undefined && { batch_id: batch_id ? parseInt(batch_id) : null }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(url && { url }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(is_free !== undefined && { is_free: Boolean(is_free) }),
        ...(is_public !== undefined && { is_public: Boolean(is_public) }),
        ...(tags !== undefined && { tags: tags }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(status && { status }),
      },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
      }
    });

    return NextResponse.json({ success: true, data: updatedVideoCourse });
  } catch (error) {
    console.error("PUT video course error:", error);
    return NextResponse.json({ error: "Failed to update video course" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await prisma.videoCourse.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE video course error:", error);
    return NextResponse.json({ error: "Failed to delete video course" }, { status: 500 });
  }
}
