"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DraftSession,
  DraftTopic,
  PoolTopic,
  SyllabusPool,
  buildSyllabusPool,
  computeProgress,
  skipSession,
  unskipSession,
  insertClassDate,
  removeClassDate,
  moveTopic,
  continueTopic,
  removeTopic,
  clearTopics,
  autoFillFromBooks,
  addExamAtSession,
  addCustomTopic,
  addPoolTopicToNextClass,
  addPoolTopicToSession,
  markHoliday,
  teachOnHoliday,
  changeClassDays,
  moveTopicEarlier,
  moveTopicLater,
  shiftSessionEarlier,
  shiftSessionLater,
  clampSessionsToEndDate,
  normalizeLoadedSessions,
  duplicateSessionToNextRoutineDay,
  toDateKey,
} from "@/lib/curriculum-scheduler";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type CurriculumState = {
  id: number;
  title: string;
  status: string;
  is_public: boolean;
  class_days: string[];
  books: number[] | null;
  start_date: string;
  end_date: string;
  revision: number;
  course?: any;
  batch?: any;
  sessions: DraftSession[];
  exams?: any[];
  selectedBooks?: any[];
  pool?: SyllabusPool;
  progress?: ReturnType<typeof computeProgress>;
};

const MAX_UNDO = 20;

