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

export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const formSubmissions = await prisma.formSubmission.findMany({
      include: {
        course: {
          select: { title: true }
        }
      }
    });

    const examParticipants = await prisma.publicExamParticipant.findMany({
      include: {
        exam: {
          select: { title: true }
        }
      }
    });

    const unifiedLeads = [
      ...formSubmissions.map(f => ({
        id: `form_${f.id}`,
        raw_id: f.id,
        kind: 'form',
        name: f.name,
        phone: f.phone,
        email: f.email,
        message: f.message,
        type: f.type,
        status: f.status,
        created_at: f.created_at,
        source: f.course ? `Course: ${f.course.title}` : (f.type === 'MARKETING' ? 'Marketing / Material' : 'Contact Form'),
      })),
      ...examParticipants.map(p => ({
        id: `exam_${p.id}`,
        raw_id: p.id,
        kind: 'exam',
        name: p.name,
        phone: p.phone,
        email: null,
        message: p.study_level ? `Study Level: ${p.study_level}` : null,
        type: 'PUBLIC_EXAM',
        status: 'COLLECTED', 
        created_at: p.created_at,
        source: p.exam ? `Exam: ${p.exam.title}` : 'Public Exam',
      }))
    ];

    unifiedLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return NextResponse.json(unifiedLeads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
