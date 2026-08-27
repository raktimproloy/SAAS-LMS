"use client";

import React, { useState } from "react";
import { format, parseISO, isToday } from "date-fns";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Plus,
  Trash2,
  Umbrella,
  XCircle,
} from "lucide-react";
import type { DraftSession } from "@/lib/curriculum-scheduler";
import { isSoftHoliday } from "@/lib/curriculum-scheduler";

type Props = {
  sessions: DraftSession[];
  readOnly?: boolean;
  onRemoveTopic?: (sessionId: number | string, topicId: number | string) => void;
  onMoveTopicEarlier?: (sessionId: number | string, topicId: number | string) => void;
  onMoveTopicLater?: (sessionId: number | string, topicId: number | string) => void;
  onShiftSessionEarlier?: (sessionId: number | string) => void;
  onShiftSessionLater?: (sessionId: number | string) => void;
  onSkip?: (sessionId: number | string) => void;
  onUnskip?: (sessionId: number | string) => void;
  onAddDay?: (sessionId: number | string) => void;
  onRemoveDay?: (sessionId: number | string) => void;
  onMarkCuti?: (sessionId: number | string, name: string) => void;
  onTeachHoliday?: (sessionId: number | string) => void;
  onAddExam?: (sessionId: number | string) => void;
  onAddTopic?: (sessionId: number | string) => void;
};

