import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (!adminPayload || adminPayload.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, permissions, is_active } = body;
    const id = parseInt(params.id);

    const dataToUpdate: Record<string, unknown> = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (permissions) dataToUpdate.permissions = permissions;
    if (is_active !== undefined) dataToUpdate.is_active = is_active;
    
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: { id: updated.id, email: updated.email } });
  } catch {
    return NextResponse.json({ error: "Failed to update assistant" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (!adminPayload || adminPayload.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const id = parseInt(params.id);
    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete assistant" }, { status: 500 });
  }
}
