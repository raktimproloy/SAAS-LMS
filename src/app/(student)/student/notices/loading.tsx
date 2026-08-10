import { Skeleton } from "@/components/ui/skeleton";

export default function NoticesLoading() {
  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-20">
      {/* Header Banner Skeleton */}
      <div className="relative bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-6 border border-white/10 mb-2 h-[220px]">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl bg-white/10 shrink-0" />
            <Skeleton className="h-10 w-48 bg-white/10 rounded-xl" />
          </div>
          <Skeleton className="h-6 w-full max-w-lg bg-white/5 rounded-md" />
        </div>
        <Skeleton className="w-32 h-12 rounded-2xl bg-white/10 shrink-0" />
      </div>

      {/* Notices Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col h-[280px] bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
            <div className="bg-primary/5 p-5 flex items-center gap-4 border-b border-white/10">
              <Skeleton className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
              <Skeleton className="h-4 w-32 bg-white/5 rounded-md" />
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              <Skeleton className="h-6 w-3/4 bg-white/10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/5 rounded-md" />
                <Skeleton className="h-4 w-5/6 bg-white/5 rounded-md" />
                <Skeleton className="h-4 w-4/6 bg-white/5 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
