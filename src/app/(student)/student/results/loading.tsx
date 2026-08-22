import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, LayoutGrid, List } from "lucide-react";

export default function ResultsLoading() {
  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-border">
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform-gpu pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />
          <div className="absolute bottom-0 right-10 opacity-[0.03]">
            <Trophy className="w-40 h-40" />
          </div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4 text-foreground">
              <div className="p-3 bg-background/50 backdrop-blur-md rounded-2xl border border-border shadow-sm">
                <Trophy className="h-8 w-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              My Results
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mt-4 font-medium">
              Track your academic excellence and view detailed insights of your past performances.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-1.5 rounded-2xl border border-border shadow-sm overflow-x-auto w-full sm:w-auto">
          {['all', 'online', 'offline'].map((f) => (
            <button key={f} className={`px-5 py-2 rounded-xl transition-all font-bold capitalize whitespace-nowrap flex-1 sm:flex-none ${f === 'all' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-1.5 rounded-2xl border border-border shadow-sm shrink-0">
          <button className="p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold bg-primary text-primary-foreground shadow-lg">
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button className="p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60">
            <List className="w-5 h-5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Grid Layout Skeleton (Default fallback for SSR loading) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="relative bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border rounded-3xl p-6 md:p-8 flex flex-col shadow-xl overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-muted rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex justify-between items-start gap-4 border-b border-border/60 mb-4 pb-4">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-6 w-24 mb-3 bg-muted rounded-full" />
                <Skeleton className="h-7 w-3/4 bg-muted rounded-md" />
                <Skeleton className="h-4 w-1/2 mt-2 bg-muted/50 rounded-md" />
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex flex-col items-end bg-background/40 px-3 py-2 rounded-xl border border-border/60">
                  <Skeleton className="h-2 w-10 mb-1 bg-muted rounded-full" />
                  <Skeleton className="h-4 w-16 bg-muted/50 rounded-md" />
                </div>
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between mb-8 mt-2">
              <div className="flex flex-col">
                <Skeleton className="h-3 w-12 mb-2 bg-muted/50 rounded-md" />
                <Skeleton className="h-10 w-24 bg-muted rounded-xl" />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center mr-2">
                  <Skeleton className="h-3 w-10 mb-2 bg-muted/50 rounded-md" />
                  <Skeleton className="h-10 w-8 bg-muted rounded-xl" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-3 w-12 mb-2 bg-muted/50 rounded-md" />
                  <Skeleton className="h-10 w-16 bg-muted rounded-2xl" />
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-auto pt-4 border-t border-border/60">
              <Skeleton className="w-full h-12 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
