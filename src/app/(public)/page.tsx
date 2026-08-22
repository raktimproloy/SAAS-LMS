import { Suspense } from "react";
import prisma from "@/lib/db";
import { HeroTeacherSection } from "@/components/public/home/HeroTeacherSection";
import { PopularCoursesSection } from "@/components/public/home/PopularCoursesSection";
import { GallerySection } from "@/components/public/home/GallerySection";
import { DemoClassSection } from "@/components/public/home/DemoClassSection";
import { NoticeBoardSection } from "@/components/public/home/NoticeBoardSection";
import { VideoCourseSection } from "@/components/public/home/VideoCourseSection";
import { ContactSection } from "@/components/public/home/ContactSection";
import { MapSection } from "@/components/public/home/MapSection";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60; // Revalidate every minute

async function fetchHomeData() {
  const [teacher, notices, courses, videoCourses, gallery, demoVideos, demoSectionTitle] = await Promise.all([
    prisma.teacher.findFirst({
      orderBy: { created_at: 'asc' }
    }),
    prisma.notice.findMany({
      take: 3,
      orderBy: { created_at: 'desc' }
    }),
    prisma.course.findMany({
      take: 8,
      orderBy: { created_at: 'desc' },
      where: { status: { in: ['PUBLISHED', 'active'] } },
      select: {
        id: true,
        title: true,
        fee: true,
        discount_fee: true,
        batches: {
          where: { status: { in: ['active', 'PUBLISHED'] } },
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            name: true,
            start_time: true,
            end_time: true,
            status: true,
            max_students: true,
            class_days: true,
          },
        },
      },
    }),
    prisma.videoCourse.findMany({
      take: 4,
      orderBy: { created_at: 'desc' },
      where: { is_public: true, status: 'active' }
    }),
    prisma.gallery.findMany({
      orderBy: { sort_order: 'asc' }
    }),
    prisma.demoVideo.findMany({
      where: { is_active: true },
      orderBy: [
        { sort_order: 'asc' },
        { created_at: 'desc' }
      ]
    }),
    prisma.siteSetting.findUnique({
      where: { setting_key: 'demo_class_section_title' }
    })
  ]);

  return { teacher, notices, courses, videoCourses, gallery, demoVideos, demoSectionTitle: demoSectionTitle?.setting_value };
}

export default async function HomePage() {
  const data = await fetchHomeData();

  return (
    <div className="relative min-h-screen selection:bg-primary/20 selection:text-primary">
      <div className="relative z-10">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroTeacherSection teacher={data.teacher} />
        </Suspense>

        <Suspense fallback={<PopularCoursesSkeleton />}>
          <PopularCoursesSection courses={data.courses} />
        </Suspense>

        <Suspense fallback={<GallerySkeleton />}>
          <GallerySection initialImages={data.gallery} />
        </Suspense>

        <Suspense fallback={<DemoClassSkeleton />}>
          <DemoClassSection videos={data.demoVideos} sectionTitle={data.demoSectionTitle} />
        </Suspense>

        <Suspense fallback={<VideoCourseSkeleton />}>
          <VideoCourseSection videoCourses={data.videoCourses} />
        </Suspense>

        <Suspense fallback={<NoticeBoardSkeleton />}>
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
    <section className="relative min-h-[60vh] flex items-center pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 flex justify-center">
            <Skeleton className="w-full max-w-sm aspect-[4/5] rounded-3xl bg-primary/10" />
          </div>
          <div className="order-1 lg:order-2 space-y-5 flex flex-col items-center lg:items-start">
            <Skeleton className="h-12 sm:h-14 w-3/4 bg-primary/10" />
            <Skeleton className="h-6 sm:h-8 w-1/2 bg-primary/10" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-full bg-primary/10" />
              <Skeleton className="h-4 w-[90%] bg-primary/10" />
              <Skeleton className="h-4 w-[95%] bg-primary/10" />
              <Skeleton className="h-4 w-[80%] bg-primary/10" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Skeleton className="h-14 w-full sm:w-40 rounded-lg bg-primary/10" />
              <Skeleton className="h-14 w-full sm:w-40 rounded-lg bg-primary/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PopularCoursesSkeleton() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <Skeleton className="h-8 sm:h-10 w-48 bg-primary/10" />
          <Skeleton className="h-5 w-24 bg-primary/10" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[76px] sm:h-[56px] w-full rounded-xl bg-primary/10" />
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySkeleton() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4 bg-primary/10" />
          <Skeleton className="h-5 w-96 mx-auto bg-primary/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={`w-full rounded-2xl bg-primary/10 ${i % 2 === 0 ? 'h-64' : 'h-80'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoClassSkeleton() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <Skeleton className="h-10 w-64 mx-auto bg-primary/10" />
        </div>
        <div className="px-4 sm:px-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="w-full aspect-video rounded-3xl bg-primary/10" />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoCourseSkeleton() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4 bg-primary/10" />
          <Skeleton className="h-5 w-96 mx-auto bg-primary/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-video rounded-2xl bg-primary/10" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4 bg-primary/10" />
                <Skeleton className="h-4 w-1/2 bg-primary/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NoticeBoardSkeleton() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Skeleton className="h-10 w-48 bg-primary/10" />
          <Skeleton className="h-10 w-32 rounded-full bg-primary/10" />
        </div>
        <div className="grid gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-primary/10" />
          ))}
        </div>
      </div>
    </section>
  );
}
