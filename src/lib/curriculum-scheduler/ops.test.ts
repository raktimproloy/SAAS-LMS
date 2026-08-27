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
  addExamAtSession,
  shiftSessionEarlier,
  shiftSessionLater,
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

const classWithTopics = filled.find(
  (s) => s.session_type === "class" && s.topics.length >= 1
)!;
assert(!!classWithTopics, "need class with topics for exam test");
const displacedCount = classWithTopics.topics.length;
const afterExam = addExamAtSession(
  filled,
  classWithTopics.id,
  "Mid Test",
  meta.class_days,
  meta.end_date
);
const examSlot = afterExam.find((s) => String(s.id) === String(classWithTopics.id))!;
assert(examSlot.session_type === "exam", "session becomes exam");
assert(examSlot.topics.length === 1, "exam slot has only exam topic");
assert(displacedCount > 0, "had topics to displace");
assert(
  afterExam.some(
    (s) =>
      s.session_type === "class" &&
      String(s.id) !== String(classWithTopics.id) &&
      s.topics.some((t) =>
        classWithTopics.topics.some((orig) => orig.chapter_name === t.chapter_name)
      )
  ),
  "displaced class topics moved to next slot"
);

const teachableClasses = filled.filter((s) => s.session_type === "class");
const shiftTarget = teachableClasses.find(
  (s, i) => s.topics.length > 0 && i < teachableClasses.length - 1
);
if (shiftTarget) {
  const origTopics = shiftTarget.topics.map((t) => String(t.id));
  const teachable = filled.filter(
    (s) => s.session_type === "class" || s.session_type === "exam"
  );
  const tIdx = teachable.findIndex((s) => String(s.id) === String(shiftTarget.id));
  const nextDay = tIdx >= 0 && tIdx < teachable.length - 1 ? teachable[tIdx + 1] : null;

  const shifted = shiftSessionLater(filled, shiftTarget.id, meta.class_days, meta.end_date);
  const shiftedSlot = shifted.find((s) => String(s.id) === String(shiftTarget.id))!;
  assert(shiftedSlot.topics.length === 0, "shift later empties current slot");

  if (nextDay) {
    const nextAfter = shifted.find((s) => String(s.id) === String(nextDay.id))!;
    assert(
      nextAfter.topics.some((t) => origTopics.includes(String(t.id))),
      "current class moves exactly one slot later (5→7)"
    );
  }
}

const multiMeta = {
  start_date: "2026-08-01",
  end_date: "2026-09-30",
  class_days: ["Sunday", "Tuesday", "Thursday"],
  holidays: new Map<string, string>(),
};
const multi = autoFillFromBooks(generateEmptySessions(multiMeta), books);
const sept5 = multi.find(
  (s) => s.date.startsWith("2026-09-05") && s.session_type === "class" && s.topics.length > 0
);
const sept2 = multi.find(
  (s) => s.date.startsWith("2026-09-02") && s.session_type === "class"
);
if (sept5 && sept2) {
  const sept2Topics = sept2.topics.map((t) => t.chapter_name);
  const sept5Topics = sept5.topics.map((t) => t.chapter_name);
  const teachableBefore = multi
    .filter((s) => s.session_type === "class" || s.session_type === "exam")
    .map((s) => s.date.slice(0, 10));
  const sept2Pos = teachableBefore.indexOf("2026-09-02");
  const earlierDate =
    sept2Pos > 0 ? teachableBefore[sept2Pos - 1] : null;

  const rotated = shiftSessionEarlier(multi, sept5.id, multiMeta.class_days, multiMeta.end_date);
  const newSept2 = rotated.find((s) => s.date.startsWith("2026-09-02"))!;
  const newSept5 = rotated.find((s) => s.date.startsWith("2026-09-05"))!;
  assert(
    newSept2.topics.some((t) => sept5Topics.includes(t.chapter_name)),
    "sept 5 topics land on sept 2"
  );
  if (earlierDate && sept2Topics.length > 0) {
    const earlierSlot = rotated.find((s) => s.date.startsWith(earlierDate))!;
    assert(
      earlierSlot.topics.some((t) => sept2Topics.includes(t.chapter_name)),
      "sept 2 topics cascade to previous august/earlier slot (not end of schedule)"
    );
  }
  // Topics must not jump to a day after the original sept 5 from the upward cascade
  assert(
    !rotated.some(
      (s) =>
        s.date.slice(0, 10) > "2026-09-05" &&
        s.topics.some((t) => sept2Topics.includes(t.chapter_name))
    ),
    "sept 2 topics must not move later/bottom"
  );

  // Later classes should compact into the hole at sept 5
  const laterBefore = multi.filter(
    (s) =>
      (s.session_type === "class" || s.session_type === "exam") &&
      s.date.slice(0, 10) > "2026-09-05" &&
      s.topics.length > 0
  );
  if (laterBefore.length > 0) {
    const firstLaterTopics = laterBefore[0].topics.map((t) => t.chapter_name);
    assert(
      newSept5.topics.some((t) => firstLaterTopics.includes(t.chapter_name)),
      "later class compacts forward into sept 5 hole"
    );
  }
}

