"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface Notice {
  id: number;
  title: string;
  content: string;
  target_type: string;
  type: string;
  is_pinned: boolean;
  created_at: string;
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("notices");
  
  // Data States
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  // Notice Form states
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeTarget, setNoticeTarget] = useState("all");
  const [noticeType, setNoticeType] = useState("general");
  const [isPinned, setIsPinned] = useState(false);

  // Hero Form states
  const [heroDesc, setHeroDesc] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroCtaLink, setHeroCtaLink] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notRes, heroRes] = await Promise.all([
        fetch("/api/admin/content/notices"),
        fetch("/api/admin/content/hero")
      ]);
      
      if (notRes.ok) setNotices(await notRes.json());
      if (heroRes.ok) {
        const heroData = await heroRes.json();
        if (heroData) {
          setHeroDesc(heroData.description || "");
          setHeroCtaText(heroData.cta_text || "");
          setHeroCtaLink(heroData.cta_link || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/content/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          target_type: noticeTarget,
          type: noticeType,
          is_pinned: isPinned
        }),
      });
      if (res.ok) {
        setIsNoticeDialogOpen(false);
        setNoticeTitle("");
        setNoticeContent("");
        setIsPinned(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/content/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: heroDesc,
          cta_text: heroCtaText,
          cta_link: heroCtaLink
        }),
      });
      if (res.ok) alert("Hero banner updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Content</h1>
          <p className="text-muted-foreground mt-1">Manage notices, banners, and public pages.</p>
        </div>

        {activeTab === "notices" && (
          <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
            {/* @ts-expect-error - Radix UI type mismatch for asChild */}
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Publish Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNoticeSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea rows={4} value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={noticeTarget} 
                      onChange={(e) => setNoticeTarget(e.target.value)}
                    >
                      <option value="all">Everyone (Public)</option>
                      <option value="segment">Specific Segment</option>
                      <option value="batch">Specific Batch</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notice Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={noticeType} 
                      onChange={(e) => setNoticeType(e.target.value)}
                    >
                      <option value="general">General Info</option>
                      <option value="exam">Exam Alert</option>
                      <option value="result">Result Publication</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} id="pin" />
                  <Label htmlFor="pin">Pin this notice to top</Label>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit">Publish Notice</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 max-w-[400px]">
          <TabsTrigger value="notices">Notice Board</TabsTrigger>
          <TabsTrigger value="hero">Hero Banner</TabsTrigger>
          <TabsTrigger value="gallery">Gallery (WIP)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notices">
          <Card className="border-none shadow-sm dark:bg-slate-800/50">
            <CardHeader>
              <CardTitle>All Notices</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading notices...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notices.map((notice) => (
                        <TableRow key={notice.id}>
                          <TableCell className="font-medium">
                            {notice.is_pinned && <Badge className="mr-2" variant="destructive">Pinned</Badge>}
                            {notice.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{notice.type}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{notice.target_type}</TableCell>
                          <TableCell>{new Date(notice.created_at).toLocaleDateString()}</TableCell>
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
                      {notices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No notices found.
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

        <TabsContent value="hero">
          <Card className="border-none shadow-sm dark:bg-slate-800/50 max-w-2xl">
            <CardHeader>
              <CardTitle>Homepage Hero Section</CardTitle>
              <CardDescription>Update the main banner shown to public visitors.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleHeroSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Main Description Text</Label>
                  <Textarea 
                    rows={4} 
                    value={heroDesc} 
                    onChange={(e) => setHeroDesc(e.target.value)} 
                    placeholder="e.g. Join the best biology coaching in Bangladesh..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input 
                      value={heroCtaText} 
                      onChange={(e) => setHeroCtaText(e.target.value)} 
                      placeholder="e.g. Enroll Now" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Link</Label>
                    <Input 
                      value={heroCtaLink} 
                      onChange={(e) => setHeroCtaLink(e.target.value)} 
                      placeholder="e.g. /register" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t mt-6">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card className="border-none shadow-sm dark:bg-slate-800/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              Gallery management will be implemented in a future update.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
