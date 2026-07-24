import prisma from "@/lib/db";
import Link from "next/link";
import { BookOpen, Users, FolderKanban } from "lucide-react";

export default async function ReportsIndexPage() {
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
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports Overview</h1>
        <p className="text-muted-foreground mt-1">Select a course to view detailed batch and student reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 perspective-1000">
        {coursesWithStats.length === 0 ? (
          <div className="col-span-full py-12 text-center border rounded-xl border-dashed bg-slate-50 dark:bg-slate-900/20">
            <p className="text-muted-foreground">No courses available.</p>
          </div>
        ) : (
          coursesWithStats.map((course) => (
            <Link key={course.id} href={`/admin/reports/${course.id}`} className="group block h-full" style={{ perspective: '1000px' }}>
              {/* 3D Card Container */}
              <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl p-6 transition-all duration-300 ease-out transform-gpu group-hover:-translate-y-2 group-hover:rotate-x-2 group-hover:-rotate-y-2 group-hover:shadow-[20px_20px_40px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(255,255,255,0.8)] dark:group-hover:shadow-[20px_20px_40px_rgba(0,0,0,0.4),-5px_-5px_15px_rgba(255,255,255,0.05)] border shadow-md flex flex-col" style={{ transformStyle: 'preserve-3d' }}>
                
                {/* Decorative Top Gradient Edge */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/40 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-6" style={{ transform: 'translateZ(20px)' }}>
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
                    ID: {course.id}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary transition-colors" style={{ transform: 'translateZ(30px)' }}>
                  {course.title}
                </h3>
                
                <div className="mt-auto pt-6 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800" style={{ transform: 'translateZ(20px)' }}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>Batches</span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{course._count.batches}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>Students</span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{course.totalStudents}</span>
                  </div>
                </div>
                
                {/* 3D Depth Shadow Effect inside */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
