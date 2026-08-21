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
    const leads = await prisma.formSubmission.findMany({
      include: {
        course: {
          select: { title: true }
        }
      },
      orderBy: { created_at: "desc" }
    });
    
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
