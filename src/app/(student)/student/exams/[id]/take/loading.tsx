import { Skeleton } from "@/components/ui/skeleton";

export default function ExamTakeLoading() {
  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top Header Skeleton */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border shadow-sm dark:shadow-none">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64 md:w-96 bg-muted rounded-md" />
            <Skeleton className="h-4 w-72 bg-muted/50 rounded-md" />
          </div>
        </div>
      </div>

      {/* Questions Feed Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
            <div className="p-5 flex gap-4 bg-muted/30">
              <Skeleton className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-20 bg-muted/50 rounded-md" />
                  <Skeleton className="h-4 w-16 bg-muted rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 bg-muted rounded-md" />
                <Skeleton className="h-5 w-1/2 bg-muted rounded-md" />
              </div>
            </div>
            <div className="p-5 border-t border-border bg-card/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((opt) => (
                  <div key={opt} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                    <Skeleton className="w-6 h-6 rounded-md bg-muted shrink-0" />
                    <Skeleton className="h-4 w-32 bg-muted/50 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Bar Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border shadow-sm p-3 sm:p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-6">
            <Skeleton className="h-10 sm:h-12 w-24 sm:w-32 bg-muted rounded-lg" />
            <div className="hidden sm:flex flex-col gap-1">
              <Skeleton className="h-4 w-32 bg-muted rounded-md" />
              <Skeleton className="h-3 w-24 bg-muted/50 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Skeleton className="h-8 w-12 bg-muted rounded-lg sm:hidden" />
            <Skeleton className="h-10 sm:h-11 w-28 sm:w-36 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
