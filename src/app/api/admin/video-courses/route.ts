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
    const videoCourses = await prisma.videoCourse.findMany({
      orderBy: { created_at: "desc" },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
      }
    });
    return NextResponse.json(videoCourses);
  } catch (error) {
    console.error("GET video courses error:", error);
    return NextResponse.json({ error: "Failed to fetch video courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
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

    if (!course_id || !title || !url) {
      return NextResponse.json({ error: "Course, Title, and URL are required" }, { status: 400 });
    }

    const newVideoCourse = await prisma.videoCourse.create({
      data: {
        course_id: parseInt(course_id),
        batch_id: batch_id ? parseInt(batch_id) : null,
        title,
        description: description || null,
        url,
        price: price ? parseFloat(price) : 0,
        is_free: Boolean(is_free),
        is_public: is_public !== undefined ? Boolean(is_public) : true,
        tags: tags || null,
        thumbnail: thumbnail || null,
        status: status || "active",
      },
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, name: true } },
      }
    });

    return NextResponse.json({ success: true, data: newVideoCourse }, { status: 201 });
  } catch (error) {
    console.error("POST video course error:", error);
    return NextResponse.json({ error: "Failed to create video course" }, { status: 500 });
  }
}
