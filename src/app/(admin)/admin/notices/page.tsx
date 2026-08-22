"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pin, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Notice {
  id: number;
  title: string;
  content: string;
  target_type: string;
  target_id: number | null;
  type: string;
  is_pinned: boolean;
  created_at: string;
}

export default function NoticesAdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_type: "ALL",
    target_id: "",
    type: "আপডেট",
    is_pinned: false
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/admin/content/notices");
      if (res.ok) {
        setNotices(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/content/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({
          title: "",
          content: "",
          target_type: "ALL",
          target_id: "",
          type: "আপডেট",
          is_pinned: false
        });
        fetchNotices();
      } else {
        alert("Failed to add notice");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/admin/content/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6" data-aos="fade-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-aos="fade-down">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notice Board Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage notices and announcements shown to students.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Notice
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-x-auto" data-aos="fade-up" data-aos-delay="100">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Notice</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : notices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No notices found.
                </TableCell>
              </TableRow>
            ) : (
              notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-2">
                        {notice.title}
                        {notice.is_pinned && <Pin className="w-3 h-3 text-primary" />}
                      </span>
                      <span className="text-sm text-muted-foreground line-clamp-1">{notice.content}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {notice.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{notice.target_type}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Notice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notice Title</Label>
              <Input 
                id="title" 
                required 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. ফ্রি সেমিনার আগামী শুক্রবার"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Details</Label>
              <Textarea 
                id="content" 
                required 
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full notice description here..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Notice Tag / Type</Label>
                <Input 
                  id="type" 
                  required 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g. আপডেট, ভর্তি, সেমিনার"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_type">Target Audience</Label>
                <select 
                  id="target_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.target_type}
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                >
                  <option value="ALL">Everyone (Public)</option>
                  <option value="COURSE">Specific Course</option>
                  <option value="BATCH">Specific Batch</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="is_pinned" 
                checked={formData.is_pinned}
                onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked as boolean })}
              />
              <Label htmlFor="is_pinned" className="font-medium cursor-pointer">
                Pin this notice to the top
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish Notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
