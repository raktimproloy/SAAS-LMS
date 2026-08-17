"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Eye, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      <div className="flex flex-col gap-8 pb-10 w-full max-w-[1920px] mx-auto">
        {/* Header Banner Skeleton */}
        <div className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-border mb-2 w-full h-[220px]">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
            <Skeleton className="h-10 w-64 md:w-80 bg-muted rounded-xl" />
          </div>
          <Skeleton className="h-6 w-full max-w-lg bg-muted/50 rounded-md" />
        </div>

        {/* Notes Grid Skeleton */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card border-border rounded-xl overflow-hidden border shadow-sm p-6 flex flex-col h-[240px]">
                <Skeleton className="w-12 h-12 rounded-2xl bg-muted mb-5 shrink-0" />
                <Skeleton className="h-6 w-3/4 bg-muted rounded-md mb-2" />
                <div className="flex items-center gap-2 mb-6 mt-auto">
                  <Skeleton className="h-5 w-16 bg-muted/50 rounded-full" />
                  <Skeleton className="h-4 w-24 bg-muted/50 rounded-md" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 flex-1 bg-muted rounded-md" />
                  <Skeleton className="h-10 w-12 bg-muted rounded-md shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 w-full max-w-[1920px] mx-auto">
      
      {/* Header Banner */}
      <div 
        className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center items-start border border-border mb-2 w-full"
        data-aos="fade-down"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform-gpu pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />
          <div className="absolute bottom-0 right-10 opacity-[0.03]">
            <FileText className="w-40 h-40" />
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4 text-foreground">
            <div className="p-3 bg-background/50 backdrop-blur-md rounded-2xl border border-border shadow-sm">
              <FileText className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            </div>
            Study Materials
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mt-4 font-medium">
            Access your PDF notes, books, and class materials securely.
          </p>
        </div>
      </div>
      
      <div className="w-full">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-muted/30 border border-border border-dashed rounded-2xl">
            <div className="bg-muted p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">No notes available</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Your teachers haven&apos;t uploaded any PDF notes or books for your course yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {notes.map(note => {
              let isGallery = false;
              let imageUrls: string[] = [];
              try {
                if (note.file_path.startsWith('[')) {
                  const parsed = JSON.parse(note.file_path);
                  if (Array.isArray(parsed)) {
                    isGallery = true;
                    imageUrls = parsed;
                  }
                }
              } catch { }

              return (
              <Card key={note.id} className="group overflow-hidden hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 border-border bg-card" data-aos="fade-up">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                  
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
                    {isGallery ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  
                  <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{note.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {note.type || "General"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {note.created_at ? format(new Date(note.created_at), 'dd MMM yyyy') : "Unknown Date"}
                    </div>
                  </div>
                  
                  {isGallery ? (
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2 border-border hover:bg-muted text-foreground"
                        onClick={() => {
                          setGalleryImages(imageUrls);
                          setCurrentImageIndex(0);
                        }}
                      >
                        <Eye className="w-4 h-4" /> View Gallery ({imageUrls.length})
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <a href={note.file_path} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2 border-border hover:bg-muted text-foreground")}>
                        <Eye className="w-4 h-4" /> View
                      </a>
                      <a href={`/api/download?url=${encodeURIComponent(note.file_path)}`} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "default" }), "gap-2 px-4 shadow-sm hover:shadow-md transition-shadow")}>
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </div>

      {galleryImages && (
        <Dialog open={!!galleryImages} onOpenChange={(open) => {
          if (!open) {
            setGalleryImages(null);
            setCurrentImageIndex(0);
          }
        }}>
          <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[95vh] h-[95vh] flex flex-col p-0 bg-black/95 border-none overflow-hidden">
            <DialogHeader className="p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-50 pointer-events-none">
              <DialogTitle className="text-foreground text-center drop-shadow-md">
                Image Gallery ({currentImageIndex + 1} of {galleryImages.length})
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex items-center justify-center relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={galleryImages[currentImageIndex]} 
                alt={`Gallery view ${currentImageIndex + 1}`} 
                className="max-w-full max-h-[95vh] object-contain select-none" 
              />
              
              {galleryImages.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-foreground p-3 rounded-full z-50 backdrop-blur-sm transition-all shadow-lg"
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-foreground p-3 rounded-full z-50 backdrop-blur-sm transition-all shadow-lg"
                    onClick={() => setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
