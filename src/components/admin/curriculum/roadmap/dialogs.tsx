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
  const [title, setTitle] = useState("Chapter Final Exam");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exam</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label>Exam title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!title.trim()) return;
              onConfirm(title.trim());
              onOpenChange(false);
            }}
          >
            Add Exam
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
          <DialogTitle>Add Custom Topic</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid gap-2">
            <Label>Chapter</Label>
            <Input value={chapter} onChange={(e) => setChapter(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Topic (optional)</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
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
            Add Topic
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
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm
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
          <DialogTitle>Publish Curriculum</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-2 py-2">
          <p>Students (if public) will see this roadmap. Summary:</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>{stats.classes} class sessions</li>
            <li>{stats.exams} exams</li>
            <li>{stats.holidays} holidays</li>
            <li>{stats.skipped} skipped days</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPublishing}>
            {isPublishing ? "Publishing…" : "Publish Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
