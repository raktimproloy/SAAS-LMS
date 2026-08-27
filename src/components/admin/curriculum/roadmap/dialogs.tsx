"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddExamDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (title: string) => void;
}) {
  const [title, setTitle] = useState("অধ্যায় শেষ পরীক্ষা");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>পরীক্ষা যোগ করুন</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label>পরীক্ষার নাম</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
          <Button
            onClick={() => {
              if (!title.trim()) return;
              onConfirm(title.trim());
              onOpenChange(false);
            }}
          >
            পরীক্ষা যোগ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddTopicDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (data: { chapter_name: string; topic_name: string }) => void;
}) {
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>কাস্টম টপিক যোগ</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid gap-2">
            <Label>অধ্যায়</Label>
            <Input value={chapter} onChange={(e) => setChapter(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>টপিক (ঐচ্ছিক)</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
          <Button
            onClick={() => {
              if (!chapter.trim()) return;
              onConfirm({ chapter_name: chapter.trim(), topic_name: topic.trim() });
              setChapter("");
              setTopic("");
              onOpenChange(false);
            }}
          >
            টপিক যোগ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImpactPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            নিশ্চিত করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PublishConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  stats,
  isPublishing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  isPublishing?: boolean;
  stats: { classes: number; exams: number; holidays: number; skipped: number };
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>কারিকুলাম প্রকাশ</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-2 py-2">
          <p>পাবলিক থাকলে স্টুডেন্টরা এই রোডম্যাপ দেখতে পারবে। সারাংশ:</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>{stats.classes}টি ক্লাস</li>
            <li>{stats.exams}টি পরীক্ষা</li>
            <li>{stats.holidays}টি ছুটি</li>
            <li>{stats.skipped}টি স্কিপ করা দিন</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            বাতিল
          </Button>
          <Button onClick={onConfirm} disabled={isPublishing}>
            {isPublishing ? "প্রকাশ হচ্ছে…" : "এখনই প্রকাশ করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
