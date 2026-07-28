"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Megaphone, Layout, Settings, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GalleryManager } from "@/components/admin/GalleryManager";
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
    <div className="flex flex-col gap-8 pb-10">
      {/* Header & Tabs Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Website Content</h1>
          <p className="text-muted-foreground">Manage notices, banners, and public pages.</p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-xl w-full flex-wrap md:flex-nowrap gap-1 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("notices")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "notices" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Megaphone className="w-4 h-4 hidden sm:block" />
            Notices
          </button>
          <button
            onClick={() => setActiveTab("hero")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "hero" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layout className="w-4 h-4 hidden sm:block" />
            Hero Banner
          </button>
          <button
            onClick={() => setActiveTab("site-settings")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "site-settings" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="w-4 h-4 hidden sm:block" />
            Site Config
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "gallery" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ImageIcon className="w-4 h-4 hidden sm:block" />
            Gallery
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900/50">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
              {activeTab === "notices" && "All Notices"}
              {activeTab === "hero" && "Homepage Hero Section"}
              {activeTab === "site-settings" && "Site Configuration"}
              {activeTab === "gallery" && "Gallery"}
            </CardTitle>
            <CardDescription className="mt-1">
              {activeTab === "notices" && "Manage your notice board."}
              {activeTab === "hero" && "Update the main banner shown to public visitors."}
              {activeTab === "site-settings" && "Manage contact information, social links, and map location."}
              {activeTab === "gallery" && "Manage public gallery."}
            </CardDescription>
          </div>
          
          {activeTab === "notices" && (
            <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
            {/* @ts-expect-error - Radix UI type mismatch for asChild */}
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
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
        </CardHeader>

        <CardContent className="p-0">
          {activeTab === "notices" && (
            <div className="p-6">
              
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
            
            </div>
          )}

          {activeTab === "hero" && (
            <div className="p-6 max-w-2xl">
              
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
            
            </div>
          )}

          {activeTab === "site-settings" && (
            <div className="p-6">
              
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Site settings UI only! API not connected yet."); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2 border-border/50 text-primary">Contact Information</h3>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input placeholder="+880 1XXXXXXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="info@doctorbiology.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <Input placeholder="8801XXXXXXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Physical Address</Label>
                      <Textarea placeholder="Farmgate, Dhaka, Bangladesh" rows={3} />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2 border-border/50 text-primary">Social Media Links</h3>
                    <div className="space-y-2">
                      <Label>Facebook Page URL</Label>
                      <Input placeholder="https://facebook.com/doctorbiology" />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube Channel URL</Label>
                      <Input placeholder="https://youtube.com/@doctorbiology" />
                    </div>
                  </div>

                  {/* Map Config */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-semibold text-lg border-b pb-2 border-border/50 text-primary">Google Map Integration</h3>
                    <div className="space-y-2">
                      <Label>Google Maps Embed URL (src attribute)</Label>
                      <Textarea 
                        placeholder="https://www.google.com/maps/embed?pb=..." 
                        rows={3} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Go to Google Maps, click Share &gt; Embed a map, and copy the link inside the <code>src="..."</code> attribute.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-6 flex justify-end">
                  <Button type="submit">Save Configuration</Button>
                </div>
              </form>
            
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="p-6">
              <GalleryManager />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
