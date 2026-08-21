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
    const teacher = await prisma.teacher.findFirst({
      orderBy: { created_at: "asc" }
    });
    return NextResponse.json(teacher || null);
  } catch {
    return NextResponse.json({ error: "Failed to fetch hero banner" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("content");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { name, bio, qualifications, photo } = body;

    const existingTeacher = await prisma.teacher.findFirst({
      orderBy: { created_at: "asc" }
    });

    let teacher;
    if (existingTeacher) {
      teacher = await prisma.teacher.update({
        where: { id: existingTeacher.id },
        data: { 
          name: name || existingTeacher.name, 
          bio, 
          qualifications, 
          photo 
        }
      });
    } else {
      teacher = await prisma.teacher.create({
        data: { 
          name: name || "Teacher", 
          bio, 
          qualifications, 
          photo 
        }
      });
    }

    return NextResponse.json({ success: true, data: teacher }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update hero banner" }, { status: 500 });
  }
}
