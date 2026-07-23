import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { 
      name, gender, dob, phone, email, password, batch_id, 
      parent_name, parent_phone, address, status
    } = body;

    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (name) updateData.name = name;
    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = new Date(dob);
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (batch_id) updateData.batch_id = parseInt(batch_id);
    if (parent_name !== undefined) updateData.parent_name = parent_name;
    if (parent_phone !== undefined) updateData.parent_phone = parent_phone;
    if (address !== undefined) updateData.address = address;
    if (status) updateData.status = status;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeStudent } = updatedStudent;
    return NextResponse.json({ success: true, data: safeStudent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    await prisma.student.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete student (might have related records)" }, { status: 500 });
  }
}
