"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Star, FileText } from "lucide-react";
import { AttendanceCalendar } from "@/components/student/attendance-calendar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StudentReportTable({ students }: { students: any[] }) {
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  const toggleStudent = (id: number) => {
    setExpandedStudentId(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-medium">Student</th>
              <th className="px-4 md:px-6 py-4 font-medium text-center">Attendance</th>
              <th className="hidden md:table-cell px-6 py-4 font-medium text-center">Rating</th>
              <th className="hidden sm:table-cell px-6 py-4 font-medium text-center">Reports</th>
              <th className="px-4 md:px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No students found in this batch.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isExpanded = expandedStudentId === student.id;
                
                return (
                  <React.Fragment key={student.id}>
                    <tr 
                      onClick={() => toggleStudent(student.id)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={student.photo || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {student.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{student.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{student.student_id}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 md:px-6 py-4 text-center">
                        <Badge variant={student.attendancePercentage >= 75 ? "default" : student.attendancePercentage >= 50 ? "secondary" : "destructive"}>
                          {student.attendancePercentage}%
                        </Badge>
                      </td>
                      
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex items-center justify-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {student.rating ? `${student.rating}/5` : "N/A"}
                          </span>
                        </div>
                      </td>
                      
                      <td className="hidden sm:table-cell px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="font-medium">{student.reportCount}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 md:px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                        <td colSpan={5} className="p-3 sm:p-6">
                          <div className="max-w-4xl mx-auto overflow-hidden">
                            <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Attendance & Report Calendar</h4>
                            <AttendanceCalendar 
                              attendanceData={student.attendance} 
                              reports={student.reports}
                              allResults={student.allResults}
                              studentId={student.id}
                              readOnly={false}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
