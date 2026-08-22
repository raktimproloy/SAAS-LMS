import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <Skeleton className="h-8 w-56 sm:w-72 bg-muted rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-full bg-muted" />
      </div>
      <Skeleton className="h-[380px] w-full rounded-xl bg-muted/50" />
      <Skeleton className="h-[220px] w-full rounded-2xl bg-muted/50" />
      <Skeleton className="h-[180px] w-full rounded-2xl bg-muted/50" />
      <Skeleton className="h-[160px] w-full rounded-2xl bg-muted/50" />
    </div>
  );
}
