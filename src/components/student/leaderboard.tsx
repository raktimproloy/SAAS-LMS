import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardProps {
  entries: {
    id: number;
    student?: { name: string; photo?: string | null; batch?: { name: string } };
    public_participant?: { name: string };
    obtained_marks: number;
    total_marks: number;
    time_taken_seconds: number | null;
  }[];
  currentStudentId?: number; // to highlight the current user
}

export function Leaderboard({ entries, currentStudentId }: LeaderboardProps) {
  if (!entries || entries.length === 0) {
    return <div className="p-8 text-center text-slate-500 border rounded-xl bg-slate-50">No results published yet.</div>;
  }

  const formatTime = (sec: number | null) => {
    if (!sec) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-800 dark:text-white">Top 10 Leaderboard</h3>
      </div>
      
      <div className="divide-y">
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.id === currentStudentId;
          const name = entry.student?.name || entry.public_participant?.name || "Unknown";
          const photo = entry.student?.photo;
          const batchName = entry.student?.batch?.name || "Public";

          return (
            <div 
              key={entry.id} 
              className={`flex items-center gap-4 p-4 transition-colors ${
                isCurrentUser ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 font-bold text-slate-500">
                {rank === 1 ? <Medal className="w-8 h-8 text-amber-400" /> : 
                 rank === 2 ? <Medal className="w-7 h-7 text-slate-400" /> : 
                 rank === 3 ? <Medal className="w-6 h-6 text-orange-400" /> : 
                 `#${rank}`}
              </div>

              <Avatar className="w-10 h-10 border shadow-sm">
                <AvatarImage src={photo || ""} />
                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {name} {isCurrentUser && <span className="text-xs ml-2 bg-primary text-white px-2 py-0.5 rounded-full">You</span>}
                </p>
                <p className="text-xs text-slate-500 truncate">{batchName}</p>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg text-slate-900 dark:text-white">
                  {entry.obtained_marks}
                </div>
                <div className="text-xs text-slate-500">
                  {formatTime(entry.time_taken_seconds)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
