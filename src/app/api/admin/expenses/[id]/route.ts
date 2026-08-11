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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("expenses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { title, description, amount, expended_by, permitted_by, expense_date, note } = body;

    const existingExpense = await prisma.expense.findUnique({ where: { id } });
    if (!existingExpense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (expended_by !== undefined) updateData.expended_by = expended_by || null;
    if (permitted_by !== undefined) updateData.permitted_by = permitted_by || null;
    if (expense_date !== undefined) updateData.expense_date = new Date(expense_date);
    if (note !== undefined) updateData.note = note || null;

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedExpense });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("expenses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existingExpense = await prisma.expense.findUnique({ where: { id } });
    if (!existingExpense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