export function useCurriculumDraft(curriculumId: string) {
  const [curriculum, setCurriculum] = useState<CurriculumState | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const undoStack = useRef<DraftSession[][]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revisionRef = useRef(0);
  const sessionsRef = useRef<DraftSession[]>([]);
  const metaRef = useRef<any>(null);

  const classDays = curriculum?.class_days || [];
  const endDate = curriculum?.end_date
    ? toDateKey(curriculum.end_date)
    : undefined;

  const pool = useMemo(() => {
    if (!curriculum) return { all: [], remaining: [], assigned: [], total: 0 } as SyllabusPool;
    return buildSyllabusPool(curriculum.sessions, books);
  }, [curriculum, books]);

  const progress = useMemo(() => {
    if (!curriculum) return null;
    return computeProgress(curriculum.sessions, pool.total);
  }, [curriculum, pool.total]);

  const flushSave = useCallback(async () => {
    if (!curriculumId) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/admin/curriculum/${curriculumId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessions: sessionsRef.current,
          meta: metaRef.current,
          revision: revisionRef.current,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (typeof data.revision === "number") {
        revisionRef.current = data.revision;
        setCurriculum((prev) => (prev ? { ...prev, revision: data.revision } : prev));
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus("error");
    }
  }, [curriculumId]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      flushSave();
    }, 500);
  }, [flushSave]);

  const applySessions = useCallback(
    (updater: (sessions: DraftSession[]) => DraftSession[], pushUndo = true) => {
      setCurriculum((prev) => {
        if (!prev) return prev;
        if (pushUndo) {
          undoStack.current = [
            ...undoStack.current.slice(-(MAX_UNDO - 1)),
            prev.sessions,
          ];
        }
        const nextSessions = updater(prev.sessions);
        sessionsRef.current = nextSessions;
        metaRef.current = {
          title: prev.title,
          class_days: prev.class_days,
          books: prev.books,
          start_date: prev.start_date,
          end_date: prev.end_date,
          is_public: prev.is_public,
        };
        return { ...prev, sessions: nextSessions };
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setCurriculum((c) => {
      if (!c) return c;
      sessionsRef.current = prev;
      return { ...c, sessions: prev };
    });
    scheduleSave();
  }, [scheduleSave]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/curriculum/${curriculumId}`);
        if (res.status === 404) {
          setError("not_found");
          return;
        }
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (cancelled) return;

        const sessions = clampSessionsToEndDate(
          normalizeLoadedSessions(data.sessions || []),
          toDateKey(data.end_date),
          data.class_days || []
        );
        const selectedBooks = data.selectedBooks || [];
        revisionRef.current = data.revision || 0;
        sessionsRef.current = sessions;
        metaRef.current = {
          title: data.title,
          class_days: data.class_days,
          books: data.books,
          start_date: data.start_date,
          end_date: data.end_date,
          is_public: data.is_public,
        };

        setBooks(selectedBooks);
        setCurriculum({
          id: data.id,
          title: data.title,
          status: data.status,
          is_public: data.is_public,
          class_days: data.class_days || [],
          books: data.books,
          start_date: data.start_date,
          end_date: data.end_date,
          revision: data.revision || 0,
          course: data.course,
          batch: data.batch,
          sessions,
          exams: data.exams,
          selectedBooks,
        });

        // If we pruned past-end sessions, persist silently
        const rawLen = (data.sessions || []).length;
        if (sessions.length < rawLen && !cancelled) {
          setTimeout(() => {
            void flushSave();
          }, 600);
        }
      } catch (e) {
        console.error(e);
        setError("load_failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId]);

  const updateMeta = useCallback(
    (patch: Partial<CurriculumState>) => {
      setCurriculum((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        metaRef.current = {
          title: next.title,
          class_days: next.class_days,
          books: next.books,
          start_date: next.start_date,
          end_date: next.end_date,
          is_public: next.is_public,
        };
        return next;
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  const actions = useMemo(
    () => ({
      skip: (sessionId: number | string) =>
        applySessions((s) => skipSession(s, sessionId, classDays, endDate)),
      unskip: (sessionId: number | string) =>
        applySessions((s) => unskipSession(s, sessionId, classDays, endDate)),
      duplicateToNextRoutineDay: (sessionId: number | string) =>
        applySessions((s) => duplicateSessionToNextRoutineDay(s, sessionId, classDays, endDate)),
      insertDay: (sessionId: number | string, dateKey?: string) =>
        applySessions((s) => insertClassDate(s, sessionId, dateKey, endDate)),
      removeDay: (sessionId: number | string) =>
        applySessions((s) => removeClassDate(s, sessionId, classDays, endDate)),
      moveTopic: (
        topic: DraftTopic,
        destId: number | string,
        destIndex: number,
        sourceId?: number | string
      ) => applySessions((s) => moveTopic(s, topic, destId, destIndex, sourceId)),
      continueTopic: (sessionId: number | string, topicId: number | string) =>
        applySessions((s) => continueTopic(s, sessionId, topicId, classDays, endDate)),
      removeTopic: (sessionId: number | string, topicId: number | string) =>
        applySessions((s) => removeTopic(s, sessionId, topicId)),
      clear: () => applySessions((s) => clearTopics(s, classDays)),
      autoFill: () => applySessions((s) => autoFillFromBooks(s, books, classDays)),
      addExam: (sessionId: number | string, title: string) =>
        applySessions((s) => addExamAtSession(s, sessionId, title, classDays, endDate)),
      addCustomTopic: (
        sessionId: number | string,
        topic: Omit<DraftTopic, "id"> & { id?: number | string }
      ) => applySessions((s) => addCustomTopic(s, sessionId, topic)),
      addFromPool: (topic: PoolTopic, targetSessionId?: number | string) =>
        applySessions((s) =>
          targetSessionId
            ? addPoolTopicToSession(s, targetSessionId, topic)
            : addPoolTopicToNextClass(s, topic)
        ),
      markHoliday: (sessionId: number | string, name: string) =>
        applySessions((s) => markHoliday(s, sessionId, name, classDays, endDate)),
      teachOnHoliday: (sessionId: number | string) =>
        applySessions((s) => teachOnHoliday(s, sessionId)),
      moveTopicEarlier: (sessionId: number | string, topicId: number | string) =>
        applySessions((s) => moveTopicEarlier(s, sessionId, topicId, classDays, endDate)),
      moveTopicLater: (sessionId: number | string, topicId: number | string) =>
        applySessions((s) => moveTopicLater(s, sessionId, topicId, classDays, endDate)),
      shiftSessionEarlier: (sessionId: number | string) =>
        applySessions((s) => shiftSessionEarlier(s, sessionId, classDays, endDate)),
      shiftSessionLater: (sessionId: number | string) =>
        applySessions((s) => shiftSessionLater(s, sessionId, classDays, endDate)),
      changeClassDays: (days: string[], start: string, end: string) => {
        applySessions((s) =>
          changeClassDays(
            s,
            {
              start_date: start,
              end_date: end,
              class_days: days,
              holidays: new Map(
                s
                  .filter((x) => x.holiday_name && x.holiday_name !== "Skipped Class")
                  .map((x) => [x.date.slice(0, 10), x.holiday_name!])
              ),
            },
            books
          )
        );
        updateMeta({ class_days: days, start_date: start, end_date: end });
      },
      undo,
      updateMeta,
      flushSave,
    }),
    [applySessions, classDays, endDate, books, undo, updateMeta, flushSave]
  );

  const publish = useCallback(async () => {
    await flushSave();
    const res = await fetch(`/api/admin/curriculum/${curriculumId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions: sessionsRef.current }),
    });
    if (!res.ok) throw new Error("Publish failed");
    const data = await res.json();
    if (data.curriculum) {
      const sessions = normalizeLoadedSessions(data.curriculum.sessions || []);
      sessionsRef.current = sessions;
      revisionRef.current = data.curriculum.revision || revisionRef.current;
      setCurriculum((prev) =>
        prev
          ? {
              ...prev,
              status: "active",
              sessions,
              revision: data.curriculum.revision || prev.revision,
            }
          : prev
      );
    }
    return data;
  }, [curriculumId, flushSave]);

  return {
    curriculum,
    books,
    pool,
    progress,
    isLoading,
    error,
    saveStatus,
    canUndo: undoStack.current.length > 0,
    actions,
    publish,
  };
}
