import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardProps {
  entries: {
    id: number;
    student_id?: number | null;
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

  const MedalIcon = ({ rank }: { rank: number }) => {
    const isTop3 = rank <= 3;
    const styles = {
      1: {
        ribbonLeft: "bg-red-600",
        ribbonRight: "bg-red-500",
        metal: "bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600",
        inner: "bg-gradient-to-br from-yellow-300 to-amber-500 border-yellow-100 text-amber-950",
        glow: "shadow-[0_0_20px_rgba(251,191,36,0.6)]",
      },
      2: {
        ribbonLeft: "bg-blue-600",
        ribbonRight: "bg-blue-500",
        metal: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500",
        inner: "bg-gradient-to-br from-slate-100 to-slate-400 border-white text-slate-900",
        glow: "shadow-[0_0_15px_rgba(59,130,246,0.8)]", // Blue glow
      },
      3: {
        ribbonLeft: "bg-emerald-700",
        ribbonRight: "bg-emerald-600",
        metal: "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-800",
        inner: "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-200 text-orange-950",
        glow: "shadow-[0_0_15px_rgba(234,88,12,0.5)]",
      },
      rest: {
        ribbonLeft: "bg-slate-600",
        ribbonRight: "bg-slate-500",
        metal: "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900",
        inner: "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-slate-300",
        glow: "shadow-[0_0_10px_rgba(0,0,0,0.3)]",
      }
    };

    const currentStyle = (isTop3 ? styles[rank as 1|2|3] : styles.rest);

    return (
      <div className={`relative flex flex-col items-center justify-center shrink-0 ${isTop3 ? 'w-12 h-16' : 'w-10 h-14 opacity-80'}`}>
        {/* Ribbon */}
        <div className={`absolute top-0 flex z-0 drop-shadow-sm ${isTop3 ? 'w-6 h-8' : 'w-5 h-6'}`}>
          <div className={`w-1/2 h-full ${currentStyle.ribbonLeft} skew-y-[30deg] origin-top-left rounded-tl-sm`} />
          <div className={`w-1/2 h-full ${currentStyle.ribbonRight} -skew-y-[30deg] origin-top-right rounded-tr-sm`} />
        </div>
        
        {/* The Medal */}
        <div className={`absolute bottom-0 rounded-full ${currentStyle.metal} ${currentStyle.glow} z-10 shadow-lg ${isTop3 ? 'w-11 h-11 p-[3px] transition-transform hover:scale-110' : 'w-9 h-9 p-[2px]'}`}>
          {/* Inner Etching */}
          <div className={`w-full h-full rounded-full border-[2px] ${currentStyle.inner} flex items-center justify-center shadow-inner`}>
            <span className={`font-black drop-shadow-sm ${isTop3 ? 'text-xl' : 'text-base'}`}>{rank}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card/60 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-lg shadow-primary/20 ring-1 ring-primary/50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />
      
      <div className="p-6 border-b border-white/10 flex items-center gap-4 relative z-10">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-[0_0_15px_rgba(251,191,36,0.3)] border border-amber-300/30">
          <Trophy className="w-6 h-6 text-amber-950" />
        </div>
        <div>
          <h3 className="font-bold text-2xl text-foreground tracking-tight">Top 10 Leaderboard</h3>
          <p className="text-sm text-muted-foreground font-medium">Ranking based on score and time.</p>
        </div>
      </div>
      
      <div className="divide-y divide-white/5 relative z-10">
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.student_id === currentStudentId && currentStudentId !== undefined;
          const name = entry.student?.name || entry.public_participant?.name || "Unknown";
          const photo = entry.student?.photo;
          const batchName = entry.student?.batch?.name || "Public";

          return (
            <div 
              key={entry.id} 
              className={`flex items-center gap-4 p-4 sm:px-6 transition-all duration-300 relative group ${
                isCurrentUser ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-white/5'
              }`}
            >
              {isCurrentUser && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)] rounded-r-full" />
              )}
              <div className="flex items-center justify-center shrink-0 w-16 h-16">
                <MedalIcon rank={rank} />
              </div>

              <Avatar className={`w-12 h-12 border-2 shadow-md ${isCurrentUser ? 'border-primary/50' : 'border-white/10'}`}>
                <AvatarImage src={photo || ""} />
                <AvatarFallback className="bg-background/50 font-bold">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base truncate flex items-center gap-2 ${isCurrentUser ? 'text-primary drop-shadow-md' : 'text-foreground'}`}>
                  {name} 
                  {isCurrentUser && <span className="text-[10px] uppercase tracking-wider font-black bg-primary text-white px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)]">You</span>}
                </p>
                <p className="text-sm text-muted-foreground truncate">{batchName}</p>
              </div>

              <div className="text-right shrink-0 bg-background/40 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="font-black text-xl text-foreground">
                  {entry.obtained_marks} <span className="text-xs font-semibold text-muted-foreground">pts</span>
                </div>
                <div className="text-xs font-medium text-muted-foreground">
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
