import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || (payload.role !== 'super_admin' && payload.role !== 'assistant')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const studentId = parseInt(params.id);
    const body = await request.json();
    const { title, description, type } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const report = await prisma.studentReport.create({
      data: {
        student_id: studentId,
        title,
        description,
        type: type || "general"
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Add report error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
