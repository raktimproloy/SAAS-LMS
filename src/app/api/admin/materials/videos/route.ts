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
  const hasPerm = await checkPermission("materials");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const videos = await prisma.videoCourse.findMany({
      include: {
        course: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(videos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch video courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("materials");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { title, url, course_id, price, description, thumbnail } = body;

    if (!title || !url || !course_id) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const newVideo = await prisma.videoCourse.create({
      data: {
        title,
        url,
        description,
        thumbnail,
        price: price ? parseFloat(price) : 0,
        course_id: parseInt(course_id),
      }
    });

    return NextResponse.json({ success: true, data: newVideo }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create video course" }, { status: 500 });
  }
}
