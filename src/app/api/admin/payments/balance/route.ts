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
    const month = searchParams.get("month"); // YYYY-MM
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    const paymentWhere: any = {};
    const expenseWhere: any = {};

    if (month) {
      const [y, m] = month.split("-");
      paymentWhere.year = parseInt(y);
      paymentWhere.month = parseInt(m);
      
      const startDate = new Date(`${y}-${m}-01T00:00:00.000Z`);
      const nextMonth = parseInt(m) === 12 ? 1 : parseInt(m) + 1;
      const nextYear = parseInt(m) === 12 ? parseInt(y) + 1 : parseInt(y);
      const endDate = new Date(`${nextYear}-${nextMonth.toString().padStart(2, "0")}-01T00:00:00.000Z`);
      expenseWhere.expense_date = { gte: startDate, lt: endDate };
    }
    
    if (start_date && end_date) {
      const start = new Date(`${start_date}T00:00:00.000Z`);
      const end = new Date(`${end_date}T23:59:59.999Z`);
      paymentWhere.created_at = { gte: start, lte: end };
      expenseWhere.expense_date = { gte: start, lte: end };
    } else if (start_date) {
      const start = new Date(`${start_date}T00:00:00.000Z`);
      paymentWhere.created_at = { gte: start };
      expenseWhere.expense_date = { gte: start };
    }

    const payments = await prisma.payment.findMany({
      where: paymentWhere,
      select: { amount: true, discount: true }
    });

    const expenses = await prisma.expense.findMany({
      where: expenseWhere,
      select: { amount: true }
    });

    let netCollected = 0;
    for (const p of payments) {
      netCollected += (p.amount - p.discount);
    }

    let totalExpense = 0;
    for (const e of expenses) {
      totalExpense += e.amount;
    }

    return NextResponse.json({
      netCollected,
      totalExpense,
      balance: netCollected - totalExpense
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to compute balance" }, { status: 500 });
  }
}