export function RoadmapTimeline({
  sessions,
  readOnly = false,
  onRemoveTopic,
  onMoveTopicEarlier,
  onMoveTopicLater,
  onShiftSessionEarlier,
  onShiftSessionLater,
  onSkip,
  onUnskip,
  onAddDay,
  onRemoveDay,
  onMarkCuti,
  onTeachHoliday,
  onAddExam,
  onAddTopic,
}: Props) {
  React.useEffect(() => {
    const el = document.getElementById("today-session");
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, []);

  const grouped: Record<string, DraftSession[]> = {};
  sessions.forEach((session) => {
    const monthKey = format(parseISO(session.date), "MMMM yyyy");
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(session);
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {Object.entries(grouped).map(([month, monthSessions]) => (
        <div key={month} className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-bold border-b pb-2 flex items-center gap-2 py-2 -mx-1 px-1">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <span className="truncate">{month}</span>
            <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-auto shrink-0">
              {monthSessions.length} দিন
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
            {monthSessions.map((session) => (
              <SessionCard
                key={String(session.id)}
                session={session}
                readOnly={readOnly}
                onRemoveTopic={onRemoveTopic}
                onMoveTopicEarlier={onMoveTopicEarlier}
                onMoveTopicLater={onMoveTopicLater}
                onShiftSessionEarlier={onShiftSessionEarlier}
                onShiftSessionLater={onShiftSessionLater}
                onSkip={onSkip}
                onUnskip={onUnskip}
                onAddDay={onAddDay}
                onRemoveDay={onRemoveDay}
                onMarkCuti={onMarkCuti}
                onTeachHoliday={onTeachHoliday}
                onAddExam={onAddExam}
                onAddTopic={onAddTopic}
              />
            ))}
          </div>
        </div>
      ))}
      {sessions.length === 0 && (
        <p className="text-center text-muted-foreground py-16">
          এখনো কোনো ক্লাস নেই। সেটিংস থেকে তারিখ বা ক্লাসের দিন ঠিক করুন।
        </p>
      )}
    </div>
  );
}

function SessionCard({
  session,
  readOnly,
  onRemoveTopic,
  onMoveTopicEarlier,
  onMoveTopicLater,
  onShiftSessionEarlier,
  onShiftSessionLater,
  onSkip,
  onUnskip,
  onAddDay,
  onRemoveDay,
  onMarkCuti,
  onTeachHoliday,
  onAddExam,
  onAddTopic,
}: {
  session: DraftSession;
  readOnly?: boolean;
} & Omit<Props, "sessions">) {
  const type = session.session_type;
  const softHoliday = isSoftHoliday(session);
  const canTeach = type === "class" || type === "exam";

  const border = softHoliday
    ? "border-amber-300/80 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/15"
    : type === "exam"
      ? "border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20"
      : type === "holiday"
        ? "border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20"
        : type === "skipped"
          ? "border-red-300 dark:border-red-900 border-dashed bg-red-50/40 dark:bg-red-950/20"
          : "border-border/60 hover:border-primary/30";

  const droppable = !readOnly && canTeach;
  const topicCount = session.topics?.length || 0;
  const isTodayClass = isToday(parseISO(session.date));

  const inner = (
    <Card id={isTodayClass ? "today-session" : undefined} className={`min-h-[140px] sm:min-h-[160px] border-2 transition-all shadow-sm ${border} ${isTodayClass ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4 border-b bg-muted/15 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-foreground">
              {format(parseISO(session.date), "EEE, MMM d")}
            </span>
            {isTodayClass && (
              <Badge className="bg-primary text-primary-foreground text-[10px] sm:text-xs px-2">
                Today
              </Badge>
            )}
            {softHoliday && (
              <Badge
                variant="outline"
                className="text-amber-700 border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-[10px]"
              >
                {session.holiday_name || "সরকারি ছুটি"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant={
                type === "holiday" || type === "skipped"
                  ? "destructive"
                  : type === "exam"
                    ? "default"
                    : "secondary"
              }
              className="text-[10px] sm:text-xs font-semibold"
            >
              {type === "exam"
                ? "পরীক্ষা"
                : type === "holiday"
                  ? "ছুটি"
                  : type === "skipped"
                    ? "স্কিপ"
                    : `ক্লাস ${session.session_number}`}
            </Badge>
            {session.is_completed && (
              <Badge variant="outline" className="text-green-600 border-green-500 text-[10px] sm:text-xs">
                সম্পন্ন (Done)
              </Badge>
            )}
          </div>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-0.5 sm:gap-1 pt-1.5 border-t border-border/40 -mx-1">
            {type === "class" && onSkip && (
              <ActionBtn onClick={() => onSkip(session.id)} className="text-orange-600">
                <XCircle className="w-3 h-3" /> স্কিপ
              </ActionBtn>
            )}
            {type === "class" && onMarkCuti && (
              <ActionBtn
                onClick={() => onMarkCuti(session.id, session.holiday_name || "ছুটি")}
                className="text-amber-700"
              >
                <Umbrella className="w-3 h-3" /> ছুটি
              </ActionBtn>
            )}
            {type === "skipped" && onUnskip && (
              <ActionBtn onClick={() => onUnskip(session.id)} className="text-green-600">
                ফিরিয়ে আনুন
              </ActionBtn>
            )}
            {type === "holiday" && onTeachHoliday && (
              <ActionBtn onClick={() => onTeachHoliday(session.id)} className="text-primary">
                ক্লাস হবে
              </ActionBtn>
            )}
            {canTeach && onAddDay && (
              <ActionBtn onClick={() => onAddDay(session.id)}>
                <Plus className="w-3 h-3" /> দিন
              </ActionBtn>
            )}
            {type === "class" && onAddExam && (
              <ActionBtn onClick={() => onAddExam(session.id)} className="text-blue-600">
                <FileSignature className="w-3 h-3" /> পরীক্ষা
              </ActionBtn>
            )}
            {canTeach && onAddTopic && (
              <ActionBtn onClick={() => onAddTopic(session.id)}>
                <Plus className="w-3 h-3" /> টপিক
              </ActionBtn>
            )}
            {onRemoveDay && type !== "holiday" && (
              <ActionBtn onClick={() => onRemoveDay(session.id)} className="text-destructive">
                <Trash2 className="w-3 h-3" />
              </ActionBtn>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-2">
        {softHoliday && type === "class" && (
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 px-2.5 py-1.5 border border-amber-300/60 dark:border-amber-900/50">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{session.holiday_name || "সরকারি ছুটি"}</span>
          </div>
        )}
        {type === "holiday" && (
          <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 py-1">
            <Umbrella className="w-4 h-4 shrink-0" />
            <span>{session.holiday_name || "ছুটির দিন"}</span>
          </div>
        )}
        {type === "skipped" && (
          <div className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 py-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>স্কিপ করা হয়েছে</span>
          </div>
        )}
        {type === "exam" && session.exam_title && (
          <div className="text-sm text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5 py-1">
            <FileSignature className="w-4 h-4 shrink-0" />
            <span>{session.exam_title}</span>
          </div>
        )}

        <div className="space-y-2 min-h-[48px]">
          {session.topics.map((topic, index) =>
            readOnly ? (
              <div
                key={`${topic.id}-${index}`}
                className="flex items-center p-2 rounded-md text-sm border bg-muted/30"
              >
                <TopicRow topic={topic} />
              </div>
            ) : (
              <Draggable
                key={`topic-${topic.id}-${index}`}
                draggableId={JSON.stringify(topic)}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-md text-sm border ${
                      snapshot.isDragging
                        ? "shadow-lg bg-background border-primary"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <TopicRow topic={topic} />
                    <div className="flex items-center justify-end gap-0.5 shrink-0 self-end sm:self-auto">
                      {(onMoveTopicEarlier || onMoveTopicLater) && (
                        <div className="flex items-center rounded-md border bg-background/90 mr-0.5">
                          {onMoveTopicEarlier && (
                            <TopicMovePopover
                              direction="earlier"
                              onMerge={() => onMoveTopicEarlier(session.id, topic.id)}
                              onShift={() => onShiftSessionEarlier?.(session.id)}
                              shiftDisabled={!onShiftSessionEarlier}
                            >
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                                title="আগের দিকে — অপশন দেখুন"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            </TopicMovePopover>
                          )}
                          {onMoveTopicLater && (
                            <TopicMovePopover
                              direction="later"
                              onMerge={() => onMoveTopicLater(session.id, topic.id)}
                              onShift={() => onShiftSessionLater?.(session.id)}
                              shiftDisabled={!onShiftSessionLater}
                            >
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-muted-foreground hover:text-primary"
                                title="পরের দিকে — অপশন দেখুন"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </TopicMovePopover>
                          )}
                        </div>
                      )}
                      {onRemoveTopic && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTopic(session.id, topic.id);
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            )
          )}
          {topicCount === 0 && canTeach && !readOnly && (
            <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-md">
              টপিক ড্র্যাগ করে আনুন বা + টপিক চাপুন
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!droppable) return inner;

  return (
    <Droppable droppableId={`session-${session.id}`}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={snapshot.isDraggingOver ? "ring-2 ring-primary/40 rounded-xl" : ""}
        >
          {inner}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

function TopicRow({ topic }: { topic: any }) {
  return (
    <div className="flex items-start gap-2 flex-1 min-w-0">
      <BookOpen className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="break-words leading-snug font-medium text-foreground">
          {topic.chapter_name}
          {topic.topic_name ? ` — ${topic.topic_name}` : ""}
        </p>
      </div>
      {topic.size > 1 && (
        <Badge variant="outline" className="text-[10px] shrink-0">
          x{topic.size}
        </Badge>
      )}
    </div>
  );
}

function TopicMovePopover({
  direction,
  onMerge,
  onShift,
  shiftDisabled,
  children,
}: {
  direction: "earlier" | "later";
  onMerge: () => void;
  onShift: () => void;
  shiftDisabled?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isEarlier = direction === "earlier";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[min(18rem,calc(100vw-2rem))] p-2"
        align="end"
        side="top"
        sideOffset={6}
      >
        <p className="text-xs font-semibold px-1 pb-1.5">
          {isEarlier ? "টপিক আগের দিকে" : "টপিক পরের দিকে"}
        </p>
        <div className="grid gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-2 justify-start text-left whitespace-normal"
            onClick={(e) => {
              e.stopPropagation();
              onMerge();
              setOpen(false);
            }}
          >
            <div>
              <p className="font-medium text-xs">
                {isEarlier ? "আগের দিনে একসাথে রাখুন" : "পরের দিনে একসাথে রাখুন"}
              </p>
              <p className="text-[10px] text-muted-foreground font-normal mt-0.5 leading-snug">
                একই দিনে দুইটা টপিক থাকবে
              </p>
            </div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-2 justify-start text-left whitespace-normal"
            disabled={shiftDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onShift();
              setOpen(false);
            }}
          >
            <div>
              <p className="font-medium text-xs">
                {isEarlier ? "ক্লাস আগে সরান" : "ক্লাস পরে সরান"}
              </p>
              <p className="text-[10px] text-muted-foreground font-normal mt-0.5 leading-snug">
                {isEarlier
                  ? "উপরে ক্যাসকেড; ফাঁকা থাকলে ভরবে, নাহলে বাকি টপিকে যাবে"
                  : "এই দিন ফাঁকা; ক্লাসগুলো এক ধাপ পরে যাবে। শেষে জায়গা না থাকলে বাকি টপিকে যাবে"}
              </p>
            </div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ActionBtn({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-0.5 sm:gap-1 ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
