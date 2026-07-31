import { Skeleton } from "@/components/ui/skeleton";

export default function ExamLeaderboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-20 w-full">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-white/10 rounded-md" />
          <Skeleton className="h-4 w-64 bg-white/5 rounded-md" />
        </div>
      </div>

      <div className="bg-card/60 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-lg overflow-hidden relative">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-3 sm:gap-4">
          <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 bg-white/10 rounded-md" />
            <Skeleton className="h-4 w-32 sm:w-48 bg-white/5 rounded-md" />
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 sm:px-6">
              <Skeleton className="w-10 h-14 sm:w-12 sm:h-16 rounded-md bg-white/10 shrink-0" />
              <Skeleton className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32 sm:w-48 bg-white/10 rounded-md" />
                <Skeleton className="h-4 w-24 sm:w-32 bg-white/5 rounded-md" />
              </div>
              <div className="w-[72px] sm:w-[96px] h-12 sm:h-14 bg-white/5 rounded-xl border border-white/5 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
