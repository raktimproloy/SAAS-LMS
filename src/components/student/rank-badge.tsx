import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  if (rank > 10 || rank < 1) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-bold shadow-sm animate-in fade-in zoom-in duration-500",
        rank === 1
          ? "bg-amber-100 text-amber-700 border border-amber-200"
          : rank === 2
          ? "bg-slate-200 text-slate-700 border border-slate-300"
          : rank === 3
          ? "bg-orange-100 text-orange-800 border border-orange-200"
          : "bg-blue-100 text-blue-700 border border-blue-200",
        className
      )}
    >
      <Trophy className="h-4 w-4" />
      <span>Top 10 Ranker (#{rank})</span>
    </div>
  );
}
