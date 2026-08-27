"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ClipboardList, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { dateKeyLocal } from "@/lib/curriculum-class-status";

type SessionLite = {
  id: number;
  date: string;
  session_number: number;
  session_type: string;
  is_cancelled?: boolean;
};

type Homework = {
  id: number;
  session_id: number;
  title: string;
  description: string | null;
  due_date: string;
};

type Props = {
  curriculumId: number;
  batchId: number;
  session: SessionLite;
  allSessions: SessionLite[];
};

function toDateKey(d: string) {
  try {
    return dateKeyLocal(d.includes("T") ? d : `${d}T00:00:00`);
  } catch {
    return d.slice(0, 10);
  }
}

export function ClassHomeworkBlock({
  curriculumId,
  batchId,
  session,
  allSessions,
}: Props) {
  const { toast } = useToast();
  const [list, setList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueSessionId, setDueSessionId] = useState<string>("");

  const sessionKey = toDateKey(session.date);

  const dueOptions = useMemo(() => {
    return allSessions
      .filter(
        (s) =>
          !s.is_cancelled &&
          (s.session_type === "class" || s.session_type === "exam") &&
          toDateKey(s.date) > sessionKey
      )
      .slice(0, 10);
  }, [allSessions, sessionKey]);

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/curriculum/${curriculumId}/homework`);
      if (!res.ok) throw new Error("fail");
      const data: Homework[] = await res.json();
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId]);

  useEffect(() => {
    if (dueOptions.length && !dueSessionId) {
      setDueSessionId(String(dueOptions[0].id));
    }
  }, [dueOptions, dueSessionId]);

  const assignedHere = list.filter((h) => h.session_id === session.id);
  const dueToday = list.filter((h) => toDateKey(h.due_date) === sessionKey);

  const submit = async () => {
    if (!title.trim() || !dueSessionId) {
      toast({
        title: "অসম্পূর্ণ",
        description: "শিরোনাম ও জমা দেওয়ার ক্লাস দরকার।",
        variant: "destructive",
      });
      return;
    }
    const due = dueOptions.find((s) => s.id === parseInt(dueSessionId, 10));
    if (!due) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/curriculum/${curriculumId}/homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          batch_id: batchId,
          title: title.trim(),
          description: description.trim() || null,
          due_date: toDateKey(due.date),
        }),
      });
      if (!res.ok) throw new Error("fail");
      toast({ title: "সফল", description: "হোমওয়ার্ক যোগ হয়েছে।" });
      setTitle("");
      setDescription("");
      setOpen(false);
      await load();
    } catch {
      toast({ title: "সমস্যা", description: "হোমওয়ার্ক সেভ হয়নি।", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-none shadow-sm dark:bg-slate-800/50">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            হোমওয়ার্ক
          </CardTitle>
          {session.session_type === "exam" && (
            <p className="text-xs text-blue-600 mt-1">
              আজ পরীক্ষা — প্রয়োজন হলে আগে থেকে হোমওয়ার্ক/রিভিউ দিন।
            </p>
          )}
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setOpen((v) => !v)}>
          <Plus className="w-4 h-4" />
          হোমওয়ার্ক দিন
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে…
          </div>
        ) : (
          <>
            {dueToday.length > 0 && (
              <div className="rounded-lg border border-amber-300/60 bg-amber-50/80 dark:bg-amber-950/30 p-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                  আজ জমা দেওয়ার
                </p>
                {dueToday.map((h) => (
                  <div key={h.id} className="text-sm">
                    <p className="font-medium">{h.title}</p>
                    {h.description && (
                      <p className="text-muted-foreground text-xs mt-0.5">{h.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">এই ক্লাসে দেওয়া</p>
              {assignedHere.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">এখনো কোনো হোমওয়ার্ক নেই।</p>
              ) : (
                assignedHere.map((h) => (
                  <div key={h.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{h.title}</p>
                    {h.description && (
                      <p className="text-muted-foreground text-xs mt-1">{h.description}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      জমা: {format(parseISO(toDateKey(h.due_date) + "T00:00:00"), "d MMM yyyy")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {open && (
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="hw-title">শিরোনাম</Label>
              <Input
                id="hw-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: অধ্যায় ৩ অনুশীলনী"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hw-desc">বিবরণ</Label>
              <Textarea
                id="hw-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ঐচ্ছিক নির্দেশনা…"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hw-due">জমা দেওয়ার ক্লাস</Label>
              <select
                id="hw-due"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={dueSessionId}
                onChange={(e) => setDueSessionId(e.target.value)}
              >
                {dueOptions.length === 0 ? (
                  <option value="">পরের ক্লাস নেই</option>
                ) : (
                  dueOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      ক্লাস {s.session_number} ·{" "}
                      {format(parseISO(toDateKey(s.date) + "T00:00:00"), "EEE, d MMM")}
                      {s.session_type === "exam" ? " (পরীক্ষা)" : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1 h-11" disabled={saving || !dueOptions.length} onClick={submit}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "সেভ করুন"}
              </Button>
              <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>
                বাতিল
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
