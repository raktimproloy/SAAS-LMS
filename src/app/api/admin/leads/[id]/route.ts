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
    const id = parseInt(params.id);
    const body = await request.json();
    const { status } = body;

    const lead = await prisma.formSubmission.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
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
    const id = parseInt(params.id);

    await prisma.formSubmission.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
