"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AttendanceCalendar } from "@/components/student/attendance-calendar";

interface StudentExpandedCalendarProps {
  studentId: number;
  batchId?: number | null;
}

export function StudentExpandedCalendar({ studentId, batchId }: StudentExpandedCalendarProps) {
  const [attendanceData, setAttendanceData] = useState<
    Array<{ date: string | Date; status: "present" | "absent" | "late" }>
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reports, setReports] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/profile`);
      if (!res.ok) throw new Error("Failed to fetch student profile");
      const data = await res.json();
      setAttendanceData(data.attendance || []);
      setReports(data.reports || []);
      setExamResults(data.exam_results || []);
    } catch (err) {
      console.error(err);
      setAttendanceData([]);
      setReports([]);
      setExamResults([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar, refreshKey]);

  if (loading && attendanceData.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[10px] border border-border bg-card py-16 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AttendanceCalendar
      attendanceData={attendanceData}
      reports={reports}
      allResults={examResults}
      studentId={studentId}
      batchId={batchId}
      readOnly={false}
      onReportAdded={() => setRefreshKey((k) => k + 1)}
      onAttendanceUpdated={() => setRefreshKey((k) => k + 1)}
    />
  );
}
