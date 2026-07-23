"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { FileText, Download, PlayCircle, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function StudentNotesPage() {
  const [activeTab, setActiveTab] = useState<"notes" | "videos">("notes");
  const [notes, setNotes] = useState<{ id: number; title: string; subject?: string; file_url: string }[]>([]);
  const [videos, setVideos] = useState<{ id: number; title: string; description: string; thumbnail_url: string; video_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/student/materials/notes').then(res => res.json()),
      fetch('/api/student/materials/videos').then(res => res.json())
    ]).then(([notesData, videosData]) => {
      setNotes(Array.isArray(notesData) ? notesData : []);
      setVideos(Array.isArray(videosData) ? videosData : []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-10 w-full animate-in fade-in duration-500">
      
      {/* Header & Tabs Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Study Materials</h1>
          <p className="text-muted-foreground">Access your PDF notes, books, and recorded video classes.</p>
        </div>
        
        {/* Custom Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-sm w-full md:w-auto h-12">
          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "notes" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            PDF Notes
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === "videos" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PlayCircle className="w-4 h-4" />
            Video Classes
          </button>
        </div>
      </div>
      
      {activeTab === "notes" && (
        <div className="w-full">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-200 mb-1">No notes available</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                Your teachers haven't uploaded any PDF notes or books for your course yet. Check back later!
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
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
                      {note.subject || "General"}
                    </div>
                    
                    <div className="flex gap-3">
                      <a href={note.file_url} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300")}>
                        <Eye className="w-4 h-4" /> View
                      </a>
                      <a href={note.file_url} download target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "default" }), "gap-2 px-4 shadow-sm hover:shadow-md transition-shadow")}>
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "videos" && (
        <div className="w-full">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <PlayCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-200 mb-1">No video classes</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                There are no recorded video classes uploaded for your course at this moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => (
                <Card key={video.id} className="overflow-hidden hover:shadow-xl dark:hover:shadow-primary/5 transition-all duration-300 flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 group">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                        <PlayCircle className="w-12 h-12 opacity-30" />
                      </div>
                    )}
                    <a href={video.video_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-md">
                        <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                      </div>
                      <span className="text-white font-medium text-sm drop-shadow-md">Watch Class</span>
                    </a>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">{video.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-auto">{video.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
