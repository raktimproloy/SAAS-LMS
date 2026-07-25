import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { student_id: { contains: q } }
        ]
      },
      select: {
        id: true,
        name: true,
        student_id: true,
        photo: true,
        batch_id: true,
        batch: { select: { name: true } }
      },
      take: 5
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
