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

// Get holidays for this curriculum
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const holidays = await prisma.curriculumHoliday.findMany({
      where: { curriculum_id: parseInt(params.id) },
      orderBy: { date: "asc" }
    });
    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Failed to fetch holidays:", error);
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 });
  }
}

// Add a custom holiday or toggle removed status
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { date, name, is_custom, is_removed, source } = body;

    if (!date || !name) {
      return NextResponse.json({ error: "Date and name are required" }, { status: 400 });
    }

    const newHoliday = await prisma.curriculumHoliday.create({
      data: {
        curriculum_id: parseInt(params.id),
        date: new Date(date),
        name,
        is_custom: is_custom || false,
        is_removed: is_removed || false,
        source: source || "manual"
      }
    });

    return NextResponse.json(newHoliday, { status: 201 });
  } catch (error) {
    console.error("Failed to create holiday:", error);
    return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 });
  }
}
