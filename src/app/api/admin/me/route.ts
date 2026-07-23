import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id as number },
      select: { id: true, name: true, email: true, role: true, permissions: true, is_active: true }
    });

    if (!admin || !admin.is_active) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
