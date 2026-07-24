"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Note {
  id: number;
  title: string;
  type?: string;
  file_path: string;
  created_at: string;
}

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/materials/notes')
      .then(res => res.json())
      .then(notesData => {
        setNotes(Array.isArray(notesData) ? notesData : []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Study Materials</h1>
        <p className="text-muted-foreground">Access your PDF notes and books.</p>
      </div>
      
      <div className="w-full">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-200 mb-1">No notes available</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Your teachers haven&apos;t uploaded any PDF notes or books for your course yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <Card key={note.id} className="group overflow-hidden hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">{note.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {note.type || "General"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {note.created_at ? format(new Date(note.created_at), 'dd MMM yyyy') : "Unknown Date"}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <a href={note.file_path} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300")}>
                      <Eye className="w-4 h-4" /> View
                    </a>
                    <a href={note.file_path} download target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "default" }), "gap-2 px-4 shadow-sm hover:shadow-md transition-shadow")}>
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
