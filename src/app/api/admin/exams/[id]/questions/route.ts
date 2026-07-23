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
    });
    return NextResponse.json(questions);
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
      question_text, option_a, option_b, option_c, option_d, 
      correct_option, marks, explanation 
    } = body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
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
        question_text,
        option_a, option_b, option_c, option_d,
        correct_option,
        marks: marks ? parseFloat(marks) : 1.0,
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
