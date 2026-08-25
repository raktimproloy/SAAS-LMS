import prisma from "@/lib/db";
import Link from "next/link";
import { BookOpen, Users, FolderKanban, GraduationCap, Activity } from "lucide-react";

export default async function ReportsIndexPage() {
  // Fetch aggregate stats for the dashboard header
  const [totalCourses, totalBatches, totalActiveStudents] = await Promise.all([
    prisma.course.count(),
    prisma.batch.count(),
    prisma.student.count({ where: { status: "active" } }),
  ]);

  // Fetch courses with counts for batches and students to display info
  const courses = await prisma.course.findMany({
    orderBy: { sort_order: "asc" },
    include: {
      _count: {
        select: {
          batches: true,
        },
      },
      batches: {
        include: {
          _count: {
            select: { students: true }
          }
        }
      }
    },
  });

  // Calculate total students per course by summing up batch student counts
  const coursesWithStats = courses.map(course => {
    const totalStudents = course.batches.reduce((sum, batch) => sum + batch._count.students, 0);
    return {
      ...course,
      totalStudents
    };
  });

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 pb-12">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Reports Dashboard</h1>
        <p className="text-lg text-muted-foreground">Monitor and analyze student performance, attendance, and activities across all courses.</p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-indigo-100 font-medium mb-1">Total Courses</p>
              <h3 className="text-4xl font-bold">{totalCourses}</h3>
            </div>
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-emerald-100 font-medium mb-1">Total Batches</p>
              <h3 className="text-4xl font-bold">{totalBatches}</h3>
            </div>
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-orange-100 font-medium mb-1">Active Students</p>
              <h3 className="text-4xl font-bold">{totalActiveStudents}</h3>
            </div>
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Course Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {coursesWithStats.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 rounded-2xl border-dashed bg-slate-50/50 dark:bg-slate-900/20">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground font-medium">No courses available.</p>
            </div>
          ) : (
            coursesWithStats.map((course) => (
              <Link key={course.id} href={`/admin/reports/${course.id}`} className="group block h-full">
                <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                  
                  {/* Decorative Gradient Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-5">
                    <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ID: {course.id}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="mt-auto pt-5 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <FolderKanban className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-wider">Batches</span>
                      </div>
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{course._count.batches}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-wider">Students</span>
                      </div>
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{course.totalStudents}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
