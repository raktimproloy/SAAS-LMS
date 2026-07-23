import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const questions = await prisma.examQuestion.findMany({
      where: { exam_id: parseInt(params.id) },
      orderBy: { sort_order: "asc" },
      include: {
        children: {
          orderBy: { sort_order: "asc" }
        }
      }
    });
    // Return only top level (parent_id = null)
    const topLevel = questions.filter(q => q.parent_id === null);
    return NextResponse.json(topLevel);
  } catch {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { 
      type, question_text, options, correct_option, 
      marks, explanation, parent_id
    } = body;

    if (!question_text) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 });
    }

    const exam_id = parseInt(params.id);

    // Get current max sort_order
    const lastQuestion = await prisma.examQuestion.findFirst({
      where: { exam_id },
      orderBy: { sort_order: "desc" }
    });
    const sort_order = lastQuestion ? lastQuestion.sort_order + 1 : 1;

    const newQuestion = await prisma.examQuestion.create({
      data: {
        exam_id,
        type: type || "mcq",
        parent_id: parent_id || null,
        question_text,
        options: options || undefined,
        correct_option,
        marks: marks ? parseFloat(marks) : (type === 'passage' ? 0 : 1.0),
        explanation,
        sort_order
      }
    });

    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}
