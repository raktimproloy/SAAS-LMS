import { Skeleton } from "@/components/ui/skeleton";

export default function ExamResultLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header Summary Skeleton */}
      <div className="bg-card/80 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 w-full md:w-auto">
          <Skeleton className="h-9 w-64 md:w-96 bg-white/10 rounded-lg" />
          <Skeleton className="h-5 w-48 bg-white/5 rounded-md" />
        </div>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center w-full md:w-auto">
          <Skeleton className="h-12 w-full sm:w-48 bg-white/10 rounded-2xl shrink-0" />
          <div className="hidden sm:block w-px h-12 bg-border shrink-0" />
          <div className="flex gap-6 sm:gap-8 items-center justify-center w-full sm:w-auto">
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-4 w-12 bg-white/5 rounded-md" />
              <Skeleton className="h-10 w-24 bg-white/10 rounded-lg" />
            </div>
            <div className="w-px h-12 bg-border shrink-0" />
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-4 w-12 bg-white/5 rounded-md" />
              <Skeleton className="h-10 w-20 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 border border-border shadow-sm rounded-xl p-6 flex flex-col items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                <Skeleton className="h-8 w-16 bg-white/10 rounded-md" />
                <Skeleton className="h-4 w-20 bg-white/5 rounded-md" />
              </div>
            ))}
          </div>

          {/* Questions Feed Skeleton */}
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
                <div className="p-5 flex gap-4 bg-muted/30">
                  <Skeleton className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-20 bg-white/5 rounded-md" />
                      <Skeleton className="h-4 w-16 bg-white/10 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-3/4 bg-white/10 rounded-md" />
                    <Skeleton className="h-5 w-1/2 bg-white/10 rounded-md" />
                  </div>
                </div>
                
                <div className="p-5 border-t border-border bg-card/50 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((opt) => (
                      <div key={opt} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                        <Skeleton className="w-6 h-6 rounded-md bg-white/10 shrink-0" />
                        <Skeleton className="h-4 w-32 bg-white/5 rounded-md" />
                      </div>
                    ))}
                  </div>
                  
                  <Skeleton className="w-full h-14 rounded-xl bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
