/** Shared types for the curriculum scheduling engine (client + server). */

export type SessionType = "class" | "exam" | "holiday" | "skipped";

export type DraftTopic = {
  id: number | string;
  nctb_book_id?: number | null;
  subject?: string | null;
  chapter_name: string;
  topic_name?: string | null;
  size?: number;
  sort_order?: number;
  is_custom?: boolean;
};

export type DraftSession = {
  id: number | string;
  date: string; // ISO or yyyy-MM-dd
  session_number: number;
  session_type: SessionType;
  is_holiday: boolean;
  holiday_name: string | null;
  is_exam?: boolean;
  exam_title?: string | null;
  is_cancelled?: boolean;
  is_completed?: boolean;
  extra_days?: number;
  notes?: string | null;
  topics: DraftTopic[];
};

export type PoolTopic = {
  key: string;
  nctb_book_id: number;
  subject: string;
  chapter_name: string;
  topic_name: string | null;
  size: number;
  book_label?: string;
};

export type SyllabusPool = {
  all: PoolTopic[];
  remaining: PoolTopic[];
  assigned: PoolTopic[];
  total: number;
};

export type BookChapter = {
  name?: string;
  title?: string;
  size?: number;
  topics?: Array<{ name?: string; title?: string; size?: number } | string>;
};

export type NctbBookLike = {
  id: number;
  subject: string;
  class_name?: string;
  chapters: BookChapter[] | string | any;
};

export type HolidayMap = Map<string, string>; // yyyy-MM-dd → name

export type ScheduleMeta = {
  start_date: string;
  end_date: string;
  class_days: string[];
  holidays?: HolidayMap;
};

export const DAY_NAME_TO_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

let tempIdCounter = -1;

export function nextTempId(): number {
  return tempIdCounter--;
}

export function resetTempIds(start = -1) {
  tempIdCounter = start;
}

export function toDateKey(date: string | Date): string {
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function parseDateUTC(dateStr: string): Date {
  return new Date(`${toDateKey(dateStr)}T00:00:00.000Z`);
}

export function topicKey(t: {
  nctb_book_id?: number | null;
  chapter_name: string;
  topic_name?: string | null;
}): string {
  return `${t.nctb_book_id ?? "c"}::${t.chapter_name}::${t.topic_name ?? ""}`;
}

export function isTeachable(session: DraftSession): boolean {
  if (session.is_cancelled) return false;
  // Actual cuti / skip — no class. Soft holiday tip (holiday_name on a class) remains teachable.
  if (session.session_type === "holiday" || session.session_type === "skipped") return false;
  return true;
}

export function normalizeSessionType(session: Partial<DraftSession>): SessionType {
  if (session.session_type) return session.session_type;
  if (session.holiday_name === "Skipped Class" || session.is_cancelled) return "skipped";
  // Legacy hard holidays (is_holiday without session_type) → treat as cuti
  if (session.is_holiday && session.session_type !== "class") return "holiday";
  if (session.is_exam || session.exam_title) return "exam";
  return "class";
}

export function applySessionTypeFlags(session: DraftSession): DraftSession {
  const type = normalizeSessionType(session);
  return {
    ...session,
    session_type: type,
    // Soft public-holiday tip keeps holiday_name while session stays a class
    is_holiday: type === "holiday" || type === "skipped",
    holiday_name:
      type === "skipped"
        ? "Skipped Class"
        : session.holiday_name || null,
    is_exam: type === "exam",
    exam_title: type === "exam" ? session.exam_title || null : session.exam_title,
  };
}

/** True when this date is a known public holiday but teacher has not marked cuti yet. */
export function isSoftHoliday(session: DraftSession): boolean {
  return (
    session.session_type === "class" &&
    !!session.holiday_name &&
    session.holiday_name !== "Skipped Class"
  );
}
