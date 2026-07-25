"use client";

import { useState, useEffect } from "react";
import { Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentResult {
  id?: number;
  obtained_marks: number;
  grade: string | null;
  comment: string | null;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  exam_results: StudentResult[];
}

export default function PrintExamResultPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, studentsRes] = await Promise.all([
          fetch(`/api/admin/exams/${params.id}`),
          fetch(`/api/admin/exams/offline/${params.id}/students`)
        ]);

        if (examRes.ok) setExam(await examRes.json());
        if (studentsRes.ok) setStudents(await studentsRes.json());
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return <div className="text-center p-8">Exam not found</div>;
  }

  const gradedStudents = students
    .filter(s => s.exam_results.length > 0)
    .sort((a, b) => b.exam_results[0].obtained_marks - a.exam_results[0].obtained_marks);

  const ungradedStudents = students
    .filter(s => s.exam_results.length === 0)
    .sort((a, b) => a.student_id.localeCompare(b.student_id));

  const allStudents = [...gradedStudents, ...ungradedStudents];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Print Controls (hidden on print) */}
      <div className="print:hidden p-4 bg-slate-100 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="font-semibold text-lg text-slate-900">Print Preview</h2>
          <p className="text-sm text-slate-500">Make sure your printer settings are set to A4 portrait.</p>
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" /> Print Results
        </Button>
      </div>

      {/* Printable Area */}
      <div className="p-8 max-w-[210mm] mx-auto bg-white text-black print:p-0 print:max-w-none">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold uppercase mb-1">Doctor Biology</h1>
          <h2 className="text-xl font-semibold text-gray-800">Exam Result Sheet</h2>
        </div>

        {/* Exam Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><span className="font-semibold">Exam Title:</span> {exam.title}</p>
            <p><span className="font-semibold">Course:</span> {exam.course?.title || "N/A"}</p>
            <p><span className="font-semibold">Batch:</span> {exam.batch?.name || "N/A"}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Date Held:</span> {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : "N/A"}</p>
            <p><span className="font-semibold">Total Marks:</span> {exam.total_marks}</p>
            <p><span className="font-semibold">Total Students:</span> {allStudents.length}</p>
          </div>
        </div>

        {/* Results Table */}
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-100">
              <th className="border border-black p-2 text-center w-12 font-bold">Rank</th>
              <th className="border border-black p-2 text-left font-bold">Student Name</th>
              <th className="border border-black p-2 text-left w-32 font-bold">Student ID</th>
              <th className="border border-black p-2 text-center w-24 font-bold">Marks</th>
              {exam.is_grading_enabled && (
                <th className="border border-black p-2 text-center w-20 font-bold">Grade</th>
              )}
              <th className="border border-black p-2 text-left w-48 font-bold">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {allStudents.map((student, index) => {
              const result = student.exam_results[0];
              const isAbsent = !result;
              return (
                <tr key={student.id} className="even:bg-gray-50 print:even:bg-gray-50">
                  <td className="border border-black p-2 text-center font-semibold">
                    {isAbsent ? "-" : index + 1}
                  </td>
                  <td className="border border-black p-2">{student.name}</td>
                  <td className="border border-black p-2 font-mono text-xs">{student.student_id}</td>
                  <td className="border border-black p-2 text-center font-bold">
                    {isAbsent ? "Absent" : result.obtained_marks}
                  </td>
                  {exam.is_grading_enabled && (
                    <td className="border border-black p-2 text-center font-semibold">
                      {isAbsent ? "-" : (result.grade || "-")}
                    </td>
                  )}
                  <td className="border border-black p-2 text-xs italic text-gray-700">
                    {isAbsent ? "Did not attend" : (result.comment || "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div className="mt-24 flex justify-between px-8 text-sm">
          <div className="text-center">
            <div className="w-48 border-t border-black pt-2 font-semibold">Examiner Signature</div>
          </div>
          <div className="text-center">
            <div className="w-48 border-t border-black pt-2 font-semibold">Authorized Signature</div>
          </div>
        </div>
        
        {/* Timestamp */}
        <div className="mt-12 text-xs text-gray-500 text-center print:block hidden">
          Printed on {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
