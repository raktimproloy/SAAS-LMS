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
  const hasPerm = await checkPermission("payments");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const { amount, due_amount, status, note, receipt_number, month, year } = body;

    const existingPayment = await prisma.payment.findUnique({ where: { id } });
    if (!existingPayment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (due_amount !== undefined) updateData.due_amount = parseFloat(due_amount);
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;
    if (receipt_number !== undefined) updateData.receipt_number = receipt_number || null;
    if (month !== undefined) updateData.month = parseInt(month);
    if (year !== undefined) updateData.year = parseInt(year);

    // Update paid_at if status becomes paid or partial and wasn't before (simple logic)
    if ((status === "paid" || status === "partial") && existingPayment.status === "due") {
      updateData.paid_at = new Date();
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: {
            batch: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: updatedPayment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const hasPerm = await checkPermission("payments");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existingPayment = await prisma.payment.findUnique({ where: { id } });
    if (!existingPayment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    await prisma.payment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}
