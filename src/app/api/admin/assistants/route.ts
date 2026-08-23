import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';
// Middleware equivalent to verify if super_admin
async function checkSuperAdmin() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === "super_admin";
}

export async function GET() {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const assistants = await prisma.admin.findMany({
      where: { role: "assistant" },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(assistants);
  } catch {
    return NextResponse.json({ error: "Failed to fetch assistants" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, permissions } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAssistant = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "assistant",
        permissions: permissions || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        is_active: true,
      },
    });

    return NextResponse.json({ success: true, data: newAssistant }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 });
  }
}
