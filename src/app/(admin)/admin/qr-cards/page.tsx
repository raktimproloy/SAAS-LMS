"use client";

import { useState, useEffect, Fragment } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, CreditCard, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site.config";

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
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  batch: {
    name: string;
    course: {
      title: string;
    };
  };
}

const themes = {
  classic: { primary: "#14b8a6", secondary: "#f97316" }, // Teal & Orange
  blue: { primary: "#2563eb", secondary: "#3b82f6" }, 
  emerald: { primary: "#059669", secondary: "#10b981" },
  violet: { primary: "#7c3aed", secondary: "#8b5cf6" },
  rose: { primary: "#e11d48", secondary: "#f43f5e" }
};
type ThemeKey = keyof typeof themes;

const TopWave = ({ color1, color2 }: { color1: string, color2: string }) => (
  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-[80px] z-0">
    <path d="M0,0 L100,0 L100,10 C60,30 40,5 0,15 Z" fill={color2} />
    <path d="M0,0 L40,0 C25,15 15,30 0,40 Z" fill={color1} />
  </svg>
);

const BottomWave = ({ color1, color2 }: { color1: string, color2: string }) => (
  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-[80px] z-0">
    <path d="M0,40 L100,40 L100,20 C60,5 40,30 0,15 Z" fill={color1} />
    <path d="M0,40 L30,40 C20,25 10,10 0,25 Z" fill={color2} />
  </svg>
);

