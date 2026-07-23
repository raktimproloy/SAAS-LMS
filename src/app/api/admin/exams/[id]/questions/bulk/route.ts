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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("exams");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { questions } = await request.json();
    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array of questions." }, { status: 400 });
    }

    const examId = parseInt(params.id);
    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const idMap: Record<string, number> = {};

    // We use an interactive transaction to safely bulk update questions and their children
    await prisma.$transaction(async (tx) => {
      for (const q of questions) {
        const isNewParent = typeof q.id === 'string' && q.id.startsWith('new_');
        let parentId: number | null = null;

        if (isNewParent) {
          const newQ = await tx.examQuestion.create({
            data: {
              exam_id: examId,
              question_text: q.question_text,
              type: q.type,
              options: q.options || undefined,
              correct_option: q.correct_option,
              marks: q.marks !== undefined ? parseFloat(q.marks) : undefined,
              explanation: q.explanation,
              sort_order: q.sort_order,
              parent_id: null,
            }
          });
          idMap[q.id] = newQ.id;
          parentId = newQ.id;
        } else if (q.id) {
          const parsedId = parseInt(q.id);
          await tx.examQuestion.update({
            where: { id: parsedId },
            data: {
              question_text: q.question_text,
              type: q.type,
              options: q.options || undefined,
              correct_option: q.correct_option,
              marks: q.marks !== undefined ? parseFloat(q.marks) : undefined,
              explanation: q.explanation,
              sort_order: q.sort_order,
              parent_id: null,
            }
          });
          parentId = parsedId;
        }

        if (q.children && Array.isArray(q.children)) {
          for (const cq of q.children) {
            const isNewChild = typeof cq.id === 'string' && cq.id.startsWith('new_');
            if (isNewChild) {
              const newCq = await tx.examQuestion.create({
                data: {
                  exam_id: examId,
                  question_text: cq.question_text,
                  type: cq.type,
                  options: cq.options || undefined,
                  correct_option: cq.correct_option,
                  marks: cq.marks !== undefined ? parseFloat(cq.marks) : undefined,
                  explanation: cq.explanation,
                  sort_order: cq.sort_order,
                  parent_id: parentId,
                }
              });
              idMap[cq.id] = newCq.id;
            } else if (cq.id) {
              await tx.examQuestion.update({
                where: { id: parseInt(cq.id) },
                data: {
                  question_text: cq.question_text,
                  type: cq.type,
                  options: cq.options || undefined,
                  correct_option: cq.correct_option,
                  marks: cq.marks !== undefined ? parseFloat(cq.marks) : undefined,
                  explanation: cq.explanation,
                  sort_order: cq.sort_order,
                  parent_id: parentId,
                }
              });
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, idMap });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update questions bulk" }, { status: 500 });
  }
}
