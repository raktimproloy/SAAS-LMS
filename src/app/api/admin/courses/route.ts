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

// Simple slug generator
function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
}

export async function GET() {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const courses = await prisma.course.findMany({
      orderBy: [
        { sort_order: "asc" },
        { created_at: "desc" }
      ],
    });
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { title, fee, discount_fee, start_date, end_date, details, thumbnail } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: { 
        title,
        slug: generateSlug(title),
        fee: fee ? parseFloat(fee) : null,
        discount_fee: discount_fee ? parseFloat(discount_fee) : null,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        details: details || null,
        thumbnail: thumbnail || null,
      },
    });

    return NextResponse.json({ success: true, data: newCourse }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
