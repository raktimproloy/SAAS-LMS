"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, CreditCard, LayoutGrid, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Course {
  id: number;
  title: string;
}

interface Batch {
  id: number;
  course_id: number;
  name: string;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  photo: string | null;
  phone: string;
  bloodGroup?: string;
  batch: {
    name: string;
    course: {
      title: string;
    };
  };
}

export default function QRCardsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [printCols, setPrintCols] = useState<string>("3");
  const [themeColor, setThemeColor] = useState<string>("slate");

  useEffect(() => {
    fetch("/api/admin/courses").then(res => res.json()).then(setCourses);
    fetch("/api/admin/batches").then(res => res.json()).then(setBatches);
  }, []);

  const handleGenerate = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students?batch_id=${selectedBatch}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredBatches = batches.filter(b => b.course_id.toString() === selectedCourse);

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "blue": return "from-blue-600 to-blue-800 text-blue-50 border-blue-200";
      case "emerald": return "from-emerald-600 to-emerald-800 text-emerald-50 border-emerald-200";
      case "violet": return "from-violet-600 to-violet-800 text-violet-50 border-violet-200";
      case "rose": return "from-rose-600 to-rose-800 text-rose-50 border-rose-200";
      default: return "from-slate-800 to-slate-900 text-slate-50 border-slate-200";
    }
  };

  const getIconColor = (theme: string) => {
    switch (theme) {
      case "blue": return "text-blue-600";
      case "emerald": return "text-emerald-600";
      case "violet": return "text-violet-600";
      case "rose": return "text-rose-600";
      default: return "text-slate-800";
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Print Styles injected directly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid !important;
            grid-template-columns: repeat(${printCols}, minmax(0, 1fr)) !important;
            gap: 1.5rem !important;
            padding: 1rem !important;
          }
          .hide-on-print { display: none !important; }
          .id-card-wrapper {
            page-break-inside: avoid;
            margin: 0 auto;
            transform: scale(0.95);
            transform-origin: top center;
          }
        }
      `}} />

      <div className="hide-on-print">
        <h1 className="text-3xl font-bold tracking-tight mb-2">QR ID Cards</h1>
        <p className="text-muted-foreground">Generate and print professional ID cards with QR codes for students.</p>
      </div>

      <Card className="border-none shadow-md hide-on-print">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="grid gap-2">
              <Label>Select Course</Label>
              <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v || ""); setSelectedBatch(""); }}>
                <SelectTrigger><SelectValue placeholder="-- Choose Course --" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Select Batch</Label>
              <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v || "")} disabled={!selectedCourse}>
                <SelectTrigger><SelectValue placeholder="-- Choose Batch --" /></SelectTrigger>
                <SelectContent>
                  {filteredBatches.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Theme Color</Label>
              <Select value={themeColor} onValueChange={(v) => setThemeColor(v || "slate")}>
                <SelectTrigger><SelectValue placeholder="Select Theme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slate">Slate (Classic)</SelectItem>
                  <SelectItem value="blue">Blue (Professional)</SelectItem>
                  <SelectItem value="emerald">Emerald (Success)</SelectItem>
                  <SelectItem value="violet">Violet (Creative)</SelectItem>
                  <SelectItem value="rose">Rose (Vibrant)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={!selectedBatch || loading} className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate Cards"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-muted/50 p-4 rounded-xl border hide-on-print">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{students.length} Cards Generated</h3>
                <p className="text-xs text-muted-foreground">Ready for printing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Layout:</Label>
                <Select value={printCols} onValueChange={(v) => setPrintCols(v || "3")}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns (Standard)</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700">
                <Printer className="w-4 h-4 mr-2" /> Print Cards
              </Button>
            </div>
          </div>

          <div className="print-area grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))` }}>
            {students.map(student => (
              <div key={student.id} className="id-card-wrapper w-[280px] h-[440px] bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex flex-col relative mx-auto group">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                {/* Header Banner */}
                <div className={`h-32 bg-gradient-to-br ${getThemeClasses(themeColor)} relative flex items-start justify-center pt-6`}>
                  <h2 className="font-bold text-lg tracking-wider uppercase text-white/95">INSTITUTE ID</h2>
                  {/* Decorative curved bottom */}
                  <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-none">
                    <svg className="relative block w-full h-[40px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.78,200.7,113.14,242.27,109.2,282.91,73.1,321.39,56.44Z" fill="#ffffff"></path>
                    </svg>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg">
                    <Avatar className="w-full h-full rounded-full ring-2 ring-gray-100">
                      <AvatarImage src={student.photo || ""} className="object-cover" />
                      <AvatarFallback className="text-2xl font-bold bg-slate-50 text-slate-400">
                        {student.name.substring(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 pt-12 pb-6 flex flex-col items-center text-center z-10">
                  <div className="mb-4 w-full">
                    <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1 truncate px-2" title={student.name}>{student.name}</h3>
                    <p className={`text-sm font-semibold ${getIconColor(themeColor)}`}>ID: {student.student_id}</p>
                  </div>

                  <div className="w-full space-y-2 text-xs text-gray-600 font-medium mb-auto">
                    <div className="bg-gray-50 rounded-lg p-2 flex justify-between items-center border border-gray-100">
                      <span className="text-gray-400">Course</span>
                      <span className="text-gray-900 truncate max-w-[120px]">{student.batch.course.title}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 flex justify-between items-center border border-gray-100">
                      <span className="text-gray-400">Batch</span>
                      <span className="text-gray-900">{student.batch.name}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 flex justify-between items-center border border-gray-100">
                      <span className="text-gray-400">Phone</span>
                      <span className="text-gray-900 font-mono">{student.phone}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mt-4 p-2 bg-white rounded-xl shadow-sm border border-gray-100 inline-block">
                    <QRCodeSVG 
                      value={student.student_id} 
                      size={80}
                      level="H"
                      className="opacity-90"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
