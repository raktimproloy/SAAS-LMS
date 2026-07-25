import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const studentId = payload.id as number;

    // Get student details to know batch and course
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { batch_id: true, batch: { select: { course_id: true } } }
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    // 1. Fetch attendance for current month
    const attendance = await prisma.attendance.findMany({
      where: {
        student_id: studentId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    });

    // 2. Fetch recent result
    const recentResult = await prisma.examResult.findFirst({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' },
      include: {
        exam: {
          select: { title: true, type: true }
        }
      }
    });

    // 3. Fetch all active/published exams and find the next valid one
    const allRelevantExams = await prisma.exam.findMany({
      where: {
        OR: [
          { batch_id: student.batch_id },
          { course_id: student.batch.course_id },
          { is_public: true }
        ],
        status: { in: ["published", "active"] }
      },
      include: {
        results: {
          where: { student_id: studentId }
        }
      },
      orderBy: { start_time: 'asc' }
    });

    const upcomingExam = allRelevantExams.find(e => {
      const isAttempted = e.results && e.results.length > 0;
      if (isAttempted) return false;

      const endTime = e.end_time ? new Date(e.end_time) : null;
      if (endTime && endTime < currentDate) return false;

      return true;
    });

    // 4. Fetch payment status for current month
    const payment = await prisma.payment.findFirst({
      where: {
        student_id: studentId,
        month: currentMonth,
        year: currentYear
      }
    });

    // 5. Fetch recent notices (General, or specific to this batch/course)
    const notices = await prisma.notice.findMany({
      where: {
        OR: [
          { target_type: 'all' },
          { target_type: 'course', target_id: student.batch.course_id },
          { target_type: 'batch', target_id: student.batch_id }
        ]
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // 6. Fetch reports for current month to display on calendar
    const reports = await prisma.studentReport.findMany({
      where: {
        student_id: studentId,
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    });

    // 7. Fetch all exam results for the current month to display on calendar
    const allResults = await prisma.examResult.findMany({
      where: {
        student_id: studentId,
        exam: {
          start_time: {
            gte: startOfMonth,
            lte: endOfMonth,
          }
        }
      },
      include: {
        exam: {
          select: { title: true, type: true, start_time: true, total_marks: true }
        }
      }
    });

    return NextResponse.json({
      attendance,
      recentResult,
      upcomingExam,
      paymentStatus: payment ? payment.status : "due",
      notices,
      reports,
      allResults
    });
  } catch (error) {
    console.error("Student Dashboard API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
