import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { isQuestionBankConfigured, requestEmbedToken } from "@/lib/question-bank";

async function checkExamsPermission() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const adminPayload = payload as { role: string; permissions?: string[] };
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
    return NextResponse.json({
      configured: false,
      status: "inactive",
    });
  }

  try {
    await requestEmbedToken("status-check", "Status Check");
    return NextResponse.json({
      configured: true,
      status: "active",
    });
  } catch {
    return NextResponse.json({
      configured: true,
      status: "inactive",
    });
  }
}
