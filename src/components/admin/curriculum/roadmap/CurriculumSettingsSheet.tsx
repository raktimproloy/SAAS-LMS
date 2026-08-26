"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  curriculum: any;
  onSave: (patch: {
    title: string;
    start_date: string;
    end_date: string;
    class_days: string[];
    is_public: boolean;
    remapDays?: boolean;
  }) => void;
};

export function CurriculumSettingsSheet({ open, onOpenChange, curriculum, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [remap, setRemap] = useState(false);

  useEffect(() => {
    if (!curriculum || !open) return;
    setTitle(curriculum.title || "");
    setStart(String(curriculum.start_date).slice(0, 10));
    setEnd(String(curriculum.end_date).slice(0, 10));
    setDays(curriculum.class_days || []);
    setIsPublic(!!curriculum.is_public);
    setRemap(false);
  }, [curriculum, open]);

  const daysChanged =
    JSON.stringify([...(curriculum?.class_days || [])].sort()) !==
    JSON.stringify([...days].sort());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Curriculum Settings</DialogTitle>
          <DialogDescription>Update title, dates, class days, and visibility.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Start</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>End</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Class Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const active = days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setDays((prev) =>
                        prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-xs border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {daysChanged && (
            <label className="flex items-start gap-2 text-sm border rounded-md p-3 bg-amber-50/50 dark:bg-amber-950/20">
              <Checkbox checked={remap} onCheckedChange={(c) => setRemap(!!c)} />
              <span>
                Remap schedule to new class days (keeps topic order, regenerates dates).
              </span>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isPublic} onCheckedChange={(c) => setIsPublic(!!c)} />
            Visible to students when published
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({
                title,
                start_date: start,
                end_date: end,
                class_days: days,
                is_public: isPublic,
                remapDays: remap && daysChanged,
              });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
