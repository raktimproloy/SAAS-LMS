"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Trophy, ArrowRight, BookOpen, Star } from "lucide-react";

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
    }
  };
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden bg-card/20 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-white/5 h-[200px] w-full">
          <Skeleton className="h-12 w-64 mb-4 bg-white/10 rounded-2xl" />
          <Skeleton className="h-6 w-96 max-w-full bg-white/5 rounded-xl" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div 
        className="relative bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-white/10"
        data-aos="fade-down"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform-gpu pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />
          <div className="absolute bottom-0 right-10 opacity-[0.03]">
            <Trophy className="w-40 h-40" />
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4 text-foreground">
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

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-lg relative overflow-hidden" data-aos="fade-up">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
            <FileText className="h-20 w-20 mx-auto mb-6 text-muted-foreground/30 relative z-10" />
            <p className="text-xl font-bold text-foreground mb-2 relative z-10">No results found.</p>
            <p className="text-muted-foreground relative z-10">You haven't completed any exams yet.</p>
          </div>
        ) : (
          results.map((result, index) => {
            const finalGrade = result.grade || calculateGrade(result.obtained_marks, result.total_marks);
            
            return (
              <div 
                key={result.id} 
                className="group relative bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20 hover:bg-card/60 overflow-hidden"
                data-aos="fade-up"
              >
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start gap-4 mb-4 border-b border-white/5 pb-4">
                    <div>
                      <Badge variant="outline" className="mb-3 bg-background/50 border-white/10 text-muted-foreground px-3 py-1 text-xs rounded-full shadow-sm backdrop-blur-md">
                        {result.exam.type === 'offline' ? 'Offline Exam' : 'Online Exam'}
                      </Badge>
                      <h2 className="text-xl font-bold text-foreground leading-snug line-clamp-2">
                        {result.exam.title}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-primary mt-2 font-semibold">
                        <BookOpen className="w-4 h-4" />
                        {result.exam.course?.title || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-8 mt-2">
                    {/* Score */}
                    <div className="flex flex-col">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Score</div>
                      <div className="flex items-end">
                        <span className="text-4xl font-black text-foreground leading-none">{result.obtained_marks}</span>
                        <span className="text-lg font-bold text-muted-foreground/60 ml-1 mb-1">/ {result.total_marks}</span>
                      </div>
                    </div>
                    
                    {/* Right side Info (Grade and Rank) */}
                    <div className="flex items-center gap-6">
                      {result.rank && (
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Rank</div>
                          <div className="flex items-center gap-1 font-black text-xl text-amber-500 drop-shadow-sm">
                            <Star className="w-4 h-4 fill-amber-500" /> {result.rank}
                          </div>
                        </div>
                      )}
                      {/* @ts-ignore */}
                      {result.exam.is_grading_enabled !== false && (
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Grade</div>
                          <div className={`px-4 py-1.5 rounded-2xl bg-gradient-to-r ${getGradeColor(finalGrade)} text-2xl font-black shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                            {finalGrade}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground font-medium pt-4 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/50" />
                      Held: {result.exam.start_time ? new Date(result.exam.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                    <Link 
                      href={`/student/exams/${result.exam.id}/leaderboard`} 
                      className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/5 hover:from-blue-500 hover:to-cyan-500 text-primary hover:text-white font-bold transition-all group/btn hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      Leaderboard
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
