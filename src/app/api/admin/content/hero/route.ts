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
  const hasPerm = await checkPermission("content");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const banners = await prisma.heroBanner.findMany({
      orderBy: { created_at: "desc" },
      take: 1
    });
    return NextResponse.json(banners[0] || null);
  } catch {
    return NextResponse.json({ error: "Failed to fetch hero banner" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("content");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { teacher_photo, description, bg_image, cta_text, cta_link, is_active } = body;

    const newBanner = await prisma.heroBanner.create({
      data: {
        teacher_photo,
        description,
        bg_image,
        cta_text,
        cta_link,
        is_active: is_active ?? true
      }
    });

    return NextResponse.json({ success: true, data: newBanner }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update hero banner" }, { status: 500 });
  }
}
