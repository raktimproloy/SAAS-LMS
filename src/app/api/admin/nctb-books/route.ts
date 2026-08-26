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

export async function GET() {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const books = await prisma.nCTBBook.findMany({
      orderBy: [
        { class_name: "asc" },
        { sort_order: "asc" }
      ]
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error("Failed to fetch NCTB books:", error);
    return NextResponse.json({ error: "Failed to fetch NCTB books" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { class_name, section, subject, chapters, sort_order } = body;

    if (!class_name || !section || !subject || !chapters) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newBook = await prisma.nCTBBook.create({
      data: {
        class_name,
        section,
        subject,
        chapters,
        sort_order: sort_order || 0
      }
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Failed to create NCTB book:", error);
    return NextResponse.json({ error: "Failed to create NCTB book" }, { status: 500 });
  }
}

// In a real app we might also want a DELETE route for books, but we can leave it for now or implement below
export async function DELETE(request: Request) {
  const hasPerm = await checkPermission("curriculum");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.nCTBBook.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete NCTB book:", error);
    return NextResponse.json({ error: "Failed to delete NCTB book" }, { status: 500 });
  }
}
