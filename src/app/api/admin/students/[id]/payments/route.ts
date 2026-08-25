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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const hasStudents = await checkPermission("students");
  const hasPayments = await checkPermission("payments");
  if (!hasStudents && !hasPayments) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const studentId = parseInt(params.id);
    if (isNaN(studentId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const [payments, paymentTypes] = await Promise.all([
      prisma.payment.findMany({
        where: { student_id: studentId },
        orderBy: [{ paid_at: "desc" }, { created_at: "desc" }],
      }),
      prisma.paymentType.findMany({ orderBy: { created_at: "asc" } }),
    ]);

    return NextResponse.json({ payments, paymentTypes: paymentTypes.map((t) => t.name) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
