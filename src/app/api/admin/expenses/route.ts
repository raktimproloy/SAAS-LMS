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
  const hasPerm = await checkPermission("expenses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { expended_by: { contains: search } },
        { permitted_by: { contains: search } },
      ];
    }
    if (start_date && end_date) {
      where.expense_date = {
        gte: new Date(`${start_date}T00:00:00.000Z`),
        lte: new Date(`${end_date}T23:59:59.999Z`),
      };
    } else if (start_date) {
      where.expense_date = { gte: new Date(`${start_date}T00:00:00.000Z`) };
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expense_date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("expenses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { title, description, amount, expended_by, permitted_by, expense_date, note } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const newExpense = await prisma.expense.create({
      data: {
        title,
        description: description || null,
        amount: parseFloat(amount),
        expended_by: expended_by || null,
        permitted_by: permitted_by || null,
        expense_date: expense_date ? new Date(expense_date) : new Date(),
        note: note || null,
      }
    });

    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
