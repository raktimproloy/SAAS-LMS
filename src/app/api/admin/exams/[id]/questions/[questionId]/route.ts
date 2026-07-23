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

export async function DELETE(request: Request, { params }: { params: { id: string, questionId: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const questionId = parseInt(params.questionId);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Delete children first
    await prisma.examQuestion.deleteMany({
      where: { parent_id: questionId }
    });

    await prisma.examQuestion.delete({
      where: { id: questionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
