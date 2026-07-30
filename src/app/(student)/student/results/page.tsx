"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Trophy, ArrowRight, BookOpen, Star, LayoutGrid, List, ChevronUp } from "lucide-react";

interface ExamResult {
  id: number;
  obtained_marks: number;
  total_marks: number;
  grade: string | null;
  rank: number | null;
  created_at: string;
  exam: {
    id: number;
    title: string;
    type: string;
    start_time: string | null;
    course?: {
      title: string;
    };
    batch?: {
      name: string;
    };
  };
}

const RankMedal = ({ rank }: { rank: number | null }) => {
  const isTop3 = rank != null && rank > 0 && rank <= 3;
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
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.8)]",
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
    <div className={`relative flex flex-col items-center justify-center shrink-0 w-8 h-12 sm:w-10 sm:h-14 ${rank == null || rank === 0 ? 'opacity-50 grayscale' : ''}`}>
      {/* Ribbon */}
      <div className={`absolute top-0 flex z-0 drop-shadow-sm w-4 h-5 sm:w-5 sm:h-6`}>
        <div className={`w-1/2 h-full ${currentStyle.ribbonLeft} skew-y-[30deg] origin-top-left rounded-tl-sm`} />
        <div className={`w-1/2 h-full ${currentStyle.ribbonRight} -skew-y-[30deg] origin-top-right rounded-tr-sm`} />
      </div>
      
      {/* The Medal */}
      <div className={`absolute bottom-0 rounded-full ${currentStyle.metal} ${rank == null || rank === 0 ? '' : currentStyle.glow} z-10 shadow-lg w-7 h-7 sm:w-9 sm:h-9 p-[2px]`}>
        <div className={`w-full h-full rounded-full border-[2px] ${currentStyle.inner} flex items-center justify-center shadow-inner`}>
          <span className={`font-black drop-shadow-sm text-sm sm:text-base`}>{rank != null && rank > 0 ? rank : '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default function StudentResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    const savedLayout = localStorage.getItem('student_results_layout');
    if (savedLayout === 'list' || savedLayout === 'grid') {
      setLayout(savedLayout);
    }
  }, []);

  const calculateGrade = (marks: number, total: number) => {
    const p = (marks / total) * 100;
    if (p >= 80) return "A+";
    if (p >= 70) return "A";
    if (p >= 60) return "A-";
    if (p >= 50) return "B";
    if (p >= 40) return "C";
    if (p >= 33) return "D";
    return "F";
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "from-emerald-400 to-emerald-600 shadow-emerald-500/30 text-white";
    if (grade.includes("B")) return "from-blue-400 to-blue-600 shadow-blue-500/30 text-white";
    if (grade.includes("C") || grade.includes("D")) return "from-amber-400 to-amber-600 shadow-amber-500/30 text-white";
    return "from-destructive to-red-600 shadow-destructive/30 text-white";
  };

  useEffect(() => {
    fetch('/api/student/results')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          console.error("API returned an error or non-array:", data);
          setResults([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch results:", err);
        setResults([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden bg-card/20 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-white/5 h-[200px] w-full">
          <Skeleton className="h-12 w-64 mb-4 bg-white/10 rounded-2xl" />
          <Skeleton className="h-6 w-96 max-w-full bg-white/5 rounded-xl" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col h-[280px]">
              <Skeleton className="h-6 w-28 mb-3 bg-white/10 rounded-full" />
              <Skeleton className="h-7 w-3/4 mb-4 bg-white/10 rounded-xl" />
              <Skeleton className="h-4 w-1/2 mb-8 bg-white/5 rounded-lg" />
              
              <div className="flex justify-between items-end mt-auto">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-12 bg-white/5 rounded-md" />
                  <Skeleton className="h-10 w-24 bg-white/10 rounded-xl" />
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 items-center">
                    <Skeleton className="h-3 w-10 bg-white/5 rounded-md" />
                    <Skeleton className="h-8 w-12 bg-white/10 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <Skeleton className="h-3 w-12 bg-white/5 rounded-md" />
                    <Skeleton className="h-8 w-16 bg-white/10 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
      {/* Header Banner */}
      <div 
        className="relative bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-white/10 animate-in fade-in slide-in-from-top-4 duration-700"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform-gpu pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />
          <div className="absolute bottom-0 right-10 opacity-[0.03]">
            <Trophy className="w-40 h-40" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4 text-white">
              <div className="p-3 bg-background/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm">
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
        {/* Tabs */}
        <div className="flex items-center bg-card/40 backdrop-blur-3xl p-1.5 rounded-2xl border border-white/10 shadow-sm overflow-x-auto w-full sm:w-auto">
          {['all', 'online', 'offline'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-2 rounded-xl transition-all font-bold capitalize whitespace-nowrap flex-1 sm:flex-none ${
                filter === f
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        {/* Layout Switcher */}
        <div className="flex items-center bg-card/40 backdrop-blur-3xl p-1.5 rounded-2xl border border-white/10 shadow-sm shrink-0">
          <button 
            onClick={() => { 
              setLayout('grid'); 
              setExpandedId(null); 
              localStorage.setItem('student_results_layout', 'grid');
            }}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold ${layout === 'grid' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button 
            onClick={() => {
              setLayout('list');
              localStorage.setItem('student_results_layout', 'list');
            }}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold ${layout === 'list' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
          >
            <List className="w-5 h-5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className={layout === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8" 
        : "flex flex-col gap-4 w-full"
      }>
        {(() => {
          const filteredResults = results.filter(r => filter === 'all' || r.exam.type?.toLowerCase().includes(filter));
          if (filteredResults.length === 0) {
            return (
              <div className="col-span-full py-20 text-center bg-card/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
                <FileText className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30 relative z-10" />
                <p className="text-xl font-bold text-white mb-2 relative z-10">No results found.</p>
                <p className="text-muted-foreground relative z-10">You haven't completed any {filter !== 'all' ? filter : ''} exams yet.</p>
              </div>
            );
          }
          return filteredResults.map((result, index) => {
            const finalGrade = result.grade || calculateGrade(result.obtained_marks, result.total_marks);
            
            if (layout === 'list' && expandedId !== result.id) {
              return (
                <div 
                  key={result.id}
                  onClick={() => setExpandedId(result.id)}
                  className="flex items-center justify-between p-5 sm:p-6 sm:px-8 bg-card/40 backdrop-blur-2xl border border-white/10 rounded-2xl cursor-pointer hover:bg-card/60 hover:border-primary/30 transition-all group shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform shadow-sm shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <Badge variant="outline" className="bg-background/50 border-white/10 text-white/90 px-2 py-0 text-[10px] rounded-md shadow-sm shrink-0 uppercase tracking-wider mb-1.5 w-fit flex">
                        {result.exam.type?.toLowerCase() === 'offline' ? 'Offline' : 'Online'}
                      </Badge>
                      <h3 className="font-bold text-white text-base sm:text-lg leading-tight truncate mb-1">{result.exam.title}</h3>
                      <p className="text-xs sm:text-sm text-blue-300 font-medium truncate">
                        {result.exam.course?.title || "N/A"}
                        {result.exam.batch?.name ? ` • ${result.exam.batch.name}` : ''}
                      </p>
                    </div>
                  </div>
                  {result.exam.type?.toLowerCase() === 'offline' ? (
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="text-xl font-black text-white leading-none">
                        {result.obtained_marks} <span className="text-sm font-bold text-white/60">/ {result.total_marks}</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {/* @ts-ignore */}
                        {result.exam.is_grading_enabled !== false && (
                          <div className={`px-4 h-7 rounded-lg bg-gradient-to-r ${getGradeColor(finalGrade)} text-sm font-black shadow-sm flex items-center justify-center`}>
                            <span className="relative bottom-[1px]">{finalGrade}</span>
                          </div>
                        )}
                        <RankMedal rank={result.rank} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="text-xl font-black text-white leading-none">
                        {result.obtained_marks} <span className="text-sm font-bold text-white/60">/ {result.total_marks}</span>
                      </div>
                      <RankMedal rank={result.rank} />
                      {/* @ts-ignore */}
                      {result.exam.is_grading_enabled !== false && (
                        <div className={`px-4 h-8 rounded-xl bg-gradient-to-r ${getGradeColor(finalGrade)} text-lg font-black shadow-sm flex items-center justify-center`}>
                          <span className="relative bottom-[1px]">{finalGrade}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div 
                key={result.id} 
                className="group relative bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col shadow-xl transition-all duration-500 hover:shadow-primary/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div 
                    onClick={() => { if (layout === 'list') setExpandedId(null); }}
                    className={`flex justify-between items-start gap-4 border-b border-white/5 ${
                      layout === 'list' 
                        ? 'cursor-pointer group/header hover:bg-white/[0.03] -mx-6 -mt-6 p-6 pb-4 md:-mx-8 md:-mt-8 md:p-8 md:pb-5 rounded-t-3xl transition-colors mb-4' 
                        : 'mb-4 pb-4'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-3 bg-background/50 border-white/10 text-white px-3 py-1 text-xs rounded-full shadow-sm backdrop-blur-md">
                        {result.exam.type === 'offline' ? 'Offline Exam' : 'Online Exam'}
                      </Badge>
                      <h2 className="text-xl font-bold text-white leading-snug line-clamp-2">
                        {result.exam.title}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-blue-300 mt-2 font-semibold">
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {result.exam.course?.title || "N/A"}
                          {result.exam.batch?.name ? ` • ${result.exam.batch.name}` : ''}
                        </span>
                      </div>
                    </div>
                    
                    {/* Held Date Right Side */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {layout === 'list' && (
                        <div className="p-2 bg-background/50 rounded-full border border-white/10 text-muted-foreground transition-all duration-300 group-hover/header:bg-white/10 group-hover/header:text-white group-hover/header:scale-110 shadow-sm">
                          <ChevronUp className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex flex-col items-end bg-background/40 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/5 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Held On</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-white whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        {result.exam.start_time ? new Date(result.exam.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 mt-2">
                    {/* Score */}
                    <div className="flex flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Score</div>
                      <div className="flex items-end">
                        <span className="text-4xl font-black text-white leading-none">{result.obtained_marks}</span>
                        <span className="text-lg font-bold text-white/60 ml-1 mb-1">/ {result.total_marks}</span>
                      </div>
                    </div>
                    
                    {/* Right side Info (Grade and Rank) */}
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center mr-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Rank</div>
                        <RankMedal rank={result.rank} />
                      </div>
                      {/* @ts-ignore */}
                      {result.exam.is_grading_enabled !== false && (
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Grade</div>
                          <div className={`px-4 h-10 rounded-2xl bg-gradient-to-r ${getGradeColor(finalGrade)} text-2xl font-black shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                            <span className="relative bottom-[2px]">{finalGrade}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5">
                    <Link 
                      href={`/student/exams/${result.exam.id}/leaderboard`} 
                      className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 hover:scale-[1.02] transition-all font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-300 hover:text-amber-200 group/btn"
                    >
                      <Trophy className="w-4 h-4 mr-2 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] group-hover/btn:animate-pulse" />
                      View Leaderboard
                      <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        })()}
      </div>
    </div>
  );
}
