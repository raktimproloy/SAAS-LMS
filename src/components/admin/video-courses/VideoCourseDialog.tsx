"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type VideoCourse = {
  id: number;
  course_id?: number | string;
  batch_id?: number | string | null;
  title: string;
  description?: string;
  url: string;
  price?: number | string;
  is_free?: boolean;
  is_public?: boolean;
  tags?: unknown;
  thumbnail?: string;
};

interface VideoCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoCourse?: VideoCourse;
  courses: { id: number; title: string }[];
  batches: { id: number; name: string; course_id: number }[];
  onSaved: () => void;
}

export function VideoCourseDialog({
  open,
  onOpenChange,
  videoCourse,
  courses,
  batches,
  onSaved,
}: VideoCourseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    price: "",
    is_free: false,
    is_public: true,
    thumbnail: "",
    course_id: "",
    batch_id: "",
    tags: "",
  });

  useEffect(() => {
    if (videoCourse) {
      setFormData({
        title: videoCourse.title || "",
        description: videoCourse.description || "",
        url: videoCourse.url || "",
        price: videoCourse.price ? videoCourse.price.toString() : "",
        is_free: videoCourse.is_free || false,
        is_public: videoCourse.is_public ?? true,
        thumbnail: videoCourse.thumbnail || "",
        course_id: videoCourse.course_id ? videoCourse.course_id.toString() : "",
        batch_id: videoCourse.batch_id ? videoCourse.batch_id.toString() : "",
        tags: videoCourse.tags ? (Array.isArray(videoCourse.tags) ? videoCourse.tags.join(", ") : (typeof videoCourse.tags === 'string' ? videoCourse.tags : JSON.stringify(videoCourse.tags))) : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        url: "",
        price: "",
        is_free: false,
        is_public: true,
        thumbnail: "",
        course_id: "",
        batch_id: "",
        tags: "",
      });
    }
  }, [videoCourse, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags ? JSON.stringify(formData.tags.split(",").map(t => t.trim()).filter(Boolean)) : null,
      };

      const res = await fetch(
        videoCourse ? `/api/admin/video-courses/${videoCourse.id}` : "/api/admin/video-courses",
        {
          method: videoCourse ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        onSaved();
        onOpenChange(false);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the video course.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = formData.course_id
    ? batches.filter((b) => b.course_id === parseInt(formData.course_id))
    : batches;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    setUploadingImage(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        const json = await res.json();
        setFormData({ ...formData, thumbnail: json.url });
      } else {
        alert("Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>{videoCourse ? "Edit Video Course" : "Add Video Course"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Course *</Label>
              <select
                required
                value={formData.course_id}
                onChange={(e) => {
                  setFormData({ ...formData, course_id: e.target.value, batch_id: "" });
                }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Batch (Optional)</Label>
              <select
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">No specific batch</option>
                {filteredBatches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Introduction to Biology"
              />
            </div>
            <div className="space-y-2">
              <Label>Video URL *</Label>
              <Input
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="YouTube or external link"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Thumbnail Image (Optional)</Label>
              <div className="flex flex-col gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                  />
                  <p className="text-xs text-muted-foreground">
                    {uploadingImage ? "Uploading..." : "Upload an image, or paste an external URL."}
                  </p>
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="Or paste an image URL here"
                  />
                </div>
                {formData.thumbnail && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="space-y-2 w-full sm:w-1/3">
                  <Label>Price (if paid)</Label>
                  <Input
                    type="number"
                    disabled={formData.is_free}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 500"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_free"
                      checked={formData.is_free}
                      onCheckedChange={(c) => setFormData({ ...formData, is_free: !!c })}
                    />
                    <Label htmlFor="is_free" className="whitespace-nowrap">Is this course free?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_public"
                      checked={formData.is_public}
                      onCheckedChange={(c) => setFormData({ ...formData, is_public: !!c })}
                    />
                    <Label htmlFor="is_public" className="whitespace-nowrap">Make public?</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="biology, class 10 (comma separated)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Details about the video course..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Video Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
