import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const examId = parseInt(params.id);
    const body = await request.json();
    const { answers, time_taken_seconds, lead_name, lead_phone, lead_class, dry_run } = body;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam || !exam.is_public) {
      return NextResponse.json({ error: "Exam not found or not public" }, { status: 404 });
    }

    if (!dry_run) {
      if (exam.collect_lead) {
        if (!lead_name || !lead_phone) {
          return NextResponse.json({ error: "Name and Phone are required." }, { status: 400 });
        }
        if (exam.lead_mandatory && !lead_class) {
          return NextResponse.json({ error: "Class Level is required." }, { status: 400 });
        }
      }

      // Check if this phone number already attempted this exam
      if (lead_phone) {
        const existingParticipant = await prisma.publicExamParticipant.findFirst({
          where: {
            exam_id: examId,
            phone: lead_phone.trim()
          }
        });

        if (existingParticipant) {
          return NextResponse.json({ error: "You have already attempted this exam with this phone number." }, { status: 403 });
        }
      }
    }

    // Evaluate answers
    let obtained_marks = 0;
    let correct_count = 0;
    let wrong_count = 0;
    let skipped_count = 0;

    exam.questions.forEach(q => {
      if (q.type === 'passage') return;
      
      const studentAnswer = answers[q.id];
      if (!studentAnswer) {
        skipped_count++;
      } else if (studentAnswer === q.correct_option) {
        correct_count++;
        obtained_marks += (q.marks || 0);
      } else {
        wrong_count++;
        obtained_marks -= (exam.negative_marking || 0);
      }
    });

    const total_marks = exam.questions.reduce((acc, q) => acc + (q.type === 'passage' ? 0 : (q.marks || 0)), 0);

    if (!dry_run) {
      // Create result
      const result = await prisma.examResult.create({
        data: {
          exam_id: examId,
          student_id: null, // Null for public participants
          obtained_marks,
          total_marks,
          correct_count,
          wrong_count,
          skipped_count,
          answers,
          time_taken_seconds,
        }
      });

      // Create public participant record if they provided lead info
      if (lead_name && lead_phone) {
        await prisma.publicExamParticipant.create({
          data: {
            exam_id: examId,
            name: lead_name.trim(),
            phone: lead_phone.trim(),
            study_level: lead_class?.trim() || null,
            exam_result_id: result.id
          }
        });
      }
    }

    // Return result structure compatible with ExamInterface's practice mode
    return NextResponse.json({ 
      success: true, 
      is_practice: true,
      practice_result: {
        obtained_marks,
        total_marks,
        correct_count,
        wrong_count,
        skipped_count,
        answers,
        time_taken_seconds,
        questions: exam.questions
      }
    });

  } catch (error) {
    console.error("Public exam submission error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
