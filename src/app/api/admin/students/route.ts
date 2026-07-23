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

// Helper to format ID like #0001
function formatStudentId(count: number): string {
  return `#${(count + 1).toString().padStart(4, "0")}`;
}

export async function GET() {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const students = await prisma.student.findMany({
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
      name, gender, dob, phone, email, password, batch_id,
      parent_name, parent_phone, address
    } = body;

    if (!name || !gender || !phone || !password || !batch_id) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    // Check if phone/email already exists (optional but good practice)
    const existing = await prisma.student.findFirst({
      where: { phone }
    });
    if (existing) {
      return NextResponse.json({ error: "Student with this phone number already exists" }, { status: 400 });
    }

    // Generate student_id
    const studentCount = await prisma.student.count();
    const student_id = formatStudentId(studentCount);

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