// Overflow to Remaining when shifting the very first teachable slot
{
  const teachable = multi.filter(
    (s) => s.session_type === "class" || s.session_type === "exam"
  );
  const firstSlot = teachable[0];
  if (firstSlot && firstSlot.topics.length > 0) {
    const originalId = String(firstSlot.topics[0].id);
    const nextFilled = teachable.find((s, i) => i > 0 && s.topics.length > 0);
    const overflowed = shiftSessionEarlier(
      multi,
      firstSlot.id,
      multiMeta.class_days,
      multiMeta.end_date
    );
    assert(
      !overflowed.some((s) => s.topics.some((t) => String(t.id) === originalId)),
      "first slot original topic ids leave schedule (Remaining)"
    );
    const afterFirst = overflowed.find((s) => String(s.id) === String(firstSlot.id))!;
    if (nextFilled) {
      const laterNames = nextFilled.topics.map((t) => t.chapter_name);
      assert(
        afterFirst.topics.some((t) => laterNames.includes(t.chapter_name)),
        "later class fills first slot after overflow"
      );
    }
  }
}

// Completed class blocks upward cascade
{
  const withDone = multi.map((s, i) =>
    i === 0 && (s.session_type === "class" || s.session_type === "exam")
      ? { ...s, is_completed: true, topics: s.topics.map((t) => ({ ...t })) }
      : { ...s, topics: s.topics.map((t) => ({ ...t })) }
  );
  const indices = withDone
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.session_type === "class" || s.session_type === "exam");
  if (indices.length >= 3) {
    const completedTopics = [...indices[0].s.topics];
    const target = indices[2].s;
    const targetTopics = target.topics.map((t) => t.chapter_name);
    const midTopics = indices[1].s.topics.map((t) => t.chapter_name);
    const result = shiftSessionEarlier(
      withDone,
      target.id,
      multiMeta.class_days,
      multiMeta.end_date
    );
    const stillCompleted = result.find((s) => String(s.id) === String(indices[0].s.id))!;
    assert(
      stillCompleted.topics.length === completedTopics.length,
      "completed class topics stay put"
    );
    const mid = result.find((s) => String(s.id) === String(indices[1].s.id))!;
    assert(
      mid.topics.some((t) => targetTopics.includes(t.chapter_name)),
      "target cascades into mid slot"
    );
    // mid's old topics fall into Remaining (blocked by completed) — mid should not keep only old if target moved in
    assert(mid.topics.length > 0 || midTopics.length === 0, "mid received cascade");
  }
}

// Empty gap above: earlier filled day must stay put (not Remaining)
{
  const gapMeta = {
    start_date: "2026-09-20",
    end_date: "2026-10-15",
    class_days: ["Sunday", "Tuesday", "Thursday"],
    holidays: new Map<string, string>(),
  };
  let gapSessions = generateEmptySessions(gapMeta);
  const teachable = gapSessions.filter(
    (s) => s.session_type === "class" || s.session_type === "exam"
  );
  // Use 3 consecutive teachable days: filled → empty → target
  if (teachable.length >= 3) {
    const d25 = teachable[0];
    const d27 = teachable[1];
    const d30 = teachable[2];
    gapSessions = gapSessions.map((s) => {
      if (String(s.id) === String(d25.id)) {
        return {
          ...s,
          topics: [
            {
              id: -9001,
              chapter_name: "Keep Me",
              topic_name: "on 25",
              size: 1,
              is_custom: true,
              sort_order: 0,
            },
          ],
        };
      }
      if (String(s.id) === String(d27.id)) {
        return { ...s, topics: [] };
      }
      if (String(s.id) === String(d30.id)) {
        return {
          ...s,
          topics: [
            {
              id: -9002,
              chapter_name: "Move Me",
              topic_name: "from 30",
              size: 1,
              is_custom: true,
              sort_order: 0,
            },
          ],
        };
      }
      return { ...s, topics: [] };
    });
    const after = shiftSessionEarlier(
      gapSessions,
      d30.id,
      gapMeta.class_days,
      gapMeta.end_date
    );
    const keep = after.find((s) => String(s.id) === String(d25.id))!;
    const hole = after.find((s) => String(s.id) === String(d27.id))!;
    const src = after.find((s) => String(s.id) === String(d30.id))!;
    assert(
      keep.topics.some((t) => String(t.id) === "-9001"),
      "filled day before empty gap stays put (not Remaining)"
    );
    assert(
      hole.topics.some((t) => String(t.id) === "-9002"),
      "target moves into the empty gap day"
    );
    assert(
      !src.topics.some((t) => String(t.id) === "-9002"),
      "source leaves original day"
    );
  }
}

const lastTeachable = [...filled].reverse().find((s) => s.session_type === "class")!;
const afterSkip = skipSession(filled, lastTeachable.id, meta.class_days, meta.end_date);
assert(
  afterSkip.every((s) => s.date.slice(0, 10) <= meta.end_date),
  "skip respects end_date"
);

const cleared = autoFillFromBooks(empty, books);
assert(cleared.some((s) => s.topics.length > 0), "autofill works");

console.log("curriculum-scheduler ops.test.ts: all passed");
