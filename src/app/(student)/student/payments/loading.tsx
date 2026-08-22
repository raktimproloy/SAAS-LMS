import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
      <div className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col justify-center items-start border border-border">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl transform-gpu" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl transform-gpu" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
            <Skeleton className="h-10 w-64 md:w-80 bg-muted rounded-xl" />
          </div>
          <Skeleton className="h-6 w-full max-w-lg bg-muted/50 rounded-md" />
        </div>
      </div>

      {/* Billing Records Card Skeleton */}
      <div className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border shadow-xl rounded-2xl">
        <div className="bg-background/20 border-b border-border/60 p-6 pb-4 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full bg-muted shrink-0" />
            <Skeleton className="h-6 w-40 bg-muted rounded-md" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col p-6 rounded-3xl border border-border/60 bg-background/40 shadow-lg gap-6 h-[220px]">
                <div className="flex items-start justify-between gap-4">
                  <Skeleton className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
                  <Skeleton className="w-10 h-10 rounded-xl bg-muted/50 shrink-0" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-7 w-3/4 bg-muted rounded-lg" />
                  <Skeleton className="h-4 w-1/2 bg-muted/50 rounded-md" />
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-border/60 mt-auto">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12 bg-muted/50 rounded-md" />
                    <Skeleton className="h-8 w-24 bg-muted rounded-lg" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
