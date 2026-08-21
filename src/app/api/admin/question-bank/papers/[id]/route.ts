import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { fetchPaperById } from "@/lib/question-bank";

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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await checkExamsPermission();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const paper = await fetchPaperById(params.id);
    return NextResponse.json({ paper });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch paper";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
