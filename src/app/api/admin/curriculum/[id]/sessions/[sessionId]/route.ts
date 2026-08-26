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

export async function PUT(request: Request, { params }: { params: { id: string, sessionId: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { date, is_holiday, holiday_name, is_cancelled, is_completed, extra_days, notes, session_type, is_exam, exam_title } = body;
    
    const updateData: any = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (is_holiday !== undefined) updateData.is_holiday = is_holiday;
    if (holiday_name !== undefined) updateData.holiday_name = holiday_name;
    if (is_cancelled !== undefined) updateData.is_cancelled = is_cancelled;
    if (is_completed !== undefined) updateData.is_completed = is_completed;
    if (extra_days !== undefined) updateData.extra_days = parseInt(extra_days);
    if (notes !== undefined) updateData.notes = notes;
    if (session_type !== undefined) updateData.session_type = session_type;
    if (is_exam !== undefined) updateData.is_exam = !!is_exam;
    if (exam_title !== undefined) updateData.exam_title = exam_title;

    const updated = await prisma.curriculumSession.update({
      where: { 
        id: parseInt(params.sessionId),
        curriculum_id: parseInt(params.id) // Ensure it belongs to this curriculum
      },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string, sessionId: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    await prisma.curriculumSession.delete({
      where: { 
        id: parseInt(params.sessionId),
        curriculum_id: parseInt(params.id)
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
