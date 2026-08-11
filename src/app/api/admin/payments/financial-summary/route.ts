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

export async function GET(request: Request) {
  const hasPerm = await checkPermission("payments");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const month = searchParams.get("month"); // YYYY-MM
    const type = searchParams.get("type");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    const where: any = {};
    if (search) {
      where.OR = [
        { student: { name: { contains: search } } },
        { student: { student_id: { contains: search } } },
        { invoice: { contains: search } },
        { receipt_number: { contains: search } },
      ];
    }
    if (month) {
      const [y, m] = month.split("-");
      where.year = parseInt(y);
      where.month = parseInt(m);
    }
    if (type) {
      where.payment_type = type;
    }
    if (start_date && end_date) {
      where.created_at = {
        gte: new Date(`${start_date}T00:00:00.000Z`),
        lte: new Date(`${end_date}T23:59:59.999Z`),
      };
    } else if (start_date) {
      where.created_at = { gte: new Date(`${start_date}T00:00:00.000Z`) };
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        amount: true,
        discount: true,
        student_id: true,
      }
    });

    let totalCollected = 0;
    let totalDiscount = 0;
    const uniqueStudents = new Set();

    for (const p of payments) {
      totalCollected += p.amount;
      totalDiscount += p.discount;
      uniqueStudents.add(p.student_id);
    }

    return NextResponse.json({
      totalCollected,
      totalDiscount,
      netCollected: totalCollected - totalDiscount,
      studentCount: uniqueStudents.size,
      paymentCount: payments.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to compute financial summary" }, { status: 500 });
  }
}
