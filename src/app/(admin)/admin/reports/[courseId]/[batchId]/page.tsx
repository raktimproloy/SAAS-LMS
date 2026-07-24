import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { StudentReportTable } from "./StudentReportTable";

export default async function BatchReportsPage({ params }: { params: { courseId: string; batchId: string } }) {
  const courseId = parseInt(params.courseId);
  const batchId = parseInt(params.batchId);
  if (isNaN(courseId) || isNaN(batchId)) notFound();

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: true,
      students: {
        include: {
          attendance: true,
          reports: true,
          reviews: {
            take: 1,
            orderBy: { created_at: "desc" }
          }
        },
        orderBy: { name: "asc" }
      }
    }
  });

  if (!batch) notFound();

  // Process student data into a cleaner format for the client component
  const students = batch.students.map(student => {
    const presentCount = student.attendance.filter(a => a.status === 'present').length;
    const totalAttendance = student.attendance.length;
    const attendancePercentage = totalAttendance === 0 ? 0 : Math.round((presentCount / totalAttendance) * 100);
    
    // Average rating from their review if any, else default 0 or 5
    const rating = student.reviews.length > 0 ? student.reviews[0].rating : null;

    return {
      id: student.id,
      student_id: student.student_id,
      name: student.name,
      photo: student.photo,
      attendancePercentage,
      rating,
      reportCount: student.reports.length,
      attendance: student.attendance,
      reports: student.reports
    };
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/admin/reports/${courseId}`} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {batch.name} Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            {batch.course.title} • {students.length} Students
          </p>
        </div>
      </div>

      <StudentReportTable students={students} />
    </div>
  );
}
