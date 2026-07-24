"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Trophy, ArrowRight, BookOpen } from "lucide-react";

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

  useEffect(() => {
    fetch('/api/student/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            My Results
          </h1>
          <p className="text-muted-foreground mt-1">
            View all your academic performance and grades.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No results available yet.</p>
          </div>
        ) : (
          results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-muted">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {result.exam.type === 'offline' ? 'Offline Exam' : 'Online Exam'}
                    </Badge>
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {result.exam.title}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 font-medium">
                      <BookOpen className="w-3.5 h-3.5" />
                      {result.exam.course?.title || "N/A"}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Score</div>
                    <div className="text-3xl font-black text-foreground leading-none">
                      {result.obtained_marks} <span className="text-base font-medium text-muted-foreground/70">/ {result.total_marks}</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-6 text-right">
                    {/* @ts-ignore */}
                    {result.exam.is_grading_enabled && (
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Grade</div>
                        <Badge className="bg-green-500 hover:bg-green-600 text-white text-2xl font-black px-4 py-0.5 shadow-sm leading-none">
                          {result.grade || calculateGrade(result.obtained_marks, result.total_marks)}
                        </Badge>
                      </div>
                    )}
                    {result.rank && (
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Rank</div>
                        <div className="text-3xl font-black text-primary leading-none">#{result.rank}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-6 pt-4 border-t">
                  <span>Held: {result.exam.start_time ? new Date(result.exam.start_time).toLocaleDateString() : 'N/A'}</span>
                  <Link 
                    href={`/student/exams/${result.exam.id}/leaderboard`} 
                    className="flex items-center text-primary font-medium hover:underline"
                  >
                    View Leaderboard
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
