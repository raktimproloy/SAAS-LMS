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

// Get all sessions for a curriculum
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const sessions = await prisma.curriculumSession.findMany({
      where: { curriculum_id: parseInt(params.id) },
      orderBy: { date: "asc" },
      include: {
        topics: {
          orderBy: { sort_order: "asc" }
        }
      }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// Create a custom session (e.g., adding an extra class date)
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { date, session_number, is_holiday, holiday_name, notes } = body;

    if (!date || session_number === undefined) {
      return NextResponse.json({ error: "Date and session_number are required" }, { status: 400 });
    }

    const newSession = await prisma.curriculumSession.create({
      data: {
        curriculum_id: parseInt(params.id),
        date: new Date(date),
        session_number: parseInt(session_number),
        is_holiday: is_holiday || false,
        holiday_name: holiday_name || null,
        notes: notes || null
      }
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
