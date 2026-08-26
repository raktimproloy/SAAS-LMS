import {
  BookChapter,
  DAY_NAME_TO_INDEX,
  DraftSession,
  DraftTopic,
  HolidayMap,
  NctbBookLike,
  PoolTopic,
  ScheduleMeta,
  SyllabusPool,
  applySessionTypeFlags,
  isTeachable,
  nextTempId,
  parseDateUTC,
  toDateKey,
  topicKey,
} from "./types";

export function cloneSessions(sessions: DraftSession[]): DraftSession[] {
  return sessions.map((s) =>
    applySessionTypeFlags({
      ...s,
      topics: (s.topics || []).map((t) => ({ ...t })),
    })
  );
}

export function renumberSessions(sessions: DraftSession[]): DraftSession[] {
  return sessions
    .slice()
    .sort((a, b) => toDateKey(a.date).localeCompare(toDateKey(b.date)))
    .map((s, i) => ({ ...s, session_number: i + 1 }));
}

export function flattenBooksToPool(books: NctbBookLike[]): PoolTopic[] {
  const pool: PoolTopic[] = [];
  for (const book of books) {
    const chapters: BookChapter[] =
      typeof book.chapters === "string" ? JSON.parse(book.chapters) : book.chapters;
    if (!Array.isArray(chapters)) continue;
    for (const ch of chapters) {
      const chapterName = ch.name || ch.title || "Untitled";
      if (ch.topics && Array.isArray(ch.topics) && ch.topics.length > 0) {
        for (const t of ch.topics) {
          const topicName = typeof t === "string" ? t : t.name || t.title || null;
          const size = typeof t === "object" && t.size ? t.size : 1;
          pool.push({
            key: topicKey({
              nctb_book_id: book.id,
              chapter_name: chapterName,
              topic_name: topicName,
            }),
            nctb_book_id: book.id,
            subject: book.subject,
            chapter_name: chapterName,
            topic_name: topicName,
            size,
            book_label: book.class_name
              ? `${book.class_name} · ${book.subject}`
              : book.subject,
          });
        }
      } else {
        pool.push({
          key: topicKey({
            nctb_book_id: book.id,
            chapter_name: chapterName,
            topic_name: null,
          }),
          nctb_book_id: book.id,
          subject: book.subject,
          chapter_name: chapterName,
          topic_name: null,
          size: ch.size || 1,
          book_label: book.class_name
            ? `${book.class_name} · ${book.subject}`
            : book.subject,
        });
      }
    }
  }
  return pool;
}

export function buildSyllabusPool(
  sessions: DraftSession[],
  books: NctbBookLike[]
): SyllabusPool {
  const all = flattenBooksToPool(books);
  const assignedKeys = new Set<string>();
  for (const s of sessions) {
    for (const t of s.topics || []) {
      if (t.is_custom && String(t.chapter_name).startsWith("Exam:")) continue;
      if (t.is_custom && !t.nctb_book_id) continue;
      assignedKeys.add(topicKey(t));
    }
  }
  const assigned = all.filter((p) => assignedKeys.has(p.key));
  const remaining = all.filter((p) => !assignedKeys.has(p.key));
  return { remaining, assigned, total: all.length };
}

