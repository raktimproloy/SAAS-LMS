/**
 * Lightweight self-check for curriculum scheduler (run: npx tsx src/lib/curriculum-scheduler/ops.test.ts)
 */
import {
  autoFillFromBooks,
  generateEmptySessions,
  generateInitialSchedule,
  skipSession,
  unskipSession,
  moveTopic,
  moveTopicEarlier,
  moveTopicLater,
  buildSyllabusPool,
  markHoliday,
  isSoftHoliday,
  isTeachable,
  resetTempIds,
} from "./index";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

resetTempIds(-1);

const holidays = new Map<string, string>([["2026-03-26", "Independence Day"]]);

const meta = {
  start_date: "2026-03-01",
  end_date: "2026-03-31",
  class_days: ["Sunday", "Tuesday", "Thursday"],
  holidays,
};

const books = [
  {
    id: 1,
    subject: "Physics",
    class_name: "Class 10",
    chapters: [
      {
        name: "Motion",
        topics: [
          { name: "Speed", size: 1 },
          { name: "Acceleration", size: 1 },
        ],
      },
      {
        name: "Force",
        topics: [{ name: "Newton", size: 1 }],
      },
    ],
  },
];

const empty = generateEmptySessions(meta);
assert(
  empty.some((s) => isSoftHoliday(s)),
  "soft holiday tip present"
);
assert(
  empty.every((s) => s.session_type !== "holiday"),
  "no hard holiday by default"
);
assert(
  empty.some((s) => isSoftHoliday(s) && isTeachable(s)),
  "soft holiday is teachable"
);

const filled = generateInitialSchedule(meta, books);
const soft = filled.find((s) => isSoftHoliday(s))!;
assert(soft.topics.length > 0 || filled.some((s) => s.topics.length > 0), "topics filled");
assert(
  filled.filter((s) => s.session_type === "holiday").length === 0,
  "autofill does not create hard holidays"
);

const pool = buildSyllabusPool(filled, books);
assert(pool.remaining.length < pool.total, "some topics assigned");
assert(
  filled.some((s) => s.session_type === "exam"),
  "chapter exams inserted"
);

const teachable = filled.find((s) => s.session_type === "class" && s.topics.length > 0)!;
const cuti = markHoliday(filled, soft.id, soft.holiday_name || "Cuti", meta.class_days);
assert(
  cuti.find((s) => String(s.id) === String(soft.id))?.session_type === "holiday",
  "cuti marks hard holiday"
);

const skipped = skipSession(filled, teachable.id, meta.class_days);
assert(
  skipped.find((s) => String(s.id) === String(teachable.id))?.session_type === "skipped",
  "target skipped"
);

const restored = unskipSession(skipped, teachable.id, meta.class_days);
assert(
  restored.find((s) => String(s.id) === String(teachable.id))?.session_type === "class",
  "unskip restores"
);

const a = filled.find((s) => s.session_type === "class" && s.topics.length)!;
const b = filled.find(
  (s) => s.session_type === "class" && String(s.id) !== String(a.id)
)!;
const moved = moveTopic(filled, a.topics[0], b.id, 0, a.id);
assert(
  moved
    .find((s) => String(s.id) === String(b.id))!
    .topics.some((t) => t.chapter_name === a.topics[0].chapter_name),
  "topic moved"
);

const withTopics = filled.filter((s) => s.session_type === "class" && s.topics.length >= 1);
assert(withTopics.length >= 2, "need 2 classes for topic move test");
const first = withTopics[0];
const second = withTopics[1];
const topicToMove = second.topics[0];
const merged = moveTopicEarlier(filled, second.id, topicToMove.id, meta.class_days, meta.end_date);
const dest = merged.find((s) => String(s.id) === String(first.id))!;
assert(
  dest.topics.some((t) => String(t.id) === String(topicToMove.id)),
  "topic moved earlier"
);
assert(
  dest.topics.length >= first.topics.length,
  "previous day keeps existing topics (merge)"
);

const pushed = moveTopicLater(filled, first.id, first.topics[0].id, meta.class_days, meta.end_date);
assert(
  pushed
    .find((s) => String(s.id) === String(second.id))!
    .topics.some((t) => t.chapter_name === first.topics[0].chapter_name),
  "topic moved later and merged"
);
assert(
  pushed.every((s) => s.date.slice(0, 10) <= meta.end_date),
  "no sessions past end_date"
);

const lastTeachable = [...filled].reverse().find((s) => s.session_type === "class")!;
const afterSkip = skipSession(filled, lastTeachable.id, meta.class_days, meta.end_date);
assert(
  afterSkip.every((s) => s.date.slice(0, 10) <= meta.end_date),
  "skip respects end_date"
);

const cleared = autoFillFromBooks(empty, books);
assert(cleared.some((s) => s.topics.length > 0), "autofill works");

console.log("curriculum-scheduler ops.test.ts: all passed");
