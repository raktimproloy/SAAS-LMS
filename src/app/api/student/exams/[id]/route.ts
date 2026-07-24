import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const studentId = payload.id as number;
    const examId = parseInt(params.id);

    // Check if result already exists (for practice mode info, if needed later)
    const existingResult = await prisma.examResult.findFirst({
      where: { exam_id: examId, student_id: studentId }
    });

    // We allow retaking exams for practice. The frontend will handle it.


    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          select: {
            id: true,
            question_text: true,
            options: true,
            marks: true,
            sort_order: true,
            type: true,
            parent_id: true
          },
          orderBy: { sort_order: 'asc' }
        }
      }
    });

    if (!exam || !["active", "published", "completed"].includes(exam.status)) {
      return NextResponse.json({ error: "Exam not available" }, { status: 404 });
    }

    const now = new Date();
    if (exam.start_time && now < exam.start_time) {
      return NextResponse.json({ error: "Exam has not started yet" }, { status: 403 });
    }

    if (exam.end_time && now > exam.end_time) {
      return NextResponse.json({ error: "Exam has ended" }, { status: 403 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Student exam API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const studentId = payload.id as number;
    const examId = parseInt(params.id);
    const body = await request.json();
    const { answers, time_taken_seconds } = body; // answers is an object mapping question_id -> "a"|"b"|"c"|"d"

    // Prevent double submission
    const existingResult = await prisma.examResult.findFirst({
      where: { exam_id: examId, student_id: studentId }
    });


    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    // Validate submission time (optional strictness, but we skip tight check for now)
    const now = new Date();
    // Allow slight buffer if they submitted right at the end
    if (exam.end_time) {
      const bufferEndTime = new Date(exam.end_time.getTime() + 5 * 60000); // 5 mins buffer
      if (now > bufferEndTime) {
        return NextResponse.json({ error: "Submission rejected: time limit exceeded" }, { status: 403 });
      }
    }

    // Evaluate answers
    let obtained_marks = 0;
    let correct_count = 0;
    let wrong_count = 0;
    let skipped_count = 0;

    exam.questions.forEach(q => {
      const studentAnswer = answers[q.id];
      if (!studentAnswer) {
        skipped_count++;
      } else if (studentAnswer === q.correct_option) {
        correct_count++;
        obtained_marks += q.marks;
      } else {
        wrong_count++;
        obtained_marks -= exam.negative_marking;
      }
    });

    // If already submitted, this is a practice attempt. We don't record it, just return the evaluated result.
    if (existingResult) {
      return NextResponse.json({ 
        success: true, 
        is_practice: true,
        practice_result: {
          obtained_marks,
          total_marks: exam.questions.reduce((acc, q) => acc + (q.marks || 0), 0),
          correct_count,
          wrong_count,
          skipped_count,
          answers,
          time_taken_seconds,
          questions: exam.questions
        }
      });
    }

    // Create result
    const result = await prisma.examResult.create({
      data: {
        exam_id: examId,
        student_id: studentId,
        obtained_marks,
        total_marks: exam.questions.reduce((acc, q) => acc + (q.marks || 0), 0),
        correct_count,
        wrong_count,
        skipped_count,
        answers,
        time_taken_seconds,
      }
    });

    // Rank calculation logic: this could be done via a trigger or a separate job.
    // For now, we will update all ranks for this exam in this request (can be heavy if many users submit simultaneously, but fine for LMS scale).
    const allResults = await prisma.examResult.findMany({
      where: { exam_id: examId },
      orderBy: [
        { obtained_marks: 'desc' },
        { time_taken_seconds: 'asc' }
      ]
    });

    // Update ranks
    for (let i = 0; i < allResults.length; i++) {
      await prisma.examResult.update({
        where: { id: allResults[i].id },
        data: { rank: i + 1 }
      });
    }

    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error) {
    console.error("Exam submission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
