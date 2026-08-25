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

export async function POST(request: Request) {
  const hasPerm = await checkPermission("payments");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const { parent_payment_id, amount, paid_at, note } = body;

    if (!parent_payment_id || !amount) {
      return NextResponse.json({ error: "parent_payment_id and amount are required" }, { status: 400 });
    }

    const parentId = parseInt(parent_payment_id);
    const payAmount = parseFloat(amount);
    if (isNaN(parentId) || isNaN(payAmount) || payAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
    }

    const parent = await prisma.payment.findUnique({ where: { id: parentId } });
    if (!parent) return NextResponse.json({ error: "Original payment not found" }, { status: 404 });

    const dueAmt = parent.due_amount || 0;
    if (payAmount > dueAmt + 0.001) {
      return NextResponse.json({ error: `Cannot exceed due ৳${dueAmt}` }, { status: 400 });
    }

    const paidDate = paid_at ? new Date(`${paid_at}T12:00:00.000Z`) : new Date();
    const remainingDue = Math.max(0, Math.round((dueAmt - payAmount) * 100) / 100);

    const prefix = `INV-${parent.year}${String(parent.month).padStart(2, "0")}-`;
    const lastPayment = await prisma.payment.findFirst({
      where: { invoice: { startsWith: prefix } },
      orderBy: { invoice: "desc" },
    });
    let seq = 1;
    if (lastPayment?.invoice) {
      const lastSeq = parseInt(lastPayment.invoice.replace(prefix, ""));
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }
    const invoice = `${prefix}${seq.toString().padStart(4, "0")}`;

    const settlementNote = note?.trim()
      ? note.trim()
      : `Due settlement for ${parent.invoice || `#${parent.id}`}`;

    const [newPayment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          student_id: parent.student_id,
          amount: payAmount,
          discount: 0,
          due_amount: 0,
          month: paidDate.getUTCMonth() + 1,
          year: paidDate.getUTCFullYear(),
          status: "paid",
          payment_type: parent.payment_type,
          invoice,
          note: settlementNote,
          paid_at: paidDate,
        },
      }),
      prisma.payment.update({
        where: { id: parentId },
        data: {
          due_amount: remainingDue,
          status: remainingDue > 0 ? "partial" : "paid",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Due payment recorded",
      payment: newPayment,
      remaining_due: remainingDue,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record due payment" }, { status: 500 });
  }
}
