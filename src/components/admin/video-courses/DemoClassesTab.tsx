"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Link as LinkIcon, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type DemoVideo = {
  id: number;
  section_title: string;
  video_url: string;
  video_title: string;
  thumbnail_url: string;
  is_active: boolean;
};

export function DemoClassesTab() {
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ section_title: "Demo Class", video_url: "" });
  const [sectionTitle, setSectionTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [videoRes, titleRes] = await Promise.all([
        fetch("/api/admin/demo-videos"),
        fetch("/api/admin/demo-videos/title")
      ]);
      if (videoRes.ok) {
        setDemoVideos(await videoRes.json());
      }
      if (titleRes.ok) {
        const tData = await titleRes.json();
        setSectionTitle(tData.title || "ফ্রি ডেমো ক্লাসসমূহ");
      }
    } catch (error) {
      console.error("Failed to fetch demo videos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this demo class?")) return;
    try {
      const res = await fetch(`/api/admin/demo-videos/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete demo video.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveTitle = async () => {
    setIsSavingTitle(true);
    try {
      const res = await fetch("/api/admin/demo-videos/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sectionTitle })
      });
      if (!res.ok) alert("Failed to save title");
    } catch (e) {
      console.error(e);
      alert("Error saving title");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/demo-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ section_title: "", video_url: "" });
        setIsDialogOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Demo Classes (YouTube)</h2>
          <p className="text-sm text-muted-foreground">Add YouTube links to show as demo classes on the homepage.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Demo Class
        </Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-end border">
        <div className="space-y-2 flex-1 w-full">
          <Label htmlFor="global_section_title">Public Section Title</Label>
          <Input 
            id="global_section_title" 
            value={sectionTitle} 
            onChange={e => setSectionTitle(e.target.value)} 
            placeholder="e.g. ফ্রি ডেমো ক্লাসসমূহ" 
          />
        </div>
        <Button 
          onClick={handleSaveTitle} 
          disabled={isSavingTitle}
          variant="secondary"
        >
          {isSavingTitle ? "Saving..." : "Save Title"}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-xl h-64"></div>
          ))}
        </div>
      ) : demoVideos.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-xl shadow-sm">
          <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No demo classes yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">Add a YouTube video to show on your public homepage.</p>
          <Button onClick={() => setIsDialogOpen(true)}>Add Demo Class</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoVideos.map((video) => (
            <div key={video.id} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-video relative bg-muted">
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md font-medium">
                  {video.section_title}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold line-clamp-2 mb-2" title={video.video_title}>{video.video_title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 mt-auto">
                  <LinkIcon className="h-3 w-3" />
                  <a href={video.video_url} target="_blank" rel="noreferrer" className="truncate hover:underline text-primary">
                    {video.video_url}
                  </a>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(video.id)} className="gap-2">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Demo Class</DialogTitle>
            <DialogDescription>Provide a section title and YouTube URL. We will automatically fetch the video details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">YouTube Video URL</Label>
              <Input
                id="video_url"
                required
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Demo Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
