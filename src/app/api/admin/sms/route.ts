import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendSMS } from "@/lib/sms";
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

export async function POST(req: NextRequest) {
  try {
    const hasPerm = await checkPermission("sms");
    if (!hasPerm) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      target_type, 
      target_id, 
      custom_numbers, 
      message_template, 
      send_to_student, 
      send_to_parent, 
      sms_type = "general" 
    } = body;

    if (!message_template) {
      return NextResponse.json({ error: "Message template is required" }, { status: 400 });
    }

    let students: any[] = [];

    // Fetch students based on target type
    if (target_type === "course") {
      if (!target_id) return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
      students = await prisma.student.findMany({
        where: {
          batch: {
            course_id: parseInt(target_id)
          },
          status: "active"
        }
      });
    } else if (target_type === "batch") {
      if (!target_id) return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
      students = await prisma.student.findMany({
        where: {
          batch_id: parseInt(target_id),
          status: "active"
        }
      });
    } else if (target_type === "student") {
      if (!target_id) return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
      const student = await prisma.student.findUnique({
        where: { id: parseInt(target_id) }
      });
      if (student) students = [student];
    } else if (target_type === "custom") {
      // Just process numbers directly, we don't have student records for replacing {name}
      if (!custom_numbers || !Array.isArray(custom_numbers) || custom_numbers.length === 0) {
        return NextResponse.json({ error: "Custom numbers are required" }, { status: 400 });
      }
      
      const logs = [];
      for (const phone of custom_numbers) {
        if (!phone) continue;
        const res = await sendSMS(phone, message_template);
        logs.push({
          phone,
          message: message_template,
          type: sms_type,
          status: res ? "sent" : "failed",
          sent_at: res ? new Date() : null,
        });
      }
      await prisma.smsLog.createMany({ data: logs });
      return NextResponse.json({ success: true, count: logs.length });
    } else {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    if (students.length === 0) {
      return NextResponse.json({ error: "No active students found for this target." }, { status: 404 });
    }

    let sentCount = 0;
    const logs = [];

    for (const student of students) {
      // Replace variables
      const personalizedMessage = message_template
        .replace(/{name}/g, student.name || "")
        .replace(/{student_id}/g, student.student_id || "");

      // Send to student
      if (send_to_student && student.phone) {
        const res = await sendSMS(student.phone, personalizedMessage);
        if (res) sentCount++;
        logs.push({
          student_id: student.id,
          phone: student.phone,
          message: personalizedMessage,
          type: sms_type,
          status: res ? "sent" : "failed",
          sent_at: res ? new Date() : null,
        });
      }

      // Send to parent
      if (send_to_parent && student.parent_phone) {
        const res = await sendSMS(student.parent_phone, personalizedMessage);
        if (res) sentCount++;
        logs.push({
          student_id: student.id,
          phone: student.parent_phone,
          message: personalizedMessage,
          type: sms_type,
          status: res ? "sent" : "failed",
          sent_at: res ? new Date() : null,
        });
      }
    }

    // Save logs
    if (logs.length > 0) {
      await prisma.smsLog.createMany({ data: logs });
    }

    return NextResponse.json({ 
      success: true, 
      sentCount, 
      totalAttempted: logs.length 
    });

  } catch (error: any) {
    console.error("SMS API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
