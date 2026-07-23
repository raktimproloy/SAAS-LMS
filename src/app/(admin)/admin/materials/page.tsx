"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, FileText, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface Segment {
  id: number;
  name: string;
}

interface Batch {
  id: number;
  name: string;
  segment: Segment;
}

interface NoteMaterial {
  id: number;
  title: string;
  type: string;
  file_path: string;
  created_at: string;
  batch?: Batch;
  segment?: Segment;
}

interface VideoCourse {
  id: number;
  title: string;
  url: string;
  price: number;
  status: string;
  created_at: string;
  segment: Segment;
}

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState("notes");
  
  // Data States
  const [notes, setNotes] = useState<NoteMaterial[]>([]);
  const [videos, setVideos] = useState<VideoCourse[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Note Form states
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [noteFileUrl, setNoteFileUrl] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteBatchId, setNoteBatchId] = useState("");

  // Video Form states
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPrice, setVideoPrice] = useState("0");
  const [videoSegmentId, setVideoSegmentId] = useState("");
  const [videoDesc, setVideoDesc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notRes, vidRes, segRes, batRes] = await Promise.all([
        fetch("/api/admin/materials/notes"),
        fetch("/api/admin/materials/videos"),
        fetch("/api/admin/segments"),
        fetch("/api/admin/batches")
      ]);
      
      if (notRes.ok) setNotes(await notRes.json());
      if (vidRes.ok) setVideos(await vidRes.json());
      if (segRes.ok) setSegments(await segRes.json());
      if (batRes.ok) setBatches(await batRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/materials/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          type: noteType,
          file_path: noteFileUrl,
          description: noteDesc,
          batch_id: noteBatchId || null
        }),
      });
      if (res.ok) {
        setIsNoteDialogOpen(false);
        setNoteTitle("");
        setNoteFileUrl("");
        setNoteDesc("");
        setNoteBatchId("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/materials/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoTitle,
          url: videoUrl,
          price: videoPrice,
          segment_id: videoSegmentId,
          description: videoDesc
        }),
      });
      if (res.ok) {
        setIsVideoDialogOpen(false);
        setVideoTitle("");
        setVideoUrl("");
        setVideoPrice("0");
        setVideoSegmentId("");
        setVideoDesc("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials & Video Courses</h1>
          <p className="text-muted-foreground mt-1">Upload PDFs, Lecture Notes, and Premium Video Courses.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-[400px]">
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" /> PDF & Notes
          </TabsTrigger>
          <TabsTrigger value="videos">
            <PlayCircle className="h-4 w-4 mr-2" /> Video Courses
          </TabsTrigger>
        </TabsList>
        
        {/* NOTES TAB */}
        <TabsContent value="notes">
          <Card className="border-none shadow-sm dark:bg-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Uploaded Study Materials</CardTitle>
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                {/* @ts-expect-error - Radix UI type mismatch for asChild */}
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Upload PDF / Note</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleNoteSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Material Type</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={noteType} 
                          onChange={(e) => setNoteType(e.target.value)}
                        >
                          <option value="note">Lecture Note</option>
                          <option value="book">Book / Manual</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Batch (Optional)</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={noteBatchId} 
                          onChange={(e) => setNoteBatchId(e.target.value)}
                        >
                          <option value="">Public (Everyone)</option>
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.segment?.name})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>File URL (Google Drive / Direct Link)</Label>
                      <Input type="url" value={noteFileUrl} onChange={(e) => setNoteFileUrl(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea rows={2} value={noteDesc} onChange={(e) => setNoteDesc(e.target.value)} />
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t">
                      <Button type="submit">Publish Material</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground mt-4">Loading materials...</p>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell className="font-medium">{note.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{note.type.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>
                            {note.batch ? `${note.batch.name}` : "Public"}
                          </TableCell>
                          <TableCell>
                            <a href={note.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              View File
                            </a>
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {notes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No study materials found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIDEOS TAB */}
        <TabsContent value="videos">
          <Card className="border-none shadow-sm dark:bg-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Premium Video Courses</CardTitle>
              <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                {/* @ts-expect-error - Radix UI type mismatch for asChild */}
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Video Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add Video Course</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleVideoSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Course Title</Label>
                      <Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target Segment</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={videoSegmentId} 
                          onChange={(e) => setVideoSegmentId(e.target.value)}
                          required
                        >
                          <option value="">Select Segment...</option>
                          {segments.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Price (৳)</Label>
                        <Input type="number" step="0.01" value={videoPrice} onChange={(e) => setVideoPrice(e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Video URL (YouTube/Vimeo)</Label>
                      <Input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea rows={2} value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} />
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t">
                      <Button type="submit">Publish Video</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground mt-4">Loading videos...</p>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell className="font-medium">{video.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{video.segment?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            {video.price > 0 ? `৳ ${video.price}` : <Badge>Free</Badge>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={video.status === "active" ? "default" : "secondary"}>
                              {video.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {videos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No video courses found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
