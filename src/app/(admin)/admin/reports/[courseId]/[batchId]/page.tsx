import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
          exam_results: {
            include: {
              exam: {
                select: { title: true, type: true, start_time: true, total_marks: true }
              }
            }
          },
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
    
    // Average rating from their review if any, else default null
    const rating = student.reviews.length > 0 ? student.reviews[0].rating : null;

    return {
      id: student.id,
      student_id: student.student_id,
      name: student.name,
      photo: student.photo,
      phone: student.phone,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      attendancePercentage,
      rating,
      reportCount: student.reports.length,
      attendance: student.attendance,
      reports: student.reports,
      allResults: student.exam_results
    };
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <Link href={`/admin/reports/${courseId}`} className="w-fit text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </Link>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 font-semibold text-xs tracking-wider uppercase">
                Batch: {batch.id}
              </Badge>
              <span className="text-sm text-muted-foreground">{batch.course.title}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              {batch.name} Reports
            </h1>
            <p className="text-muted-foreground text-lg">Manage student attendance, examine test results, and file behavioral reports.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Students Enrolled</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white leading-none mt-0.5">{students.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <StudentReportTable students={students} batchId={batch.id} />
      </div>
    </div>
  );
}
