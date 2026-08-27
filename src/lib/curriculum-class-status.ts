/** Parse batch time strings like "10:00 AM", "10:00", "22:30" → minutes since midnight */
export function parseBatchTimeToMinutes(raw: string | null | undefined): number | null {
  if (!raw || !String(raw).trim()) return null;
  const s = String(raw).trim();
  const ampm = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const ap = ampm[3].toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
  }
  return null;
}

export function dateKeyLocal(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type ClassRunStatus = "done" | "running" | "upcoming" | "locked";

/**
 * Compute running/upcoming/done/locked for a chronological teachable list.
 * Done gate: session i cannot be running if any earlier session is not completed.
 */
export function computeClassStatuses(
  sessions: {
    id: number;
    date: Date | string;
    is_completed: boolean;
    start_time?: string | null;
    end_time?: string | null;
  }[],
  now: Date = new Date()
): Map<number, ClassRunStatus> {
  const today = dateKeyLocal(now);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const map = new Map<number, ClassRunStatus>();

  let blocked = false;
  for (const s of sessions) {
    if (s.is_completed) {
      map.set(s.id, "done");
      continue;
    }
    if (blocked) {
      map.set(s.id, "locked");
      continue;
    }

    const key = dateKeyLocal(s.date);
    const startM = parseBatchTimeToMinutes(s.start_time ?? undefined);
    const endM = parseBatchTimeToMinutes(s.end_time ?? undefined);

    if (key > today) {
      map.set(s.id, "upcoming");
      blocked = true; // still can show later as locked/upcoming; first incomplete future blocks "running" for later
      continue;
    }

    if (key < today) {
      // Past incomplete → treat as running (needs Done)
      map.set(s.id, "running");
      blocked = true;
      continue;
    }

    // Today
    if (startM != null && nowMins < startM) {
      map.set(s.id, "upcoming");
      blocked = true;
      continue;
    }
    // In window or past start (or no times) → running until Done
    map.set(s.id, "running");
    blocked = true;
  }

  return map;
}
