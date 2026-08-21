import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/db";
import {
  getEmbedUrl,
  isQuestionBankConfigured,
  requestEmbedToken,
} from "@/lib/question-bank";

async function checkExamsPermission() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const adminPayload = payload as { id: number; role: string; permissions?: string[]; email?: string };
  const hasPerm =
    adminPayload.role === "super_admin" ||
    adminPayload.permissions?.includes("all") ||
    adminPayload.permissions?.includes("exams");
  if (!hasPerm) return null;
  return adminPayload;
}

export async function GET() {
  const admin = await checkExamsPermission();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!isQuestionBankConfigured()) {
    return NextResponse.json({ error: "Question Bank not configured" }, { status: 503 });
  }

  try {
    const adminUser = await prisma.admin.findUnique({ where: { id: admin.id } });
    const name = adminUser?.name || admin.email || "Admin";
    const { embed_token } = await requestEmbedToken(String(admin.id), name, admin.role);
    return NextResponse.json({
      embed_url: getEmbedUrl(embed_token),
    });
  } catch (error) {
    console.error("Question Bank embed session error:", error);
    return NextResponse.json({ error: "Failed to create embed session" }, { status: 502 });
  }
}

export async function POST() {
  return GET();
}
