import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid material ID" }, { status: 400 });

    const material = await prisma.noteMaterial.findUnique({
      where: { id },
      select: { title: true, is_public: true, course_id: true }
    });

    if (!material || !material.is_public) {
      return NextResponse.json({ error: "Material not found or not public" }, { status: 404 });
    }

    const { name, phone, study_level } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    let messageText = `Lead collected from Public Material: ${material.title}`;
    if (study_level) {
      messageText += `\nStudy Level: ${study_level}`;
    }

    const submission = await prisma.formSubmission.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        message: messageText,
        type: "MARKETING",
        course_id: material.course_id
      }
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Material lead collection error:", error);
    return NextResponse.json({ error: "Failed to submit lead" }, { status: 500 });
  }
}
