import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { siteConfig } from "@/config/site.config";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

// Helper removed since ID is manually entered

export async function GET(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const course_id = searchParams.get("course_id");
  const batch_id = searchParams.get("batch_id");
  const status = searchParams.get("status");
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    if (batch_id) {
      whereClause.batch_id = parseInt(batch_id);
    } else if (course_id) {
      whereClause.batch = { course_id: parseInt(course_id) };
    }
    if (status && status !== "all") {
      whereClause.status = status;
    }
    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { student_id: { contains: q } },
        { phone: { contains: q } },
        { parent_phone: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const include = {
      batch: {
        include: {
          course: true
        }
      },
    } as const;

    const toSafe = (s: { password?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = s;
      return rest;
    };

    // Paginated response when `page` is present; otherwise return a raw array
    // so QR cards, payments, and scanner keep working.
    if (pageParam) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(limitParam || "20", 10) || 20));
      const skip = (page - 1) * limit;

      const [students, total] = await prisma.$transaction([
        prisma.student.findMany({
          where: whereClause,
          include,
          orderBy: { created_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.student.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        students: students.map(toSafe),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include,
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(students.map(toSafe));
  } catch {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("students");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    const {
      student_id, name, gender, dob, phone, email, password, batch_id,
      parent_name, parent_phone, address, photo,
      // Payment fields
      payment_amount, payment_due, payment_status, payment_note,
      // SMS fields
      send_welcome_sms, welcome_sms_template
    } = body;

    // If password is not provided, use phone as password
    const finalPassword = password || phone;

    const missingFields: string[] = [];
    if (!student_id) missingFields.push("Student ID");
    if (!name) missingFields.push("Full Name");
    if (!gender) missingFields.push("Gender");
    if (!dob) missingFields.push("Date of Birth");
    if (!phone) missingFields.push("Student Phone");
    if (!batch_id) missingFields.push("Batch");

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Required fields are missing: ${missingFields.join(", ")}` }, { status: 400 });
    }

    // Check if student_id already exists
    const existingId = await prisma.student.findUnique({
      where: { student_id }
    });
    if (existingId) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 });
    }

    // Check if phone/email already exists
    const existing = await prisma.student.findFirst({
      where: { phone }
    });
    if (existing) {
      return NextResponse.json({ error: "Student with this phone number already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const newStudent = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          student_id,
          name,
          gender,
          dob: dob ? new Date(dob) : null,
          phone,
          email,
          password: hashedPassword,
          batch_id: parseInt(batch_id),
          parent_name,
          parent_phone,
          address,
          photo,
        }
      });

      // Handle Initial Payment if provided
      if (payment_amount !== undefined && payment_amount !== null && payment_amount !== "") {
        const amt = parseFloat(payment_amount);
        const due = parseFloat(payment_due || "0");
        const status = payment_status || (due > 0 ? "partial" : "paid");

        const currentDate = new Date();
        const receiptNumber = `RCPT-${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

        await tx.payment.create({
          data: {
            student_id: student.id,
            amount: amt,
            due_amount: due,
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            status: status,
            receipt_number: receiptNumber,
            paid_at: amt > 0 ? new Date() : null,
            note: payment_note || "Initial Enrollment Payment",
          }
        });
      }

      return student;
    });

    // Send Welcome SMS (outside transaction)
    if (send_welcome_sms && welcome_sms_template) {
      // Lazy load SMS utility to avoid circular dependencies or if it's only needed here
      const { sendSMS } = await import("@/lib/sms");
      const personalizedMessage = welcome_sms_template
        .replace(/\{name\}/gi, newStudent.name || "")
        .replace(/\{student_id\}/gi, newStudent.student_id || "")
        .replace(/\{institute\}/gi, siteConfig.instituteName)
        .replace(/\{course\}/gi, "");

      const smsResult = await sendSMS(newStudent.phone, personalizedMessage);
      
      // Log it
      await prisma.smsLog.create({
        data: {
          student_id: newStudent.id,
          phone: newStudent.phone,
          message: personalizedMessage,
          type: "enrollment",
          status: smsResult ? "sent" : "failed",
          sent_at: smsResult ? new Date() : null,
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeStudent } = newStudent;
    return NextResponse.json({ success: true, data: safeStudent }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
