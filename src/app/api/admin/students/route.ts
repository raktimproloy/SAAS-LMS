import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

// Helper removed since ID is manually entered

export async function GET(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const course_id = searchParams.get("course_id");
  const batch_id = searchParams.get("batch_id");

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    if (batch_id) {
      whereClause.batch_id = parseInt(batch_id);
    } else if (course_id) {
      whereClause.batch = { course_id: parseInt(course_id) };
    }
    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { student_id: { contains: q } }
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        batch: {
          include: {
            course: true
          }
        },
      },
      orderBy: { created_at: "desc" },
    });
    // Do not return passwords
    const safeStudents = students.map(s => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = s;
      return rest;
    });
    return NextResponse.json(safeStudents);
  } catch {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const {
      student_id, name, gender, dob, phone, email, password, batch_id,
      parent_name, parent_phone, address
    } = body;

    if (!student_id || !name || !gender || !phone || !password || !batch_id) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    // Check if student_id already exists
    const existingId = await prisma.student.findUnique({
      where: { student_id }
    });
    if (existingId) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 });
    }

    // Check if phone/email already exists (optional but good practice)
    const existing = await prisma.student.findFirst({
      where: { phone }
    });
    if (existing) {
      return NextResponse.json({ error: "Student with this phone number already exists" }, { status: 400 });
    }

    // student_id is manually provided

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await prisma.student.create({
      data: {
        student_id,
        name,
        gender,
        dob: dob ? new Date(dob) : null,
        phone,
        email,
        password: hashedPassword,
        batch_id: parseInt(batch_id),
        parent_name,
        parent_phone,
        address,
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeStudent } = newStudent;
    return NextResponse.json({ success: true, data: safeStudent }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
