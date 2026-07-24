import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import QuestionEditor from "./QuestionEditor";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ExamQuestionsPage({ params }: { params: { id: string } }) {
  const examId = parseInt(params.id);
  if (isNaN(examId)) {
    redirect("/admin/exams");
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId }
  });

  if (!exam) {
    redirect("/admin/exams");
  }

  const questions = await prisma.examQuestion.findMany({
    where: { exam_id: examId, parent_id: null },
    orderBy: { sort_order: "asc" },
    include: {
      children: {
        orderBy: { sort_order: "asc" }
      }
    }
  });

  // Convert Date objects and nulls for client component serialization
  const serializedQuestions = questions.map(q => ({
    ...q,
    options: q.options ? JSON.parse(JSON.stringify(q.options)) : undefined,
    correct_option: q.correct_option || undefined,
    explanation: q.explanation || undefined,
    parent_id: q.parent_id || undefined,
    image_url: (q as any).image_url || undefined,
    image_urls: (q as any).image_urls ? JSON.parse(JSON.stringify((q as any).image_urls)) : undefined,
    children: q.children.map(c => ({
      ...c,
      options: c.options ? JSON.parse(JSON.stringify(c.options)) : undefined,
      correct_option: c.correct_option || undefined,
      explanation: c.explanation || undefined,
      parent_id: c.parent_id || undefined,
      image_url: (c as any).image_url || undefined,
      image_urls: (c as any).image_urls ? JSON.parse(JSON.stringify((c as any).image_urls)) : undefined,
    }))
  }));

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/exams">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Questions</h1>
          <p className="text-muted-foreground mt-1">Add, upload, and organize questions and passages for this exam.</p>
        </div>
      </div>

      <QuestionEditor examId={params.id} initialQuestions={serializedQuestions} defaultMark={exam.total_marks} />
    </div>
  );
}
