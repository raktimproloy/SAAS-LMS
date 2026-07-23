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
    const notices = await prisma.notice.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(notices);
  } catch {
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("content");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { title, content, target_type, target_id, type, is_pinned } = body;

    if (!title || !content || !target_type || !type) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const newNotice = await prisma.notice.create({
      data: {
        title,
        content,
        target_type,
        target_id: target_id ? parseInt(target_id) : null,
        type,
        is_pinned: is_pinned || false
      }
    });

    return NextResponse.json({ success: true, data: newNotice }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
