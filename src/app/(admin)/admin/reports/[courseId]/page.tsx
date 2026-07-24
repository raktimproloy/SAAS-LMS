import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users, PlayCircle, CheckCircle2, CalendarClock } from "lucide-react";
import { parse, isBefore, isAfter } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";

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
        return { state: "finished", label: "Finished", color: "text-slate-400 bg-slate-100 dark:bg-slate-800/50", icon: CheckCircle2 };
      } else if (isBefore(now, start)) {
        return { state: "upcoming", label: "Upcoming", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", icon: CalendarClock };
      } else {
        return { state: "running", label: "Running", color: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 shadow-[0_0_15px_rgba(34,197,94,0.4)]", icon: PlayCircle };
      }
    } catch {
      return { state: "unknown", label: "Scheduled", color: "text-slate-600 bg-slate-100", icon: Clock };
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/reports" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{course.title}</h1>
          <p className="text-muted-foreground mt-1">Select a batch to manage student reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.batches.length === 0 ? (
          <div className="col-span-full py-12 text-center border rounded-xl border-dashed bg-slate-50 dark:bg-slate-900/20">
            <p className="text-muted-foreground">No batches found for this course.</p>
          </div>
        ) : (
          course.batches.map((batch) => {
            const { label, color, icon: Icon, state } = getBatchState(batch.start_time, batch.end_time);
            
            return (
              <Link key={batch.id} href={`/admin/reports/${course.id}/${batch.id}`} className="group block">
                <div className={`relative bg-white dark:bg-slate-900 rounded-xl p-6 transition-all duration-300 hover:shadow-lg border ${state === 'running' ? 'border-green-200 dark:border-green-800' : 'border-border'} flex flex-col h-full overflow-hidden`}>
                  
                  {/* Decorative background based on state */}
                  {state === 'finished' && <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50 pointer-events-none" />}
                  {state === 'running' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600 animate-pulse" />}
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <h3 className={`text-xl font-bold ${state === 'finished' ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'} group-hover:text-primary transition-colors`}>
                      {batch.name}
                    </h3>
                    
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 relative z-10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Schedule</span>
                      </div>
                      <span className={`font-medium text-sm ${state === 'finished' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {batch.start_time} - {batch.end_time}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>Students</span>
                      </div>
                      <span className={`font-medium text-sm ${state === 'finished' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {batch._count.students} enrolled
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
  );
}
