import { Skeleton } from "@/components/ui/skeleton";

export default function NotesLoading() {
  return (
    <div className="flex flex-col gap-8 pb-10 w-full max-w-[1920px] mx-auto">
      <div className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-border mb-2 w-full">
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl transform-gpu pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none transform-gpu" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
            <Skeleton className="h-10 w-64 md:w-80 bg-muted rounded-xl" />
          </div>
          <Skeleton className="h-6 w-full max-w-lg bg-muted/50 rounded-md" />
        </div>
      </div>

      {/* Notes Grid Skeleton */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="relative bg-card border-border rounded-xl overflow-hidden border shadow-sm p-6 flex flex-col h-[240px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <Skeleton className="w-12 h-12 rounded-2xl bg-muted mb-5 shrink-0" />
                <Skeleton className="h-6 w-3/4 bg-muted rounded-md mb-2" />
                <div className="flex items-center gap-2 mb-6 mt-auto">
                  <Skeleton className="h-5 w-16 bg-muted/50 rounded-full" />
                  <Skeleton className="h-4 w-24 bg-muted/50 rounded-md" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 flex-1 bg-muted rounded-md" />
                  <Skeleton className="h-10 w-12 bg-muted rounded-md shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
