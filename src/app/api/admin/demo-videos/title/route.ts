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
  const hasPerm = await checkPermission("video_courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { setting_key: "demo_class_section_title" }
    });
    return NextResponse.json({ title: setting?.setting_value || "" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch title" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("video_courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { title } = await request.json();

    const updated = await prisma.siteSetting.upsert({
      where: { setting_key: "demo_class_section_title" },
      update: { setting_value: title },
      create: { 
        setting_key: "demo_class_section_title", 
        setting_value: title,
        setting_type: "text",
        group_name: "home"
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update title" }, { status: 500 });
  }
}