/** Build empty class-day sessions. Public holidays stay as CLASS with a tip name — teacher can mark cuti later. */
export function generateEmptySessions(meta: ScheduleMeta): DraftSession[] {
  const targetDays = (meta.class_days || [])
    .map((d) => DAY_NAME_TO_INDEX[d])
    .filter((n) => n !== undefined);
  if (targetDays.length === 0) return [];

  const holidays = meta.holidays || new Map();
  const start = parseDateUTC(meta.start_date);
  const end = parseDateUTC(meta.end_date);
  const sessions: DraftSession[] = [];
  const cursor = new Date(start);
  let n = 1;

  while (cursor <= end) {
    if (targetDays.includes(cursor.getUTCDay())) {
      const dateKey = cursor.toISOString().slice(0, 10);
      const holidayName = holidays.get(dateKey) || null;
      sessions.push(
        applySessionTypeFlags({
          id: nextTempId(),
          date: cursor.toISOString(),
          session_number: n++,
          session_type: "class",
          is_holiday: false,
          holiday_name: holidayName,
          topics: [],
        })
      );
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return sessions;
}

function holidayLookup(sessions: DraftSession[]): HolidayMap {
  const map = new Map<string, string>();
  for (const s of sessions) {
    if (s.holiday_name && s.holiday_name !== "Skipped Class") {
      map.set(toDateKey(s.date), s.holiday_name);
    }
  }
  return map;
}

/** Append next class-day session after last, only if within endDate (inclusive). */
export function appendNextSession(
  sessions: DraftSession[],
  classDays: string[],
  holidays?: HolidayMap,
  endDate?: string
): DraftSession[] {
  if (sessions.length === 0) return sessions;
  const targetDays = classDays
    .map((d) => DAY_NAME_TO_INDEX[d])
    .filter((n) => n !== undefined);
  if (targetDays.length === 0) return sessions;

  const endKey = endDate ? toDateKey(endDate) : null;
  const known = holidays || holidayLookup(sessions);
  let next = renumberSessions(cloneSessions(sessions));
  const last = next[next.length - 1];
  const cursor = parseDateUTC(last.date);
  cursor.setUTCDate(cursor.getUTCDate() + 1);

  for (let i = 0; i < 370; i++) {
    const dateKey = cursor.toISOString().slice(0, 10);
    if (endKey && dateKey > endKey) {
      return renumberSessions(next);
    }
    if (targetDays.includes(cursor.getUTCDay())) {
      const holidayName = known.get(dateKey) || null;
      next.push(
        applySessionTypeFlags({
          id: nextTempId(),
          date: cursor.toISOString(),
          session_number: next.length + 1,
          session_type: "class",
          is_holiday: false,
          holiday_name: holidayName,
          topics: [],
          extra_days: 1,
        })
      );
      return renumberSessions(next);
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return renumberSessions(next);
}

/**
 * Drop sessions after endDate. Overflow topics fill empty in-range slots;
 * anything that does not fit stays unplaced (Remaining pool).
 */
export function clampSessionsToEndDate(
  sessions: DraftSession[],
  endDate: string,
  classDays: string[]
): DraftSession[] {
  const endKey = toDateKey(endDate);
  const kept = sessions.filter((s) => toDateKey(s.date) <= endKey);
  const overflow = sessions.filter((s) => toDateKey(s.date) > endKey);
  if (overflow.length === 0) return renumberSessions(cloneSessions(kept));

  const extraGroups: DraftTopic[][] = [];
  for (const s of overflow) {
    if ((!isTeachable(s) && s.session_type !== "exam") || !s.topics?.length) continue;
    extraGroups.push(s.topics.map((t) => ({ ...t })));
  }

  if (extraGroups.length === 0) return renumberSessions(cloneSessions(kept));

  const next = cloneSessions(kept);
  const firstEmpty = next.findIndex(
    (s) => (isTeachable(s) || s.session_type === "exam") && (!s.topics || s.topics.length === 0)
  );
  if (firstEmpty < 0) return renumberSessions(next);
  return redistributeTopics(next, firstEmpty, extraGroups, classDays, endKey);
}

/**
 * Redistribute topic groups onto teachable sessions starting at fromIndex.
 * Never extends past endDate — leftover groups are dropped (Remaining pool).
 */
export function redistributeTopics(
  sessions: DraftSession[],
  fromIndex: number,
  groups: DraftTopic[][],
  classDays: string[],
  endDate?: string
): DraftSession[] {
  let next = cloneSessions(sessions);

  for (let i = fromIndex; i < next.length; i++) {
    if (isTeachable(next[i]) || next[i].session_type === "exam") {
      next[i] = { ...next[i], topics: [] };
    }
  }

  let groupIdx = 0;
  let sessionIdx = fromIndex;

  while (groupIdx < groups.length) {
    while (true) {
      if (sessionIdx >= next.length) {
        const before = next.length;
        next = appendNextSession(next, classDays, undefined, endDate);
        if (next.length === before) {
          return renumberSessions(next);
        }
      }
      if (sessionIdx >= next.length) break;
      const s = next[sessionIdx];
      if (isTeachable(s) || s.session_type === "exam") break;
      sessionIdx++;
    }
    if (sessionIdx >= next.length) break;

    const group = groups[groupIdx];
    const isExamGroup =
      group.length === 1 &&
      (group[0].is_custom || String(group[0].chapter_name).startsWith("Exam:"));

    next[sessionIdx] = applySessionTypeFlags({
      ...next[sessionIdx],
      session_type: isExamGroup
        ? "exam"
        : next[sessionIdx].session_type === "exam"
          ? "class"
          : next[sessionIdx].session_type,
      is_exam: isExamGroup,
      exam_title: isExamGroup
        ? group[0].topic_name || group[0].chapter_name
        : null,
      topics: group.map((t, j) => ({ ...t, sort_order: j })),
    });

    if (!isExamGroup && next[sessionIdx].session_type === "exam" && group.length > 0) {
      next[sessionIdx] = applySessionTypeFlags({
        ...next[sessionIdx],
        session_type: "class",
        is_exam: false,
        exam_title: null,
      });
    }

    groupIdx++;
    sessionIdx++;
  }

  return renumberSessions(next);
}

function makeExamTopic(prev: DraftTopic, chapter: string): DraftTopic {
  return {
    id: nextTempId(),
    nctb_book_id: prev.nctb_book_id,
    subject: prev.subject,
    chapter_name: `Exam: ${chapter}`,
    topic_name: "Chapter Final Exam",
    size: 1,
    is_custom: true,
  };
}

function poolToTopic(p: PoolTopic): DraftTopic {
  return {
    id: nextTempId(),
    nctb_book_id: p.nctb_book_id,
    subject: p.subject,
    chapter_name: p.chapter_name,
    topic_name: p.topic_name,
    size: p.size,
    is_custom: false,
  };
}

/** Build fill items: topics + chapter exam after each chapter ends. */
export function buildFillItems(books: NctbBookLike[]): DraftTopic[] {
  const pool = flattenBooksToPool(books);
  const items: DraftTopic[] = [];
  let currentChapter: string | null = null;

  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (currentChapter && currentChapter !== p.chapter_name && items.length > 0) {
      const prev = items[items.length - 1];
      items.push(makeExamTopic(prev, currentChapter));
    }
    currentChapter = p.chapter_name;
    items.push(poolToTopic(p));
  }

  if (currentChapter && items.length > 0) {
    const last = items[items.length - 1];
    if (!String(last.chapter_name).startsWith("Exam:")) {
      items.push(makeExamTopic(last, currentChapter));
    }
  }

  return items;
}

export function clearTopics(sessions: DraftSession[]): DraftSession[] {
  return cloneSessions(sessions).map((s) =>
    applySessionTypeFlags({
      ...s,
      topics: [],
      session_type:
        s.session_type === "exam"
          ? "class"
          : s.session_type === "holiday" || s.session_type === "skipped"
            ? s.session_type
            : "class",
      is_exam: false,
      exam_title: null,
    })
  );
}

export function autoFillFromBooks(
  sessions: DraftSession[],
  books: NctbBookLike[]
): DraftSession[] {
  const next = clearTopics(sessions);
  const items = buildFillItems(books);
  const teachableIdx = next
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => isTeachable(s) || s.session_type === "class");

  let cursor = 0;
  for (const item of items) {
    if (cursor >= teachableIdx.length) break;
    const { i } = teachableIdx[cursor];
    const isExam = !!item.is_custom && String(item.chapter_name).startsWith("Exam:");
    next[i] = applySessionTypeFlags({
      ...next[i],
      session_type: isExam ? "exam" : "class",
      is_exam: isExam,
      exam_title: isExam ? item.topic_name || item.chapter_name : null,
      topics: [{ ...item, sort_order: 0 }],
    });
    cursor++;
  }

  return renumberSessions(next);
}

export function generateInitialSchedule(
  meta: ScheduleMeta,
  books: NctbBookLike[] = []
): DraftSession[] {
  const empty = generateEmptySessions(meta);
  if (!books.length) return empty;
  return autoFillFromBooks(empty, books);
}

export function skipSession(
  sessions: DraftSession[],
  sessionId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  const next = cloneSessions(sessions);
  const index = next.findIndex((s) => String(s.id) === String(sessionId));
  if (index < 0) return sessions;

  const target = next[index];
  if (target.session_type === "holiday" || target.session_type === "skipped") {
    return sessions;
  }

  const groups: DraftTopic[][] = [];
  if (target.topics.length > 0) {
    groups.push(target.topics.map((t) => ({ ...t })));
  }
  for (let i = index + 1; i < next.length; i++) {
    if (!isTeachable(next[i]) && next[i].session_type !== "exam") continue;
    if (next[i].topics.length > 0) {
      groups.push(next[i].topics.map((t) => ({ ...t })));
    }
  }

  next[index] = applySessionTypeFlags({
    ...next[index],
    session_type: "skipped",
    is_holiday: true,
    holiday_name: "Skipped Class",
    is_exam: false,
    exam_title: null,
    topics: [],
  });

  return redistributeTopics(next, index + 1, groups, classDays, endDate);
}

export function unskipSession(
  sessions: DraftSession[],
  sessionId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  const next = cloneSessions(sessions);
  const index = next.findIndex((s) => String(s.id) === String(sessionId));
  if (index < 0) return sessions;
  if (next[index].session_type !== "skipped") return sessions;

  next[index] = applySessionTypeFlags({
    ...next[index],
    session_type: "class",
    is_holiday: false,
    holiday_name: next[index].holiday_name === "Skipped Class" ? null : next[index].holiday_name,
    topics: [],
  });

  const groups: DraftTopic[][] = [];
  for (let i = index + 1; i < next.length; i++) {
    if (!isTeachable(next[i]) && next[i].session_type !== "exam") continue;
    if (next[i].topics.length > 0) {
      groups.push(next[i].topics.map((t) => ({ ...t })));
    }
  }

  return redistributeTopics(next, index, groups, classDays, endDate);
}

export function insertClassDate(
  sessions: DraftSession[],
  afterSessionId: number | string,
  dateKey?: string,
  endDate?: string
): DraftSession[] {
  const next = cloneSessions(sessions);
  const index = next.findIndex((s) => String(s.id) === String(afterSessionId));
  if (index < 0) return sessions;

  const after = next[index];
  let date: Date;
  if (dateKey) {
    date = parseDateUTC(dateKey);
  } else {
    date = parseDateUTC(after.date);
    date.setUTCDate(date.getUTCDate() + 1);
  }

  const newKey = date.toISOString().slice(0, 10);
  if (endDate && newKey > toDateKey(endDate)) {
    return sessions; // cannot add past end date
  }

  next.splice(
    index + 1,
    0,
    applySessionTypeFlags({
      id: nextTempId(),
      date: date.toISOString(),
      session_number: after.session_number + 1,
      session_type: "class",
      is_holiday: false,
      holiday_name: null,
      topics: [],
      extra_days: 1,
    })
  );

  return renumberSessions(next);
}

export function removeClassDate(
  sessions: DraftSession[],
  sessionId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  const next = cloneSessions(sessions);
  const index = next.findIndex((s) => String(s.id) === String(sessionId));
  if (index < 0) return sessions;

  const groups: DraftTopic[][] = [];
  if (next[index].topics.length > 0) {
    groups.push(next[index].topics.map((t) => ({ ...t })));
  }
  for (let i = index + 1; i < next.length; i++) {
    if (!isTeachable(next[i]) && next[i].session_type !== "exam") continue;
    if (next[i].topics.length > 0) {
      groups.push(next[i].topics.map((t) => ({ ...t })));
    }
  }

  next.splice(index, 1);
  return redistributeTopics(next, index, groups, classDays, endDate);
}

function teachableIndices(sessions: DraftSession[]): number[] {
  return sessions
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => isTeachable(s) || s.session_type === "exam")
    .map(({ i }) => i);
}

function collectGroupsFrom(sessions: DraftSession[], fromSessionIndex: number): DraftTopic[][] {
  const groups: DraftTopic[][] = [];
  for (let i = fromSessionIndex; i < sessions.length; i++) {
    if (!isTeachable(sessions[i]) && sessions[i].session_type !== "exam") continue;
    groups.push((sessions[i].topics || []).map((t) => ({ ...t })));
  }
  return groups;
}

/**
 * Move this class (and all following classes) one teachable slot earlier.
 * Previous day's content rotates to the end of the shifted block.
 */
export function shiftSessionEarlier(
  sessions: DraftSession[],
  sessionId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  const next = cloneSessions(sessions);
  const indices = teachableIndices(next);
  const absIndex = next.findIndex((s) => String(s.id) === String(sessionId));
  if (absIndex < 0) return sessions;

  const t = indices.indexOf(absIndex);
  if (t <= 0) return sessions;

  const startAbs = indices[t - 1];
  const suffix = collectGroupsFrom(next, startAbs);
  if (suffix.length === 0) return sessions;

  const rotated = [...suffix.slice(1), suffix[0]];
  return redistributeTopics(next, startAbs, rotated, classDays, endDate);
}

/**
 * Move this class (and all following classes) one teachable slot later.
 * Leaves the current slot empty; appends a day only if still within endDate.
 */
export function shiftSessionLater(
  sessions: DraftSession[],
  sessionId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  let next = cloneSessions(sessions);
  let indices = teachableIndices(next);
  const absIndex = next.findIndex((s) => String(s.id) === String(sessionId));
  if (absIndex < 0) return sessions;

  const t = indices.indexOf(absIndex);
  if (t < 0) return sessions;

  const groups = collectGroupsFrom(next, absIndex);

  if (t >= indices.length - 1) {
    const before = next.length;
    next = appendNextSession(next, classDays, undefined, endDate);
    if (next.length === before) {
      // No room past end — cannot shift later
      return sessions;
    }
    indices = teachableIndices(next);
  }

  if (teachableIndices(next)[t + 1] === undefined) {
    const before = next.length;
    next = appendNextSession(next, classDays, undefined, endDate);
    if (next.length === before) return sessions;
  }

  return redistributeTopics(next, absIndex, [[], ...groups], classDays, endDate);
}

export function moveTopic(
  sessions: DraftSession[],
  topic: DraftTopic,
  destSessionId: number | string,
  destIndex: number,
  sourceSessionId?: number | string
): DraftSession[] {
  const next = cloneSessions(sessions);

  if (
    sourceSessionId !== undefined &&
    String(sourceSessionId) !== String(destSessionId)
  ) {
    const srcIdx = next.findIndex((s) => String(s.id) === String(sourceSessionId));
    if (srcIdx >= 0) {
      next[srcIdx] = {
        ...next[srcIdx],
        topics: next[srcIdx].topics.filter((t) => String(t.id) !== String(topic.id)),
      };
    }
  }

  const destIdx = next.findIndex((s) => String(s.id) === String(destSessionId));
  if (destIdx < 0) return sessions;
  if (!isTeachable(next[destIdx]) && next[destIdx].session_type !== "exam") {
    return sessions;
  }

  const topics = [...next[destIdx].topics];

  if (
    sourceSessionId !== undefined &&
    String(sourceSessionId) === String(destSessionId)
  ) {
    const fromIndex = topics.findIndex((t) => String(t.id) === String(topic.id));
    if (fromIndex < 0) return sessions;
    const [moved] = topics.splice(fromIndex, 1);
    topics.splice(destIndex, 0, moved);
  } else {
    const newTopic: DraftTopic = {
      ...topic,
      id:
        topic.id && String(topic.id).startsWith("new-")
          ? nextTempId()
          : topic.id ?? nextTempId(),
    };
    topics.splice(destIndex, 0, newTopic);
  }

  next[destIdx] = {
    ...next[destIdx],
    topics: topics.map((t, i) => ({ ...t, sort_order: i })),
  };

  return next;
}

/**
 * Move a single topic to the previous teachable day.
 * Merges with existing topics there (both stay). Dates stay the same.
 * Later days' topics compact forward into any empty slot left behind.
 */
export function moveTopicEarlier(
  sessions: DraftSession[],
  sessionId: number | string,
  topicId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  const next = cloneSessions(sessions);
  const indices = teachableIndices(next);
  const absIndex = next.findIndex((s) => String(s.id) === String(sessionId));
  if (absIndex < 0) return sessions;

  const tPos = indices.indexOf(absIndex);
  if (tPos <= 0) return sessions;

  const topic = next[absIndex].topics.find((x) => String(x.id) === String(topicId));
  if (!topic) return sessions;

  const prevAbs = indices[tPos - 1];

  next[absIndex] = {
    ...next[absIndex],
    topics: next[absIndex].topics
      .filter((x) => String(x.id) !== String(topicId))
      .map((x, i) => ({ ...x, sort_order: i })),
  };

  // Merge onto previous day — keep existing topics + this one
  next[prevAbs] = {
    ...next[prevAbs],
    topics: [...next[prevAbs].topics, { ...topic }].map((x, i) => ({
      ...x,
      sort_order: i,
    })),
  };

  // Compact only non-empty groups from source day onward into the hole
  const groups: DraftTopic[][] = [];
  for (let i = absIndex; i < next.length; i++) {
    if (!isTeachable(next[i]) && next[i].session_type !== "exam") continue;
    if (next[i].topics.length > 0) {
      groups.push(next[i].topics.map((t) => ({ ...t })));
    }
  }
  return redistributeTopics(next, absIndex, groups, classDays, endDate);
}

/**
 * Move a single topic to the next teachable day.
 * Merges with existing topics there (both stay). Dates stay the same.
 */
export function moveTopicLater(
  sessions: DraftSession[],
  sessionId: number | string,
  topicId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  let next = cloneSessions(sessions);
  let indices = teachableIndices(next);
  const absIndex = next.findIndex((s) => String(s.id) === String(sessionId));
  if (absIndex < 0) return sessions;

  const tPos = indices.indexOf(absIndex);
  if (tPos < 0) return sessions;

  const topic = next[absIndex].topics.find((x) => String(x.id) === String(topicId));
  if (!topic) return sessions;

  if (tPos >= indices.length - 1) {
    const before = next.length;
    next = appendNextSession(next, classDays, undefined, endDate);
    if (next.length === before) return sessions;
    indices = teachableIndices(next);
  }

  const nextAbs = teachableIndices(next)[tPos + 1];
  if (nextAbs === undefined) return sessions;

  next[absIndex] = {
    ...next[absIndex],
    topics: next[absIndex].topics
      .filter((x) => String(x.id) !== String(topicId))
      .map((x, i) => ({ ...x, sort_order: i })),
  };

  // Prepend onto next day so it shows first; keep existing topics
  next[nextAbs] = {
    ...next[nextAbs],
    topics: [{ ...topic }, ...next[nextAbs].topics].map((x, i) => ({
      ...x,
      sort_order: i,
    })),
  };

  return next;
}

export function continueTopic(
  sessions: DraftSession[],
  sessionId: number | string,
  topicId: number | string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  const cloned_sessions = cloneSessions(sessions);
  const index = cloned_sessions.findIndex((s) => String(s.id) === String(sessionId));
  if (index < 0) return sessions;
  const topic = cloned_sessions[index].topics.find((t) => String(t.id) === String(topicId));
  if (!topic) return sessions;

  const cloned: DraftTopic = { ...topic, id: nextTempId() };
  const groups: DraftTopic[][] = [[cloned]];
  for (let i = index + 1; i < cloned_sessions.length; i++) {
    if (!isTeachable(cloned_sessions[i]) && cloned_sessions[i].session_type !== "exam") continue;
    if (cloned_sessions[i].topics.length > 0) {
      groups.push(cloned_sessions[i].topics.map((t) => ({ ...t })));
    }
  }
  return redistributeTopics(cloned_sessions, index + 1, groups, classDays, endDate);
}

export function removeTopic(
  sessions: DraftSession[],
  sessionId: number | string,
  topicId: number | string
): DraftSession[] {
  return cloneSessions(sessions).map((s) => {
    if (String(s.id) !== String(sessionId)) return s;
    const topics = s.topics.filter((t) => String(t.id) !== String(topicId));
    const wasExam = s.session_type === "exam" && topics.length === 0;
    return applySessionTypeFlags({
      ...s,
      topics,
      session_type: wasExam ? "class" : s.session_type,
      is_exam: wasExam ? false : s.is_exam,
      exam_title: wasExam ? null : s.exam_title,
    });
  });
}

export function addExamAtSession(
  sessions: DraftSession[],
  sessionId: number | string,
  title: string
): DraftSession[] {
  return cloneSessions(sessions).map((s) => {
    if (String(s.id) !== String(sessionId)) return s;
    return applySessionTypeFlags({
      ...s,
      session_type: "exam",
      is_exam: true,
      exam_title: title,
      topics: [
        {
          id: nextTempId(),
          chapter_name: `Exam: ${title}`,
          topic_name: title,
          size: 1,
          is_custom: true,
          sort_order: 0,
        },
      ],
    });
  });
}

export function addCustomTopic(
  sessions: DraftSession[],
  sessionId: number | string,
  topic: Omit<DraftTopic, "id"> & { id?: number | string }
): DraftSession[] {
  return cloneSessions(sessions).map((s) => {
    if (String(s.id) !== String(sessionId)) return s;
    if (!isTeachable(s) && s.session_type !== "exam") return s;
    return {
      ...s,
      topics: [
        ...s.topics,
        {
          ...topic,
          id: topic.id ?? nextTempId(),
          is_custom: topic.is_custom ?? true,
          sort_order: s.topics.length,
        },
      ],
    };
  });
}

export function addPoolTopicToNextClass(
  sessions: DraftSession[],
  poolTopic: PoolTopic
): DraftSession[] {
  const next = cloneSessions(sessions);
  const emptyIdx = next.findIndex(
    (s) => isTeachable(s) && (!s.topics || s.topics.length === 0)
  );
  const targetIdx =
    emptyIdx >= 0
      ? emptyIdx
      : next.findIndex((s) => isTeachable(s));
  if (targetIdx < 0) return sessions;

  next[targetIdx] = {
    ...next[targetIdx],
    topics: [
      ...next[targetIdx].topics,
      { ...poolToTopic(poolTopic), sort_order: next[targetIdx].topics.length },
    ],
  };
  return next;
}

export function markHoliday(
  sessions: DraftSession[],
  sessionId: number | string,
  name: string,
  classDays: string[],
  endDate?: string
): DraftSession[] {
  const next = cloneSessions(sessions);
  const index = next.findIndex((s) => String(s.id) === String(sessionId));
  if (index < 0) return sessions;

  const groups: DraftTopic[][] = [];
  if (next[index].topics.length > 0) {
    groups.push(next[index].topics.map((t) => ({ ...t })));
  }
  for (let i = index + 1; i < next.length; i++) {
    if (!isTeachable(next[i]) && next[i].session_type !== "exam") continue;
    if (next[i].topics.length > 0) {
      groups.push(next[i].topics.map((t) => ({ ...t })));
    }
  }

  next[index] = applySessionTypeFlags({
    ...next[index],
    session_type: "holiday",
    is_holiday: true,
    holiday_name: name,
    topics: [],
    is_exam: false,
    exam_title: null,
  });

  return redistributeTopics(next, index + 1, groups, classDays, endDate);
}

export function teachOnHoliday(
  sessions: DraftSession[],
  sessionId: number | string
): DraftSession[] {
  return cloneSessions(sessions).map((s) => {
    if (String(s.id) !== String(sessionId)) return s;
    if (s.session_type !== "holiday") return s;
    // Restore as class but keep holiday tip name so teacher can re-mark cuti
    return applySessionTypeFlags({
      ...s,
      session_type: "class",
      is_holiday: false,
      // keep holiday_name as soft tip
    });
  });
}

export function changeClassDays(
  sessions: DraftSession[],
  meta: ScheduleMeta,
  books: NctbBookLike[] = []
): DraftSession[] {
  // Collect ordered topic groups from current teachable sessions
  const groups: DraftTopic[][] = [];
  for (const s of sessions) {
    if (!isTeachable(s) && s.session_type !== "exam") continue;
    if (s.topics.length > 0) groups.push(s.topics.map((t) => ({ ...t })));
  }

  const regenerated = generateEmptySessions(meta);
  if (groups.length === 0 && books.length > 0) {
    return autoFillFromBooks(regenerated, books);
  }
  return redistributeTopics(regenerated, 0, groups, meta.class_days, meta.end_date);
}

export function computeProgress(sessions: DraftSession[], poolTotal: number) {
  const teachable = sessions.filter(
    (s) => isTeachable(s) || s.session_type === "exam"
  );
  const completed = teachable.filter((s) => s.is_completed).length;
  const assignedTopics = sessions.reduce(
    (acc, s) =>
      acc +
      (s.topics || []).filter(
        (t) => !(t.is_custom && String(t.chapter_name).startsWith("Exam:"))
      ).length,
    0
  );
  const exams = sessions.filter((s) => s.session_type === "exam").length;
  const holidays = sessions.filter((s) => s.session_type === "holiday").length;
  const skipped = sessions.filter((s) => s.session_type === "skipped").length;

  return {
    totalSessions: sessions.length,
    teachable: teachable.length,
    completed,
    completionPct: teachable.length
      ? Math.round((completed / teachable.length) * 100)
      : 0,
    assignedTopics,
    poolTotal,
    remainingTopics: Math.max(0, poolTotal - assignedTopics),
    coveragePct: poolTotal
      ? Math.round((assignedTopics / poolTotal) * 100)
      : 0,
    exams,
    holidays,
    skipped,
  };
}

export function normalizeLoadedSessions(raw: any[]): DraftSession[] {
  return (raw || []).map((s) =>
    applySessionTypeFlags({
      id: s.id,
      date: typeof s.date === "string" ? s.date : new Date(s.date).toISOString(),
      session_number: s.session_number,
      session_type: s.session_type,
      is_holiday: !!s.is_holiday,
      holiday_name: s.holiday_name,
      is_exam: !!s.is_exam,
      exam_title: s.exam_title,
      is_cancelled: !!s.is_cancelled,
      is_completed: !!s.is_completed,
      extra_days: s.extra_days || 0,
      notes: s.notes,
      topics: (s.topics || []).map((t: any) => ({
        id: t.id,
        nctb_book_id: t.nctb_book_id,
        subject: t.subject,
        chapter_name: t.chapter_name,
        topic_name: t.topic_name,
        size: t.size ?? 1,
        sort_order: t.sort_order ?? 0,
        is_custom: !!t.is_custom,
      })),
    })
  );
}

export function estimateScheduleStats(
  meta: ScheduleMeta,
  books: NctbBookLike[]
) {
  const sessions = generateEmptySessions(meta);
  const holidays = sessions.filter((s) => s.session_type === "holiday").length;
  const teachable = sessions.filter((s) => isTeachable(s)).length;
  const items = books.length ? buildFillItems(books) : [];
  const exams = items.filter(
    (t) => t.is_custom && String(t.chapter_name).startsWith("Exam:")
  ).length;
  const topics = items.length - exams;
  return {
    totalDays: sessions.length,
    teachable,
    holidays,
    topics,
    exams,
    willFit: items.length <= teachable,
    overflow: Math.max(0, items.length - teachable),
  };
}
