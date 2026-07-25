import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 md:w-80 rounded-xl" />
          <Skeleton className="h-6 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>

      {/* Enrolled Courses Skeleton */}
      <div className="flex gap-4 overflow-hidden">
        <Skeleton className="h-20 w-[280px] rounded-2xl" />
        <Skeleton className="h-20 w-[280px] rounded-2xl hidden md:block" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8 flex flex-col">
          <Skeleton className="h-[250px] w-full rounded-3xl" />
          <Skeleton className="h-[250px] w-full rounded-3xl" />
        </div>

        {/* Right Column */}
        <div className="space-y-8 flex flex-col">
          <Skeleton className="h-[530px] w-full rounded-3xl" />
        </div>
      </div>

      {/* Notices Skeleton */}
      <Skeleton className="h-[250px] w-full rounded-3xl" />
    </div>
  );
}
