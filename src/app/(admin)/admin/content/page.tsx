"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Megaphone, Layout, Settings, Image as ImageIcon, MoreHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
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
  const [activeTab, setActiveTab] = useState("hero");
  
  // Data States
  const [loading, setLoading] = useState(true);

  // Hero / Teacher Form states
  const [teacherName, setTeacherName] = useState("");
  const [teacherBio, setTeacherBio] = useState("");
  const [teacherQualifications, setTeacherQualifications] = useState("");
  const [teacherPhoto, setTeacherPhoto] = useState("");
  const [teacherVideoUrl, setTeacherVideoUrl] = useState("");
  const [teacherStats, setTeacherStats] = useState([
    { label: "সর্বমোট শিক্ষার্থী", value: "৫০০০+" },
    { label: "সাফল্যের হার", value: "৯৮%" }
  ]);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Payment Types states
  const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
  const [newPaymentType, setNewPaymentType] = useState("");
  const [isSubmittingType, setIsSubmittingType] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [heroRes, ptRes] = await Promise.all([
        fetch("/api/admin/content/hero"),
        fetch("/api/admin/settings/payment-types")
      ]);
      
      if (heroRes.ok) {
        const heroData = await heroRes.json();
        if (heroData) {
          setTeacherName(heroData.name || "");
          setTeacherBio(heroData.bio || "");
          setTeacherQualifications(heroData.qualifications || "");
          setTeacherPhoto(heroData.photo || "");
          setTeacherVideoUrl(heroData.video_url || "");
          if (heroData.stats) {
            try {
              const parsedStats = typeof heroData.stats === 'string' ? JSON.parse(heroData.stats) : heroData.stats;
              if (Array.isArray(parsedStats) && parsedStats.length > 0) {
                // Ensure we only keep 2 stats in admin UI as well, padding if necessary
                const displayStats = parsedStats.slice(0, 2);
                while (displayStats.length < 2) {
                  displayStats.push({ label: "", value: "" });
                }
                setTeacherStats(displayStats);
              }
            } catch(e) {}
          }
        }
      }
      if (ptRes.ok) setPaymentTypes(await ptRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/content/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherName,
          bio: teacherBio,
          qualifications: teacherQualifications,
          photo: teacherPhoto,
          video_url: teacherVideoUrl,
          stats: JSON.stringify(teacherStats)
        }),
      });
      if (res.ok) alert("Hero banner updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload file");
      
      setTeacherPhoto(uploadData.url);
    } catch (err: any) {
      alert(err.message || "An error occurred during upload");
    } finally {
      setIsUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleAddPaymentType = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingType(true);
    try {
      const res = await fetch("/api/admin/settings/payment-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPaymentType }),
      });
      if (res.ok) {
        setNewPaymentType("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add payment type");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingType(false);
    }
  };

  const handleDeletePaymentType = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment type?")) return;
    try {
      const res = await fetch(`/api/admin/settings/payment-types/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete payment type");
      }
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
          <button
            onClick={() => setActiveTab("payment-types")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === "payment-types" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="w-4 h-4 hidden sm:block" />
            Payment Types
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900/50 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
              {activeTab === "hero" && "Homepage Hero Section"}
              {activeTab === "site-settings" && "Site Configuration"}
              {activeTab === "gallery" && "Gallery"}
              {activeTab === "payment-types" && "Payment Types"}
            </CardTitle>
            <CardDescription className="mt-1">
              {activeTab === "hero" && "Update the main banner shown to public visitors."}
              {activeTab === "site-settings" && "Manage contact information, social links, and map location."}
              {activeTab === "gallery" && "Manage public gallery."}
              {activeTab === "payment-types" && "Manage payment types for financial transactions."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === "hero" && (
            <div className="p-6 max-w-2xl">
              
              <form onSubmit={handleHeroSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Teacher Name</Label>
                  <Input 
                    value={teacherName} 
                    onChange={(e) => setTeacherName(e.target.value)} 
                    placeholder="e.g. প্রভাষক মোঃ আব্দুল্লাহ" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qualifications</Label>
                  <Input 
                    value={teacherQualifications} 
                    onChange={(e) => setTeacherQualifications(e.target.value)} 
                    placeholder="e.g. বি.এ (সম্মান), এম.এ (বাংলা)" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bio / Description</Label>
                  <Textarea 
                    rows={4} 
                    value={teacherBio} 
                    onChange={(e) => setTeacherBio(e.target.value)} 
                    placeholder="e.g. বিগত ১০ বছর ধরে..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teacher Photo URL</Label>
                  <Input 
                    value={teacherPhoto} 
                    onChange={(e) => setTeacherPhoto(e.target.value)} 
                    placeholder="https://..." 
                  />
                  <div className="mt-2 flex items-center gap-4">
                    <Label className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
                      {isUploadingHero ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Upload Image"}
                      <input type="file" className="hidden" accept="image/*" onChange={handleHeroFileUpload} disabled={isUploadingHero} />
                    </Label>
                    {teacherPhoto && (
                      <div className="h-10 w-10 rounded-full overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={teacherPhoto} alt="Teacher" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Intro Video URL (YouTube Embed)</Label>
                  <Input 
                    value={teacherVideoUrl} 
                    onChange={(e) => setTeacherVideoUrl(e.target.value)} 
                    placeholder="https://www.youtube.com/embed/..." 
                  />
                </div>

                <div className="space-y-4 border p-4 rounded-md">
                  <Label className="font-semibold text-base">Stats (e.g. Total Students, Success Rate)</Label>
                  {teacherStats.map((stat, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Label</Label>
                        <Input 
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...teacherStats];
                            newStats[idx].label = e.target.value;
                            setTeacherStats(newStats);
                          }}
                          placeholder="e.g. সর্বমোট শিক্ষার্থী"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Value</Label>
                        <Input 
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...teacherStats];
                            newStats[idx].value = e.target.value;
                            setTeacherStats(newStats);
                          }}
                          placeholder="e.g. ৫০০০+"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t mt-6">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            
            </div>
          )}

          {activeTab === "site-settings" && (
            <div className="p-6">
              <SiteSettingsForm />
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="p-6">
              <GalleryManager />
            </div>
          )}

          {activeTab === "payment-types" && (
            <div className="p-6">
              <form onSubmit={handleAddPaymentType} className="flex gap-4 items-end max-w-lg mb-8">
                <div className="flex-1 space-y-2">
                  <Label>New Payment Type</Label>
                  <Input 
                    placeholder="e.g. Monthly Fee, Admission Fee" 
                    value={newPaymentType}
                    onChange={(e) => setNewPaymentType(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmittingType} className="bg-primary shadow-sm hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmittingType ? "Adding..." : "Add Type"}
                </Button>
              </form>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                      <TableHead>Type Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentTypes.map((pt) => (
                      <TableRow key={pt.id}>
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">{pt.name}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(pt.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeletePaymentType(pt.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paymentTypes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No payment types found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
