"use client";

import React, { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Star, FileText, Search, Filter, Plus, Clock, Phone } from "lucide-react";
import { AttendanceCalendar } from "@/components/student/attendance-calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DayDetailsModal, DayDetails } from "@/components/student/day-details-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StudentReportTable({ students, batchId }: { students: any[]; batchId: number }) {
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "low_attendance", "has_reports"
  
  // Quick Report Modal state
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [quickReportStudent, setQuickReportStudent] = useState<any>(null);

  const toggleStudent = (id: number) => {
    setExpandedStudentId(prev => prev === id ? null : id);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search filter
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Dropdown filter
      if (filter === "low_attendance") return student.attendancePercentage < 75;
      if (filter === "has_reports") return student.reportCount > 0;
      
      return true;
    });
  }, [students, searchQuery, filter]);

  const handleQuickReportClick = (e: React.MouseEvent, student: any) => {
    e.stopPropagation(); // Prevent row expansion
    setQuickReportStudent(student);
    setIsQuickReportOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or ID..." 
            className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-auto flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <Filter className="w-4 h-4" /> 
                Filter: {filter === 'all' ? 'All Students' : filter === 'low_attendance' ? 'Low Attendance' : 'Has Reports'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter Students</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                <DropdownMenuRadioItem value="all">All Students</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low_attendance">Low Attendance (&lt;75%)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="has_reports">Has Reports</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50 border-b">
              <tr>
                <th className="px-4 md:px-6 py-4 font-medium">Student</th>
                <th className="px-4 md:px-6 py-4 font-medium text-center">Attendance</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium text-center">Rating</th>
                <th className="hidden sm:table-cell px-6 py-4 font-medium text-center">Reports</th>
                <th className="px-4 md:px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-base font-medium">No students found.</p>
                      <p className="text-sm">Try adjusting your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isExpanded = expandedStudentId === student.id;
                  const hasLowAttendance = student.attendancePercentage < 75;
                  
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
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {student.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                {student.name}
                                {hasLowAttendance && (
                                  <span className="flex h-2 w-2 rounded-full bg-destructive" title="Low Attendance" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium mt-0.5">{student.student_id}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4 text-center">
                          <Badge variant={hasLowAttendance ? "destructive" : student.attendancePercentage >= 90 ? "default" : "secondary"} className="font-bold">
                            {student.attendancePercentage}%
                          </Badge>
                        </td>
                        
                        <td className="hidden md:table-cell px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {student.rating ? `${student.rating}/5` : "N/A"}
                            </span>
                          </div>
                        </td>
                        
                        <td className="hidden sm:table-cell px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 font-semibold">
                            <FileText className="w-3.5 h-3.5" />
                            {student.reportCount}
                          </div>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hidden lg:flex gap-1.5 h-8 text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                              onClick={(e) => handleQuickReportClick(e, student)}
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Report
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-t shadow-inner">
                          <td colSpan={5} className="p-4 md:p-6 lg:p-8">
                            <div className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-6">
                              {/* Left: Student Info */}
                              <div className="w-full xl:w-1/3 flex flex-col gap-4">
                                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">
                                    Student Info
                                  </h4>
                                  <div className="space-y-4 text-sm">
                                    <div>
                                      <span className="text-xs text-muted-foreground block mb-0.5">Phone</span>
                                      <span className="font-semibold text-slate-900 dark:text-white">{student.phone || "—"}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                      <span className="text-xs text-muted-foreground block mb-0.5">Parent Name</span>
                                      <span className="font-semibold text-slate-900 dark:text-white">{student.parent_name || "—"}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground block mb-0.5">Parent Phone</span>
                                      <span className="font-semibold text-slate-900 dark:text-white">{student.parent_phone || "—"}</span>
                                    </div>
                                    {student.parent_phone && (
                                      <a 
                                        href={`tel:${student.parent_phone}`}
                                        className="mt-2 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-semibold transition-colors"
                                      >
                                        <Phone className="w-4 h-4" /> Call Parent
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right: Calendar */}
                              <div className="w-full xl:w-2/3">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Attendance & Activity Calendar
                                  </h4>
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="lg:hidden gap-1.5 h-8 text-xs font-semibold"
                                    onClick={(e) => handleQuickReportClick(e, student)}
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add Report
                                  </Button>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                                  <AttendanceCalendar 
                                    attendanceData={student.attendance} 
                                    reports={student.reports}
                                    allResults={student.allResults}
                                    studentId={student.id}
                                    batchId={batchId}
                                    readOnly={false}
                                  />
                                </div>
                              </div>
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

      {/* Quick Report Modal */}
      {isQuickReportOpen && quickReportStudent && (
        <DayDetailsModal
          isOpen={isQuickReportOpen}
          onClose={() => {
            setIsQuickReportOpen(false);
            setQuickReportStudent(null);
          }}
          details={{
            date: new Date(),
            attendance: quickReportStudent.attendance.find((a: any) => new Date(a.date).toDateString() === new Date().toDateString())?.status,
          }}
          readOnly={false}
          studentId={quickReportStudent.id}
          batchId={batchId}
          onReportAdded={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
