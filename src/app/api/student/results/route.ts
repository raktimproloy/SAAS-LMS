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
    const studentId = payload.id as number;

    const results = await prisma.examResult.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' },
      include: {
        exam: {
          include: {
            course: true
          }
        }
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
