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
  const hasPerm = await checkPermission("payments");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          include: {
            batch: true
          }
        },
      },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("payments");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { 
      student_id, amount, due_amount, month, year, status, note, receipt_number 
    } = body;

    if (!student_id || !amount || !month || !year || !status) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    if (receipt_number) {
      const existing = await prisma.payment.findUnique({ where: { receipt_number } });
      if (existing) {
        return NextResponse.json({ error: "Receipt number already exists" }, { status: 400 });
      }
    }

    const newPayment = await prisma.payment.create({
      data: {
        student_id: parseInt(student_id),
        amount: parseFloat(amount),
        due_amount: due_amount ? parseFloat(due_amount) : 0,
        month: parseInt(month),
        year: parseInt(year),
        status,
        receipt_number: receipt_number || null,
        note: note || "",
        paid_at: status === "paid" || status === "partial" ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true, data: newPayment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add payment" }, { status: 500 });
  }
}
