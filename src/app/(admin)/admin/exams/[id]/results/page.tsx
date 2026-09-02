"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Trophy, Clock, Target, Users, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/admin/exams/${examId}/results`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const handleDelete = async (resultId: number) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    try {
      const res = await fetch(`/api/admin/exams/${examId}/results?resultId=${resultId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchResults();
      } else {
        alert("Failed to delete result");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete result");
    }
  };

  if (loading) {
    return <div className="p-8"><Skeleton className="h-10 w-48 mb-6" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!data || !data.exam) {
    return <div className="p-8">Exam not found or you do not have permission.</div>;
  }

  const { exam, results } = data;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/exams')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Results & Leaderboard</h1>
            <p className="text-muted-foreground mt-1">{exam.title} {exam.is_public && <Badge variant="secondary" className="ml-2">Public Exam</Badge>}</p>
          </div>
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" />
          Print to PDF
        </Button>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 text-center border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold mb-2 text-black">{exam.title}</h1>
        <p className="text-gray-800 font-medium">
          {exam.is_public ? "Public Exam Leaderboard" : "Course Exam Leaderboard"} • Total Participants: {results.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                <h3 className="text-2xl font-bold">{results.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="print:border-0 print:shadow-none print:bg-transparent">
        <CardHeader className="print:hidden">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>All participants ranked by their obtained marks.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 print:p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="print:border-b-2 print:border-black">
                  <TableHead className="w-16 text-center print:text-black print:font-bold">Rank</TableHead>
                  <TableHead className="print:text-black print:font-bold">Participant Info</TableHead>
                  <TableHead className="print:text-black print:font-bold">Contact (Phone / Email)</TableHead>
                  <TableHead className="print:text-black print:font-bold">Class Level & Inst.</TableHead>
                  <TableHead className="text-center print:text-black print:font-bold">Score</TableHead>
                  <TableHead className="text-center print:text-black print:font-bold">Time Taken</TableHead>
                  <TableHead className="text-right print:hidden">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No results yet.</TableCell>
                  </TableRow>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  results.map((result: any, index: number) => {
                    const isPublicParticipant = !!result.public_participant;
                    const name = isPublicParticipant ? result.public_participant.name : result.student?.name;
                    const phone = isPublicParticipant ? result.public_participant.phone : result.student?.phone;
                    const email = isPublicParticipant ? "N/A" : (result.student?.email || "N/A");
                    const studentId = !isPublicParticipant ? result.student?.student_id : null;
                    const classLevel = isPublicParticipant 
                      ? result.public_participant.study_level 
                      : result.student?.batch?.name || "N/A";
                    const institution = isPublicParticipant
                      ? (result.public_participant.institution || "N/A")
                      : "Internal Student";

                    const extraInfo = isPublicParticipant 
                      ? "Public Lead"
                      : `Student ID: ${studentId}`;

                    return (
                      <TableRow key={result.id} className="print:border-b print:border-gray-300">
                        <TableCell className="text-center font-bold">
                          {index === 0 ? <span className="text-amber-500 text-lg print:text-black">1</span> :
                           index === 1 ? <span className="text-slate-400 text-lg print:text-black">2</span> :
                           index === 2 ? <span className="text-orange-400 text-lg print:text-black">3</span> : 
                           <span className="print:text-black">{index + 1}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold print:text-black">{name}</div>
                          <div className="text-xs text-muted-foreground print:text-gray-600">{extraInfo}</div>
                          {isPublicParticipant && <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0 h-4 print:border-gray-400 print:text-gray-800">Public Lead</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm print:text-black">{phone}</div>
                          <div className="text-xs text-muted-foreground print:text-gray-600">{email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm print:text-black">{classLevel}</div>
                          <div className="text-xs text-muted-foreground print:text-gray-600">{institution}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-primary print:text-black">{result.obtained_marks}</div>
                          <div className="text-xs text-muted-foreground print:text-gray-600">out of {result.total_marks}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm print:text-black">
                            <Clock className="w-3 h-3 text-muted-foreground print:hidden" />
                            {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
                          </div>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(result.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
