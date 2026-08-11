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

export async function GET() {
  const hasPerm = await checkPermission("content"); // Content or settings perm
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const types = await prisma.paymentType.findMany({
      orderBy: { created_at: "asc" }
    });
    return NextResponse.json(types);
  } catch {
    return NextResponse.json({ error: "Failed to fetch payment types" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("content");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const existing = await prisma.paymentType.findUnique({ where: { name } });
    if (existing) return NextResponse.json({ error: "Payment type already exists" }, { status: 400 });

    const newType = await prisma.paymentType.create({
      data: { name }
    });

    return NextResponse.json({ success: true, data: newType }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add payment type" }, { status: 500 });
  }
}
