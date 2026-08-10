import { Suspense } from "react";
import prisma from "@/lib/db";
import { HeroTeacherSection } from "@/components/public/home/HeroTeacherSection";
import { ActionButtonsSection } from "@/components/public/home/ActionButtonsSection";
import { PopularCoursesSection } from "@/components/public/home/PopularCoursesSection";
import { GallerySection } from "@/components/public/home/GallerySection";
import { NoticeBoardSection } from "@/components/public/home/NoticeBoardSection";
import { VideoCourseSection } from "@/components/public/home/VideoCourseSection";
import { ContactSection } from "@/components/public/home/ContactSection";
import { MapSection } from "@/components/public/home/MapSection";
import { FloatingBackground } from "@/components/public/ui/FloatingBackground";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 3600; // Revalidate every hour

async function fetchHomeData() {
  const [teacher, notices, courses, videoCourses] = await Promise.all([
    prisma.teacher.findFirst({
      orderBy: { created_at: 'asc' }
    }),
    prisma.notice.findMany({
      take: 3,
      orderBy: { created_at: 'desc' }
    }),
    prisma.course.findMany({
      take: 6,
      orderBy: { created_at: 'desc' },
      where: { status: 'PUBLISHED' }
    }),
    prisma.videoCourse.findMany({
      take: 4,
      orderBy: { created_at: 'desc' },
      where: { status: 'PUBLISHED' }
    })
  ]);

  return { teacher, notices, courses, videoCourses };
}

export default async function HomePage() {
  const data = await fetchHomeData();

  return (
    <div className="relative bg-background min-h-screen selection:bg-primary/20 selection:text-primary">
      <FloatingBackground />
      
      <div className="relative z-10">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroTeacherSection teacher={data.teacher} />
        </Suspense>
        
        <ActionButtonsSection />
        
        <Suspense fallback={<SectionSkeleton />}>
          <PopularCoursesSection courses={data.courses} />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <GallerySection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <VideoCourseSection videoCourses={data.videoCourses} />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <NoticeBoardSection notices={data.notices} />
        </Suspense>
        
        <ContactSection />
        <MapSection />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="w-full min-h-[80vh] flex items-center pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <Skeleton className="h-16 w-3/4 bg-primary/10" />
          <Skeleton className="h-8 w-1/2 bg-primary/10" />
          <Skeleton className="h-32 w-full bg-primary/10" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 bg-primary/10" />
            <Skeleton className="h-12 w-32 bg-primary/10" />
          </div>
        </div>
        <div className="hidden lg:block">
          <Skeleton className="w-full aspect-[4/5] rounded-3xl bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 bg-primary/10" />
          <Skeleton className="h-6 w-96 bg-primary/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl bg-primary/10" />
          ))}
        </div>
      </div>
    </section>
  );
}
