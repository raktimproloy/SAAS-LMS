import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const student = await prisma.student.findUnique({
      where: { id: payload.id as number },
      include: {
        batch: {
          include: {
            course: true,
          }
        }
      }
    });

    if (!student || student.status !== "active") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Exclude password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...studentData } = student;
    return NextResponse.json(studentData);
  } catch (error) {
    console.error("Student ME API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    // Students may only self-service these fields. Everything else
    // (student_id, batch, phone, guardian info, status) stays admin-managed.
    const updateData: Record<string, unknown> = {};
    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (!trimmed) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      updateData.name = trimmed;
    }
    if (typeof body.address === "string") updateData.address = body.address.trim() || null;
    if (typeof body.photo === "string") updateData.photo = body.photo.trim() || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.student.update({
      where: { id: payload.id as number },
      data: updateData,
      include: { batch: { include: { course: true } } },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...studentData } = updated;
    return NextResponse.json({ success: true, data: studentData });
  } catch (error) {
    console.error("Student profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
