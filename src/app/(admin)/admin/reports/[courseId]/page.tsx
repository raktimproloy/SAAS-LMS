import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users, PlayCircle, CheckCircle2, CalendarClock, BookOpen, Layers } from "lucide-react";
import { parse, isBefore, isAfter } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CourseReportsPage({ params }: { params: { courseId: string } }) {
  const courseId = parseInt(params.courseId);
  if (isNaN(courseId)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      batches: {
        include: {
          _count: {
            select: { students: true }
          }
        },
        orderBy: { created_at: "desc" }
      }
    }
  });

  if (!course) notFound();

  const now = new Date();

  const getBatchState = (startTimeStr: string, endTimeStr: string) => {
    try {
      // Parse times relative to today
      const start = parse(startTimeStr, "h:mm a", now);
      const end = parse(endTimeStr, "h:mm a", now);

      if (isAfter(now, end)) {
        return { state: "finished", label: "Finished", color: "text-slate-500 bg-slate-100 dark:bg-slate-800/50", icon: CheckCircle2 };
      } else if (isBefore(now, start)) {
        return { state: "upcoming", label: "Upcoming", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20", icon: CalendarClock };
      } else {
        return { state: "running", label: "Running", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]", icon: PlayCircle };
      }
    } catch {
      return { state: "unknown", label: "Scheduled", color: "text-slate-600 bg-slate-100", icon: Clock };
    }
  };

  const totalStudents = course.batches.reduce((acc, batch) => acc + batch._count.students, 0);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <Link href="/admin/reports" className="w-fit text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/30 bg-primary/10">ID: {course.id}</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{course.title}</h1>
            <p className="text-slate-300 text-lg">Select a batch to manage student attendance, exams, and behavioral reports.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Layers className="w-5 h-5 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Batches</span>
                <span className="text-lg font-bold text-white leading-none mt-0.5">{course.batches.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Users className="w-5 h-5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Students</span>
                <span className="text-lg font-bold text-white leading-none mt-0.5">{totalStudents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Batch Reports
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {course.batches.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 rounded-2xl border-dashed bg-slate-50/50 dark:bg-slate-900/20">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground font-medium">No batches found for this course.</p>
            </div>
          ) : (
            course.batches.map((batch) => {
              const { label, color, icon: Icon, state } = getBatchState(batch.start_time, batch.end_time);
              
              return (
                <Link key={batch.id} href={`/admin/reports/${course.id}/${batch.id}`} className="group block h-full">
                  <div className={`relative bg-white dark:bg-slate-900 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border ${state === 'running' ? 'border-emerald-200 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-800'} flex flex-col h-full overflow-hidden`}>
                    
                    {/* Decorative background based on state */}
                    {state === 'finished' && <div className="absolute inset-0 bg-slate-50/30 dark:bg-slate-950/30 pointer-events-none" />}
                    {state === 'running' && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 animate-pulse" />}
                    {state === 'upcoming' && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 opacity-50" />}
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <h3 className={`text-xl font-bold ${state === 'finished' ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'} group-hover:text-primary transition-colors pr-2`}>
                        {batch.name}
                      </h3>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </div>
                    </div>
                    
                    <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5 relative z-10">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="uppercase tracking-wider">Schedule</span>
                        </div>
                        <span className={`font-semibold text-sm ${state === 'finished' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {batch.start_time} - {batch.end_time}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span className="uppercase tracking-wider">Enrolled</span>
                        </div>
                        <span className={`font-bold text-lg ${state === 'finished' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {batch._count.students}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
