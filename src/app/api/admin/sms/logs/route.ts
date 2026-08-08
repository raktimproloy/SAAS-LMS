import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { NextRequest } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    const hasPerm = await checkPermission("sms");
    if (!hasPerm) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const take = parseInt(searchParams.get("take") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const logs = await prisma.smsLog.findMany({
      take,
      skip,
      orderBy: { created_at: "desc" },
    });

    const total = await prisma.smsLog.count();

    return NextResponse.json({ logs, total });
  } catch (error: any) {
    console.error("SMS Logs API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
