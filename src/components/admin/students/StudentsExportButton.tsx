"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site.config";
import type { Batch, Course, Student } from "./types";

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

type PrintRow = Record<string, string>;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toPrintRows(students: Student[]): PrintRow[] {
  return students.map((student) => ({
    "Student ID": student.student_id || "",
    Name: student.name || "",
    Phone: student.phone || "",
    Course: student.batch?.course?.title || "",
    Batch: student.batch?.name || "",
    Status: student.status === "active" ? "Active" : "Inactive",
    Gender: student.gender || "",
    "Parent Name": student.parent_name || "",
    "Parent Phone": student.parent_phone || "",
    Email: student.email || "",
    Address: student.address || "",
  }));
}

function downloadCsv(rows: PrintRow[], filename: string) {
  if (!rows.length) {
    alert("No data available to export for this selection.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openPrintWindow(rows: PrintRow[], orientation: "portrait" | "landscape", subtitle: string) {
  if (!rows.length) {
    alert("No data available to print for this selection.");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for this website to use the print feature.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const theadHTML = `
    <tr>
      <th style="width: 40px; text-align: center;">#</th>
      ${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}
    </tr>
  `;
  const tbodyHTML = rows
    .map(
      (row, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      ${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}
    </tr>`
    )
    .join("");

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print - Students</title>
        <style>
          @page { size: ${orientation}; margin: 10mm; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px; color: #333; margin: 0; padding: 0;
          }
          h1 {
            text-align: center; font-size: 18px; margin: 0 0 4px;
            text-transform: uppercase; letter-spacing: 1px;
          }
          .institute { text-align: center; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
          .subtitle { text-align: center; font-size: 12px; color: #555; margin-bottom: 8px; }
          .date-time { text-align: right; font-size: 10px; color: #666; margin-bottom: 10px; }
          .meta { text-align: center; font-size: 11px; color: #666; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td {
            border: 1px solid #ccc; padding: 6px; text-align: left; word-break: break-word;
          }
          th {
            background-color: #f8f9fa; font-weight: bold;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          tr:nth-child(even) {
            background-color: #fdfdfd;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        <div class="date-time">Printed on: ${escapeHtml(new Date().toLocaleString())}</div>
        <div class="institute">${escapeHtml(siteConfig.instituteName)}</div>
        <h1>Students</h1>
        ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
        <div class="meta">Total: ${rows.length} student${rows.length === 1 ? "" : "s"}</div>
        <table>
          <thead>${theadHTML}</thead>
          <tbody>${tbodyHTML}</tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 250);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

async function fetchPrintStudents(courseId: string, batchId: string): Promise<Student[]> {
  const params = new URLSearchParams();
  if (courseId) params.set("course_id", courseId);
  if (batchId) params.set("batch_id", batchId);
  const res = await fetch(`/api/admin/students?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load students for print.");
  const payload = await res.json();
  const list: Student[] = Array.isArray(payload) ? payload : payload.students ?? [];
  if (!list.length) {
    throw new Error("No students found for this course / batch.");
  }
  return list;
}

interface StudentsExportButtonProps {
  courses: Course[];
  batches: Batch[];
  defaultCourseId?: string;
  defaultBatchId?: string;
}

export function StudentsExportButton({
  courses,
  batches,
  defaultCourseId = "",
  defaultBatchId = "",
}: StudentsExportButtonProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [printCourseId, setPrintCourseId] = useState("");
  const [printBatchId, setPrintBatchId] = useState("");

  useEffect(() => {
    if (!modalOpen) return;
    setPrintCourseId(defaultCourseId || "");
    setPrintBatchId(defaultBatchId || "");
  }, [modalOpen, defaultCourseId, defaultBatchId]);

  const filteredBatches = printCourseId
    ? batches.filter((b) => b.course?.id?.toString() === printCourseId)
    : [];

  const buildSubtitle = () => {
    const parts: string[] = [];
    const course = courses.find((c) => c.id.toString() === printCourseId);
    const batch = batches.find((b) => b.id.toString() === printBatchId);
    if (course) parts.push(`Course: ${course.title}`);
    if (batch) parts.push(`Batch: ${batch.name}`);
    if (parts.length === 0) parts.push("All Courses");
    return parts.join("  ·  ");
  };

  const handleCsv = async () => {
    setIsWorking(true);
    try {
      const list = await fetchPrintStudents(defaultCourseId, defaultBatchId);
      downloadCsv(toPrintRows(list), "students.csv");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to export CSV.");
    } finally {
      setIsWorking(false);
    }
  };

  const openPrintModal = (orient: "portrait" | "landscape") => {
    setOrientation(orient);
    setModalOpen(true);
  };

  const handleConfirmPrint = async () => {
    setIsWorking(true);
    try {
      const list = await fetchPrintStudents(printCourseId, printBatchId);
      openPrintWindow(toPrintRows(list), orientation, buildSubtitle());
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to prepare print data.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground disabled:opacity-50">
          <Download className="h-4 w-4" />
          Export / Print
          <ChevronDown className="h-4 w-4 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCsv} disabled={isWorking} className="cursor-pointer">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Download CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Print / PDF Options</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => openPrintModal("portrait")} className="cursor-pointer">
            <FileText className="h-4 w-4" />
            Print (Portrait)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openPrintModal("landscape")} className="cursor-pointer">
            <Printer className="h-4 w-4" />
            Print (Landscape)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Students</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Select course / batch to print only that list
          </p>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="print-course">Course</Label>
              <select
                id="print-course"
                className={selectClass}
                value={printCourseId}
                onChange={(e) => {
                  setPrintCourseId(e.target.value);
                  setPrintBatchId("");
                }}
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="print-batch">Batch</Label>
              <select
                id="print-batch"
                className={selectClass}
                value={printBatchId}
                onChange={(e) => setPrintBatchId(e.target.value)}
                disabled={!printCourseId}
              >
                <option value="">All Batches</option>
                {filteredBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
              Print mode: <span className="font-medium capitalize text-foreground">{orientation}</span>
              {" · "}
              Only matching students will be printed.
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPrint} disabled={isWorking}>
              {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              {isWorking ? "Preparing..." : "Print"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
