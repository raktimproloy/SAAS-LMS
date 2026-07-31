import { Skeleton } from "@/components/ui/skeleton";

export default function ExamsLoading() {
  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-10">
      <div className="flex flex-col gap-2 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">My Exams</h1>
        <p className="text-muted-foreground text-lg">View and take your assigned exams below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col relative rounded-3xl overflow-hidden bg-card/60 backdrop-blur-3xl border border-white/10 shadow-lg">
            <div className="p-6 pb-4 border-b border-white/10">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
              </div>
              <Skeleton className="h-7 w-3/4 mb-1 bg-white/10 rounded-lg" />
            </div>

            <div className="p-6 flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded bg-white/10 shrink-0" />
                  <Skeleton className="h-4 w-24 bg-white/5 rounded-md" />
                </div>
                <div className="flex items-center justify-end gap-2 text-right">
                  <Skeleton className="h-4 w-20 bg-white/5 rounded-md" />
                  <Skeleton className="w-4 h-4 rounded bg-white/10 shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded bg-white/10 shrink-0" />
                  <Skeleton className="h-4 w-16 bg-white/5 rounded-md" />
                </div>
                <div className="flex items-center justify-end gap-2 text-right">
                  <Skeleton className="h-6 w-28 bg-white/10 rounded-lg ml-auto" />
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 mt-auto flex flex-col gap-3">
              <Skeleton className="w-full h-14 rounded-2xl bg-white/10" />
              <Skeleton className="w-full h-12 rounded-2xl bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
