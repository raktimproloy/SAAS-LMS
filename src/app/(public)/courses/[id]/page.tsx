import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { CourseDetailView, DetailedCourse } from "@/components/public/courses/CourseDetailView";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
  searchParams?: { batch?: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const courseId = parseInt(params.id);
  const course = await prisma.course.findFirst({
    where: isNaN(courseId) ? { slug: params.id } : { id: courseId },
    select: { title: true, details: true },
  });

  if (!course) return { title: "কোর্স পাওয়া যায়নি" };

  return {
    title: `${course.title} - বিস্তারিত কারিকুলাম ও শিডিউল`,
    description: course.details || `${course.title}-এর বিস্তারিত কারিকুলাম ও সিলেবাস রোডম্যাপ`,
  };
}

export default async function PublicCourseDetailPage({ params, searchParams }: PageProps) {
  const courseId = parseInt(params.id);
  const initialBatchId = searchParams?.batch ? parseInt(searchParams.batch) : undefined;

  const course = await prisma.course.findFirst({
    where: isNaN(courseId) ? { slug: params.id } : { id: courseId },
    include: {
      batches: {
        where: { status: { in: ["active", "PUBLISHED"] } },
        orderBy: { sort_order: "asc" },
        include: {
          curriculums: {
            where: { status: { in: ["active", "draft"] } },
            include: {
              sessions: {
                orderBy: { date: "asc" },
                include: {
                  topics: { orderBy: { sort_order: "asc" } },
                  homework: true,
                  exams: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Format sessions to match DraftSession structure
  const formattedCourse: DetailedCourse = {
    id: course.id,
    title: course.title,
    fee: course.fee,
    discount_fee: course.discount_fee,
    details: course.details,
    batches: course.batches.map((b) => ({
      id: b.id,
      name: b.name,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status,
      max_students: b.max_students,
      class_days: b.class_days,
      curriculums: b.curriculums.map((c) => ({
        id: c.id,
        title: c.title,
        start_date: c.start_date.toISOString(),
        end_date: c.end_date.toISOString(),
        class_days: c.class_days,
        status: c.status,
        is_public: c.is_public,
        sessions: c.sessions.map((s) => ({
          id: s.id,
          date: s.date.toISOString().split("T")[0],
          session_number: s.session_number,
          session_type:
            (s as any).session_type ||
            (s.holiday_name === "Skipped Class"
              ? "skipped"
              : s.is_holiday
                ? "holiday"
                : (s as any).is_exam
                  ? "exam"
                  : "class"),
          is_holiday: s.is_holiday,
          holiday_name: s.holiday_name,
          is_exam: s.is_exam,
          exam_title: s.exam_title,
          is_cancelled: s.is_cancelled,
          is_completed: s.is_completed,
          extra_days: s.extra_days,
          topics: s.topics.map((t) => ({
            id: t.id,
            chapter_name: t.chapter_name,
            topic_name: t.topic_name,
            subject: t.subject || null,
            size: t.size,
            sort_order: t.sort_order,
            is_custom: t.is_custom,
          })),
        })),
      })),
    })),
  };

  return <CourseDetailView course={formattedCourse} initialBatchId={initialBatchId} />;
}
