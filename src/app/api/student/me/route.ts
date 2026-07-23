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
    // Exclude password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...studentData } = student;
    return NextResponse.json(studentData);
  } catch (error) {
    console.error("Student ME API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
