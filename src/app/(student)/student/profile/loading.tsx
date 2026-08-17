import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
      {/* Banner Skeleton */}
      <div className="relative overflow-hidden bg-card/80 dark:bg-card/20 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 border border-border/60 h-[300px] md:h-[260px] w-full">
        <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-muted shrink-0" />
        <div className="flex flex-col items-center md:items-start space-y-4 w-full mt-4 md:mt-0">
          <Skeleton className="h-6 w-32 bg-muted rounded-full" />
          <Skeleton className="h-10 w-64 md:w-96 bg-muted rounded-2xl" />
          <Skeleton className="h-6 w-48 bg-muted/50 rounded-xl" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-8 w-32 bg-muted/50 rounded-xl" />
            <Skeleton className="h-8 w-40 bg-muted/50 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Info Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-[2rem] p-8 h-[350px]">
          <Skeleton className="h-8 w-48 mb-8 bg-muted rounded-xl" />
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-24 bg-muted/50 rounded-md" />
                  <Skeleton className="h-5 w-48 bg-muted rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card/80 dark:bg-card/20 backdrop-blur-3xl border border-border/60 rounded-[2rem] p-8 h-[350px]">
          <Skeleton className="h-8 w-48 mb-8 bg-muted rounded-xl" />
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-24 bg-muted/50 rounded-md" />
                  <Skeleton className="h-5 w-48 bg-muted rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
