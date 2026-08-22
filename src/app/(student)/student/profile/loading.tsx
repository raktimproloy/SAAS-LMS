import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
      {/* Banner Skeleton */}
      <div className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 border border-border">
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none transform-gpu" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none transform-gpu" />
        </div>
        <Skeleton className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-muted shrink-0" />
        <div className="relative z-10 flex flex-col items-center md:items-start space-y-4 w-full mt-4 md:mt-0">
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
        <div className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="relative z-10">
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
        <div className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="relative z-10">
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
    </div>
  );
}
