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
    if (month) {
      const [y, m] = month.split("-");
      where.year = parseInt(y);
      where.month = parseInt(m);
    }
    if (type) {
      where.payment_type = type;
    }

    const searchOr = search
      ? [
          { student: { name: { contains: search } } },
          { student: { student_id: { contains: search } } },
          { invoice: { contains: search } },
          { receipt_number: { contains: search } },
        ]
      : null;

    let dateOr = null;
    if (start_date && end_date) {
      const gte = new Date(`${start_date}T00:00:00.000Z`);
      const lte = new Date(`${end_date}T23:59:59.999Z`);
      dateOr = [
        { paid_at: { gte, lte } },
        { AND: [{ paid_at: null }, { created_at: { gte, lte } }] },
      ];
    } else if (start_date) {
      const gte = new Date(`${start_date}T00:00:00.000Z`);
      dateOr = [
        { paid_at: { gte } },
        { AND: [{ paid_at: null }, { created_at: { gte } }] },
      ];
    } else if (end_date) {
      const lte = new Date(`${end_date}T23:59:59.999Z`);
      dateOr = [
        { paid_at: { lte } },
        { AND: [{ paid_at: null }, { created_at: { lte } }] },
      ];
    }

    if (searchOr && dateOr) {
      where.AND = [{ OR: searchOr }, { OR: dateOr }];
    } else if (searchOr) {
      where.OR = searchOr;
    } else if (dateOr) {
      where.OR = dateOr;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          include: {
            batch: {
              include: { course: true },
            },
          },
        },
      },
      orderBy: [{ paid_at: "desc" }, { created_at: "desc" }],
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
      student_id, amount, discount, payment_type, due_amount, month, year, status, note, receipt_number, paid_at
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

    // Auto generate invoice: INV-YYYYMM-XXXX
    const prefix = `INV-${year}${month.toString().padStart(2, "0")}-`;
    const lastPayment = await prisma.payment.findFirst({
      where: { invoice: { startsWith: prefix } },
      orderBy: { invoice: "desc" }
    });
    let seq = 1;
    if (lastPayment && lastPayment.invoice) {
      const lastSeq = parseInt(lastPayment.invoice.replace(prefix, ""));
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }
    const invoice = `${prefix}${seq.toString().padStart(4, "0")}`;

    const newPayment = await prisma.payment.create({
      data: {
        student_id: parseInt(student_id),
        amount: parseFloat(amount),
        discount: discount ? parseFloat(discount) : 0,
        payment_type: payment_type || null,
        due_amount: due_amount ? parseFloat(due_amount) : 0,
        month: parseInt(month),
        year: parseInt(year),
        status,
        receipt_number: receipt_number || null,
        invoice,
        note: note || "",
        paid_at:
          paid_at
            ? new Date(`${paid_at}T12:00:00.000Z`)
            : status === "paid" || status === "partial"
              ? new Date()
              : null,
      }
    });

    return NextResponse.json({ success: true, data: newPayment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add payment" }, { status: 500 });
  }
}
