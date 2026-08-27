"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
  Loader2,
  ListTodo,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Topic = {
  id: number;
  chapter_name: string;
  topic_name: string | null;
  sort_order: number;
};

type SessionNote = {
  id: number;
  title: string | null;
  body: string;
  file_url: string | null;
  created_at: string;
};

type Homework = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  created_at: string;
};

type CurriculumSessionDetails = {
  id: number;
  date: string;
  session_number: number | null;
  session_type: string;
  is_completed: boolean;
  exam_title: string | null;
  notes: string | null;
  curriculum: {
    title: string;
    course: { title: string };
  };
  topics: Topic[];
  sessionNotes: SessionNote[];
  homework: Homework[];
};

export default function StudentCurriculumSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<CurriculumSessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/student/curriculum/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load session details");
        return res.json();
      })
      .then((data) => setSession(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-muted-foreground">{error || "Session not found"}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {session.curriculum.course.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(session.date), "EEEE, d MMMM yyyy")}
            {session.session_number && ` • Class ${session.session_number}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Topics & Homework */}
        <div className="md:col-span-1 space-y-6">
          {/* Topics */}
          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              Topics Covered
            </h3>
            {session.topics.length > 0 ? (
              <ul className="space-y-3">
                {session.topics.map((t) => (
                  <li key={t.id} className="text-sm flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{t.chapter_name}</span>
                    {t.topic_name && <span className="text-muted-foreground">{t.topic_name}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specific topics listed.</p>
            )}
          </div>

          {/* Homework */}
          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <ListTodo className="w-5 h-5 text-amber-500" />
              Homework
            </h3>
            {session.homework.length > 0 ? (
              <div className="space-y-4">
                {session.homework.map((hw) => (
                  <div key={hw.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 text-sm">
                        {hw.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px] bg-background border-amber-500/30 text-amber-700 dark:text-amber-300">
                        Due: {format(new Date(hw.due_date), "MMM d")}
                      </Badge>
                    </div>
                    {hw.description && (
                      <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-2 whitespace-pre-wrap">
                        {hw.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No homework assigned for this class.</p>
            )}
          </div>
        </div>

        {/* Right Column: Teacher Notes */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl p-5 shadow-sm min-h-[300px]">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-500" />
              Teacher's Notes
            </h3>
            
            {session.sessionNotes.length > 0 ? (
              <div className="space-y-6">
                {session.sessionNotes.map((note) => (
                  <div key={note.id} className="bg-muted/30 rounded-xl p-4 border">
                    {note.title && (
                      <h4 className="font-bold text-base mb-2">{note.title}</h4>
                    )}
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {note.body}
                    </div>
                    {note.file_url && (
                      <a
                        href={note.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-xs font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                        Download Attachment
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p>No notes provided by the teacher for this class.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
