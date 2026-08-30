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
import { DateRangePicker } from "@/components/ui/date-range-picker";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAY_BN: Record<string, string> = {
  Sunday: "রবি",
  Monday: "সোম",
  Tuesday: "মঙ্গল",
  Wednesday: "বুধ",
  Thursday: "বৃহঃ",
  Friday: "শুক্র",
  Saturday: "শনি",
};

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
          <DialogTitle>কারিকুলাম সেটিংস</DialogTitle>
          <DialogDescription>নাম, তারিখ, ক্লাসের দিন আর দৃশ্যমানতা আপডেট করুন।</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label>নাম</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>শুরু এবং শেষ তারিখ</Label>
            <DateRangePicker
              startDate={start}
              endDate={end}
              onStartDateChange={setStart}
              onEndDateChange={setEnd}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>ক্লাসের দিন</Label>
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
                    {DAY_BN[d] || d.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {daysChanged && (
            <label className="flex items-start gap-2 text-sm border rounded-md p-3 bg-amber-50/50 dark:bg-amber-950/20">
              <Checkbox checked={remap} onCheckedChange={(c) => setRemap(!!c)} />
              <span>
                নতুন ক্লাসের দিন অনুযায়ী সময়সূচি আবার সাজান (টপিকের ক্রম থাকবে, তারিখ নতুন হবে)।
              </span>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isPublic} onCheckedChange={(c) => setIsPublic(!!c)} />
            প্রকাশের পর স্টুডেন্টরা দেখতে পারবে
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            বাতিল
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
            সেভ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
