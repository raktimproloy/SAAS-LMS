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
    const notes = await prisma.noteMaterial.findMany({
      include: {
        batch: { include: { course: true } },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("materials");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { title, file_path, batch_id, course_id, type, description, is_public, status } = body;

    if (!title || !file_path || !type) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const newNote = await prisma.noteMaterial.create({
      data: {
        title,
        file_path,
        type,
        description,
        is_public: is_public || false,
        status: status || "active",
        batch_id: batch_id ? parseInt(batch_id) : null,
        course_id: course_id ? parseInt(course_id) : null,
      }
    });

    return NextResponse.json({ success: true, data: newNote }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create note material" }, { status: 500 });
  }
}
