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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const homework = await prisma.homework.findMany({
      where: { curriculum_id: parseInt(params.id) },
      orderBy: { due_date: "asc" }
    });
    return NextResponse.json(homework);
  } catch (error) {
    console.error("Failed to fetch homework:", error);
    return NextResponse.json({ error: "Failed to fetch homework" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { session_id, batch_id, title, description, due_date } = body;

    if (!session_id || !batch_id || !title || !due_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newHomework = await prisma.homework.create({
      data: {
        curriculum_id: parseInt(params.id),
        session_id: parseInt(session_id),
        batch_id: parseInt(batch_id),
        title,
        description: description || null,
        due_date: new Date(due_date)
      }
    });

    return NextResponse.json(newHomework, { status: 201 });
  } catch (error) {
    console.error("Failed to create homework:", error);
    return NextResponse.json({ error: "Failed to create homework" }, { status: 500 });
  }
}
