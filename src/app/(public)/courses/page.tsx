import prisma from "@/lib/db";
import { VideoCourseSection } from "@/components/public/home/VideoCourseSection";
import { ContactSection } from "@/components/public/home/ContactSection";
import { AOSInit } from "../about/AOSInit";
import { PopularCoursesSection } from "@/components/public/home/PopularCoursesSection";

// Server Component
export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: { in: ["PUBLISHED", "active"] } },
    orderBy: { sort_order: "asc" },
    select: {
      id: true,
      title: true,
      fee: true,
      discount_fee: true,
      batches: {
        where: { status: { in: ["active", "PUBLISHED"] } },
        orderBy: { sort_order: "asc" },
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
  });

  const settings = await prisma.siteSetting.findMany({
    where: { setting_key: { in: ["courses_hero_title", "courses_hero_description"] } }
  });

  const config = settings.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value;
    return acc;
  }, {} as Record<string, string>);

  const heroTitle = config.courses_hero_title || "ক্যারিয়ার গড়ার সঠিক গাইডলাইন";
  const heroDesc = config.courses_hero_description || "আপনার লক্ষ্য অনুযায়ী আমাদের প্রফেশনাল ও গোছানো কোর্সগুলো বেছে নিন এবং আপনার স্বপ্নের প্রস্তুতিতে এক ধাপ এগিয়ে থাকুন।";

  return (
    <div>
      <AOSInit />

      {/* Course Page Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div data-aos="fade-down">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-tight whitespace-pre-wrap">
              {heroTitle}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed whitespace-pre-wrap">
              {heroDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section — same as home */}
      <PopularCoursesSection courses={courses} showAll={true} />

      {/* Video Course Section */}
      <VideoCourseSection />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
