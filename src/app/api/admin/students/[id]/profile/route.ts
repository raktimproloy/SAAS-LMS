import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || (payload.role !== 'super_admin' && payload.role !== 'assistant')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const studentId = parseInt(params.id);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: {
          include: {
            course: true
          }
        },
        payments: {
          orderBy: { created_at: 'desc' }
        },
        attendance: {
          orderBy: { date: 'desc' }
        },
        exam_results: {
          include: {
            exam: {
              select: { title: true, total_marks: true, type: true }
            }
          },
          orderBy: { created_at: 'desc' }
        },
        reports: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Student profile API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
