import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ShieldCheck, CheckCircle2, Calendar, Clock, ChevronRight, FileText } from "lucide-react";
import { Metadata } from "next";
import { StartExamButton } from "./StartExamButton";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = parseInt(params.id);
  if (isNaN(id)) return { title: "Not Found" };

  const exam = await prisma.exam.findUnique({
    where: { id }
  });

  if (!exam || !exam.is_public || exam.status !== 'active') {
    return { title: "Not Found" };
  }

  return {
    title: `${exam.title} - ফ্রি মক টেস্ট`,
    description: "আমাদের ফ্রি মক টেস্ট দিয়ে নিজেকে যাচাই করুন।",
  };
}

export default async function PublicExamLandingPage({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      course: { select: { title: true } },
      batch: { select: { name: true, course: { select: { title: true } } } }
    }
  });

  if (!exam || !exam.is_public || exam.status !== 'active') {
    notFound();
  }

  // Fetch the main teacher (admin)
  const teacher = await prisma.teacher.findFirst({
    orderBy: { created_at: 'asc' }
  });

  // Fetch active courses to show what classes are taken
  const courses = await prisma.course.findMany({
    where: { status: { in: ['PUBLISHED', 'active'] } },
    take: 3,
    orderBy: { sort_order: 'asc' },
    select: { id: true, title: true, fee: true, discount_fee: true }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-primary">ফ্রি মক টেস্ট</span>
                <p className="text-xs text-muted-foreground">অ্যাডমিন কর্তৃক আয়োজিত</p>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              {exam.title}
            </h1>

            {exam.description && (
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-6 leading-relaxed whitespace-pre-wrap">
                {exam.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
              {(exam.course || exam.batch?.course) && (
                <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                  কোর্স: {exam.course?.title || exam.batch?.course?.title}
                </span>
              )}
              
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>সময়: {exam.duration_minutes} মিনিট</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                <FileText className="w-3.5 h-3.5" />
                <span>মার্কস: {exam.total_marks}</span>
              </div>

              {(exam.start_time || exam.end_time) && (
                <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/30 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800 w-full mt-2">
                  {exam.start_time && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-primary/70" />
                      <span><span className="font-semibold text-slate-800 dark:text-slate-200">শুরু:</span> {new Date(exam.start_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  )}
                  {exam.start_time && exam.end_time && (
                    <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700" />
                  )}
                  {exam.end_time && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-rose-500/70" />
                      <span><span className="font-semibold text-slate-800 dark:text-slate-200">শেষ:</span> {new Date(exam.end_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <StartExamButton 
              examId={exam.id} 
              startTimeStr={exam.start_time?.toISOString() || null} 
              endTimeStr={exam.end_time?.toISOString() || null} 
            />
          </div>
        </div>

        {/* Teacher / Instructor Info */}
        {teacher && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              শিক্ষক পরিচিতি
            </h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {teacher.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={teacher.photo} 
                  alt={teacher.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-slate-50 dark:border-slate-800 shadow-md">
                  {teacher.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{teacher.name}</h4>
                {teacher.qualifications && (
                  <p className="text-sm font-medium text-primary mb-3">{teacher.qualifications}</p>
                )}
                {teacher.bio && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap max-w-2xl">
                    {teacher.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Courses */}
        {courses.length > 0 && (
          <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-md relative overflow-hidden border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  আমাদের অন্যান্য কোর্সসমূহ
                </h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                  প্রিমিয়াম কোর্সে ভর্তি হয়ে সকল লেকচার, এক্সক্লুসিভ নোট, লাইভ ক্লাস এবং সার্বক্ষণিক মেন্টরিং-এর সুবিধা গ্রহণ করুন।
                </p>
                
                <div className="space-y-3">
                  {courses.map(c => (
                    <div key={c.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                      <span className="font-semibold">{c.title}</span>
                      <span className="text-primary font-bold">
                        {c.discount_fee ? (
                          <>৳{c.discount_fee} <span className="text-xs line-through text-slate-500 ml-1">৳{c.fee}</span></>
                        ) : (
                          <>৳{c.fee}</>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
              
              <div className="w-full md:w-auto bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">প্রস্তুতি শুরু করতে চান?</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-[200px] mx-auto">আজই সফল শিক্ষার্থীদের সাথে যুক্ত হোন।</p>
                <Link href="/courses">
                  <Button size="lg" className="w-full rounded-xl font-bold hover:scale-105 transition-transform bg-primary hover:bg-primary/90">
                    সব কোর্স দেখুন
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