export default function QRCardsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [sitePhone, setSitePhone] = useState(siteConfig.contact.phone);

  useEffect(() => {
    fetch('/api/admin/content/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.contact_phone) setSitePhone(data.contact_phone);
      })
      .catch(console.error);
  }, []);

  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [printCols, setPrintCols] = useState<string>("3");
  const [themeColor, setThemeColor] = useState<ThemeKey>("classic");
  const [printSide, setPrintSide] = useState<string>("both"); // front, back, both
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/admin/courses").then(res => res.json()).then(setCourses);
    fetch("/api/admin/batches").then(res => res.json()).then(setBatches);
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      setSelectedStudents(students.map(s => s.id));
    }
  }, [students]);

  const toggleSelection = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

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
  const t = themes[themeColor] || themes.classic;

  const renderFront = (student: Student, isSelected: boolean) => (
    <div 
      className={`id-card-wrapper w-[280px] h-[440px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 flex flex-col relative group print-card cursor-pointer transition-all ${isSelected ? '' : 'opacity-40 grayscale'} ${isSelected ? '' : 'hide-on-print'}`}
      onClick={() => toggleSelection(student.id)}
    >
      <div className="absolute top-3 left-3 z-50 hide-on-print">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 text-transparent'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
           </svg>
        </div>
      </div>
      <TopWave color1={t.primary} color2={t.secondary} />
      
      <div className="z-10 mt-6 w-full flex justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center bg-white shadow-sm" style={{ borderColor: t.secondary, color: t.primary }}>
          <CreditCard size={20} />
        </div>
      </div>

      <div className="z-10 mt-4 flex justify-center w-full">
        <div className="w-24 h-24 bg-gray-100 rounded-full border-4 overflow-hidden relative shadow-sm" style={{ borderColor: t.secondary }}>
          {student.photo ? (
            <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <LayoutGrid size={24} />
            </div>
          )}
        </div>
      </div>

      <div className="z-10 mt-4 w-full px-4 text-center">
        <h3 className="font-bold text-[22px] text-gray-800 uppercase mb-0.5 truncate px-2 leading-tight tracking-wide">
          {student.name}
        </h3>
        <p className="font-bold text-[13px] mb-1 tracking-wide" style={{ color: t.primary }}>ID: {student.student_id}</p>
        <p className="text-[12px] font-semibold text-gray-600 truncate max-w-[200px] mx-auto">
          {student.batch.course.title}
        </p>
      </div>

      {/* Floating QR Code in the middle */}
      <div className="z-10 mt-5 flex justify-center w-full">
        <div className="p-2 bg-white rounded-xl shadow-md border border-gray-100">
          <QRCodeSVG value={student.student_id} size={75} level="H" />
        </div>
      </div>

      <BottomWave color1={t.primary} color2={t.secondary} />
      
      {/* Floating dots decoration */}
      <div className="absolute left-6 top-[130px] w-4 h-4 rounded-full border opacity-40 pointer-events-none" style={{ borderColor: t.primary }} />
      <div className="absolute right-8 top-[110px] w-3 h-3 rounded-full border opacity-40 pointer-events-none" style={{ borderColor: t.secondary }} />
      <div className="absolute left-10 bottom-[100px] w-5 h-5 rounded-full border opacity-40 pointer-events-none" style={{ borderColor: t.primary }} />
    </div>
  );

  const renderBack = (student: Student, isSelected: boolean) => (
    <div 
      className={`id-card-wrapper w-[280px] h-[440px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 flex flex-col relative group print-card cursor-pointer transition-all ${isSelected ? '' : 'opacity-40 grayscale'} ${isSelected ? '' : 'hide-on-print'}`}
      onClick={() => toggleSelection(student.id)}
    >
      <div className="absolute top-3 left-3 z-50 hide-on-print">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 text-transparent'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
           </svg>
        </div>
      </div>
      <TopWave color1={t.primary} color2={t.secondary} />
      
      <div className="z-10 mt-[90px] w-full flex flex-col px-8 text-left">
        
        {/* Parent Info */}
        <div className="mb-4">
          <h4 className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: t.secondary }}>Emergency Contact</h4>
          <p className="text-[13px] font-bold text-gray-800 leading-tight mb-0.5">{student.parent_name || "N/A"}</p>
          <p className="text-[12px] font-semibold text-gray-600">
            Ph: {student.parent_phone || student.phone || "N/A"}
          </p>
        </div>

        {/* Student Address */}
        <div className="mb-6">
          <h4 className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: t.secondary }}>Address</h4>
          <p className="text-[12px] font-semibold text-gray-600 leading-snug">
            {student.address || "Address not provided."}
          </p>
        </div>

        {/* Institute Contact */}
        <div className="mt-2 text-center w-full">
          <h4 className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: t.secondary }}>
            Institute Contact
          </h4>
          <div className="font-bold text-[18px] tracking-widest" style={{ color: t.primary }}>
            {sitePhone}
          </div>
        </div>

      </div>

      <BottomWave color1={t.primary} color2={t.secondary} />
      
      {/* Floating dots decoration */}
      <div className="absolute right-12 top-[100px] w-4 h-4 rounded-full border opacity-40 pointer-events-none" style={{ borderColor: t.primary }} />
      <div className="absolute left-8 top-[160px] w-3 h-3 rounded-full border opacity-40 pointer-events-none" style={{ borderColor: t.secondary }} />
      <div className="absolute right-6 bottom-[130px] w-5 h-5 rounded-full border opacity-40 pointer-events-none" style={{ borderColor: t.primary }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide non-print elements */
          .hide-on-print, aside, nav, header { 
            display: none !important; 
          }
          
          /* Ensure page background is clean */
          body, html, main, div[data-radix-scroll-area-viewport] {
            background: white !important;
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Force hide any Next.js dev overlays or other root elements that might show backgrounds */
          #__next {
            background: white !important;
          }

          /* Dynamic Grid based on Layout selector */
          .print-area {
            display: grid !important;
            grid-template-columns: repeat(${printCols}, 1fr) !important;
            gap: 10px !important;
            width: 100% !important;
            justify-items: center;
            align-items: flex-start;
            background: white !important;
            padding: 0 !important;
          }

          .print-card-container {
            display: flex;
            justify-content: center;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            height: ${printCols === '2' ? '430px' : printCols === '3' ? '340px' : '265px'} !important;
            width: 100% !important;
            overflow: hidden !important;
          }

          .id-card-wrapper {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            /* Use transform instead of zoom to prevent overlap bugs */
            transform: scale(${printCols === '2' ? 0.95 : printCols === '3' ? 0.75 : 0.58}) !important;
            transform-origin: top center !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }

          /* Force exact colors for backgrounds and borders */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}} />

      <div className="hide-on-print">
        <h1 className="text-3xl font-bold tracking-tight mb-2">QR ID Cards</h1>
        <p className="text-muted-foreground">Generate and print professional ID cards with QR codes for students.</p>
      </div>

      <Card className="border-none shadow-md hide-on-print">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <div className="grid gap-2">
              <Label>Select Course</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCourse} 
                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBatch(""); }}
              >
                <option value="" disabled>-- Choose Course --</option>
                {courses.map(c => <option key={c.id} value={c.id.toString()}>{c.title}</option>)}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label>Select Batch</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedBatch} 
                onChange={(e) => setSelectedBatch(e.target.value)} 
                disabled={!selectedCourse}
              >
                <option value="" disabled>-- Choose Batch --</option>
                {filteredBatches.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Theme Color</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={themeColor} 
                onChange={(e) => setThemeColor(e.target.value as ThemeKey)}
              >
                <option value="classic">Classic (Teal & Orange)</option>
                <option value="blue">Blue</option>
                <option value="emerald">Emerald</option>
                <option value="violet">Violet</option>
                <option value="rose">Rose</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Print Side</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={printSide} 
                onChange={(e) => setPrintSide(e.target.value)}
              >
                <option value="both">Both Sides (Front & Back)</option>
                <option value="front">Front Side Only</option>
                <option value="back">Back Side Only</option>
              </select>
            </div>

            <Button onClick={handleGenerate} disabled={!selectedBatch || loading} className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between bg-muted/50 p-4 rounded-xl border hide-on-print gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{students.length} Students Loaded</h3>
                <p className="text-xs text-muted-foreground">{selectedStudents.length} selected for printing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 border-dashed hide-on-print"
                onClick={() => {
                  if (selectedStudents.length === students.length) {
                    setSelectedStudents([]);
                  } else {
                    setSelectedStudents(students.map(s => s.id));
                  }
                }}
              >
                {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
              </Button>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Layout:</Label>
                <select 
                  className="flex h-9 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={printCols} 
                  onChange={(e) => setPrintCols(e.target.value)}
                >
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns (Standard)</option>
                  <option value="4">4 Columns</option>
                </select>
              </div>
              <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700">
                <Printer className="w-4 h-4 mr-2" /> Print Cards
              </Button>
            </div>
          </div>

          <div className="print-area flex flex-wrap gap-6 justify-start">
            {students.map((student, i) => {
              const isSelected = selectedStudents.includes(student.id);
              return (
                <Fragment key={student.id}>
                  {(printSide === "front" || printSide === "both") && (
                    <div key={`front-${student.id}`} className="print-card-container">
                      {renderFront(student, isSelected)}
                    </div>
                  )}
                  {(printSide === "back" || printSide === "both") && (
                    <div key={`back-${student.id}`} className="print-card-container">
                      {renderBack(student, isSelected)}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

