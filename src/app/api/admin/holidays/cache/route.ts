import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getHolidays } from "@/lib/holidays";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function GET(request: Request) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const country = searchParams.get("country") || "BD";

    if (!year) {
      return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    const yearInt = parseInt(year);

    const holidays = await getHolidays(country, yearInt);

    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Failed to fetch/cache holidays:", error);
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 });
  }
}
