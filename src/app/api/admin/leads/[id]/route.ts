import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkAuth() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return !!payload;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await checkAuth();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const rawIdStr = params.id;
    if (!rawIdStr.startsWith('form_')) {
      return NextResponse.json({ error: "Cannot change status of this lead type" }, { status: 400 });
    }

    const id = parseInt(rawIdStr.replace('form_', ''));
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { status } = body;

    const lead = await prisma.formSubmission.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Update lead error", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await checkAuth();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const rawIdStr = params.id;
    
    if (rawIdStr.startsWith('form_')) {
      const id = parseInt(rawIdStr.replace('form_', ''));
      if (!isNaN(id)) {
        await prisma.formSubmission.delete({ where: { id } });
      }
    } else if (rawIdStr.startsWith('exam_')) {
      const id = parseInt(rawIdStr.replace('exam_', ''));
      if (!isNaN(id)) {
        await prisma.publicExamParticipant.delete({ where: { id } });
      }
    } else {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lead error", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
