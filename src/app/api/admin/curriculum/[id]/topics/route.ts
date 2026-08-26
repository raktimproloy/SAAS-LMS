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

// Add a topic to a session
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { session_id, nctb_book_id, subject, chapter_name, topic_name, sort_order, size, is_custom } = body;

    if (!session_id || !chapter_name) {
      return NextResponse.json({ error: "session_id and chapter_name are required" }, { status: 400 });
    }

    // Verify session belongs to curriculum
    const session = await prisma.curriculumSession.findFirst({
      where: { 
        id: parseInt(session_id),
        curriculum_id: parseInt(params.id)
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found in this curriculum" }, { status: 404 });
    }

    const newTopic = await prisma.curriculumSessionTopic.create({
      data: {
        session_id: parseInt(session_id),
        nctb_book_id: nctb_book_id ? parseInt(nctb_book_id) : null,
        subject: subject || null,
        chapter_name,
        topic_name: topic_name || null,
        sort_order: sort_order || 0,
        size: size || 1,
        is_custom: is_custom || false
      }
    });

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    console.error("Failed to add topic:", error);
    return NextResponse.json({ error: "Failed to add topic" }, { status: 500 });
  }
}

// We can also add a PUT here for batch reordering if needed in the future,
// but for now, individual updates can be done if needed, or we just drop/recreate on move.
