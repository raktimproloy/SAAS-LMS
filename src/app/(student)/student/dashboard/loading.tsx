import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 w-full lg:h-[calc(100vh-150px)] lg:overflow-hidden">
      {/* Welcome Section Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 md:w-80 bg-muted rounded-lg" />
          <Skeleton className="h-5 w-48 bg-muted/50 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-muted" />
      </div>

      {/* Main Content Grid Skeletons */}
      <div className="flex flex-col gap-4 lg:flex-1">
        {/* Top Row: Course & Next Exam */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-2xl p-4 md:p-5 shadow-xl h-[140px] flex flex-col">
            <Skeleton className="h-6 w-40 mb-3 bg-muted rounded-md shrink-0" />
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-border/60">
              <Skeleton className="w-12 h-12 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-muted rounded-md" />
                <Skeleton className="h-4 w-1/2 bg-muted/50 rounded-md" />
              </div>
            </div>
          </div>
          <div className="bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-2xl p-4 md:p-5 shadow-xl h-[200px] lg:h-[140px] flex flex-col">
            <Skeleton className="h-5 w-24 mb-1 bg-muted/50 rounded-md shrink-0" />
            <Skeleton className="h-7 w-64 mb-3 bg-muted rounded-md shrink-0" />
            <div className="flex-1 flex flex-col justify-end gap-3">
              <Skeleton className="h-14 w-full bg-muted/50 rounded-xl shrink-0" />
              <Skeleton className="h-9 w-full bg-muted rounded-xl shrink-0" />
            </div>
          </div>
        </div>

        {/* Bottom Row: Performance + Notices & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:flex-1 lg:min-h-0">
          {/* Left Side */}
          <div className="flex flex-col gap-4 lg:flex-1 lg:min-h-0 order-2 lg:order-1">
            <div className="bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-2xl p-4 md:p-5 shadow-xl lg:flex-1 lg:min-h-0 min-h-[200px] flex flex-col">
              <Skeleton className="h-6 w-48 mb-4 bg-muted rounded-md shrink-0" />
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 justify-center min-h-0 py-2">
                <Skeleton className="w-20 h-20 rounded-full bg-muted shrink-0" />
                <div className="flex-1 w-full space-y-3 max-w-[200px] sm:max-w-none">
                  <Skeleton className="h-14 w-full bg-muted/50 rounded-xl" />
                  <Skeleton className="h-9 w-full bg-muted rounded-xl" />
                </div>
              </div>
            </div>
            <div className="bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-2xl p-4 md:p-5 shadow-xl lg:flex-1 lg:min-h-0 min-h-[250px] flex flex-col">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <Skeleton className="h-6 w-40 bg-muted rounded-md" />
                <Skeleton className="h-7 w-20 bg-muted rounded-xl" />
              </div>
              <div className="flex-1 space-y-2 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full bg-muted/50 rounded-xl shrink-0" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-2xl p-4 md:p-5 shadow-xl lg:flex-1 lg:min-h-0 min-h-[400px] flex flex-col order-1 lg:order-2">
            <Skeleton className="h-6 w-56 mb-4 bg-muted rounded-md shrink-0" />
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex justify-between items-center px-2 shrink-0">
                <Skeleton className="h-8 w-8 rounded-md bg-muted" />
                <Skeleton className="h-6 w-32 rounded-md bg-muted/50" />
                <Skeleton className="h-8 w-8 rounded-md bg-muted" />
              </div>
              <div className="grid grid-cols-7 gap-2 flex-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-full bg-muted/50 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
