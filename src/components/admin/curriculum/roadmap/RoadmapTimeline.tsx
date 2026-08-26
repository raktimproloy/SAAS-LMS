"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  onSkip,
  onUnskip,
  onAddDay,
  onRemoveDay,
  onMarkCuti,
  onTeachHoliday,
  onAddExam,
  onAddTopic,
}: Props) {
  const grouped: Record<string, DraftSession[]> = {};
  sessions.forEach((session) => {
    const monthKey = format(parseISO(session.date), "MMMM yyyy");
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(session);
  });

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([month, monthSessions]) => (
        <div key={month} className="space-y-4">
          <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur z-10 py-2">
            <Calendar className="w-5 h-5 text-primary" />
            {month}
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              {monthSessions.length} days
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {monthSessions.map((session) => (
              <SessionCard
                key={String(session.id)}
                session={session}
                readOnly={readOnly}
                onRemoveTopic={onRemoveTopic}
                onMoveTopicEarlier={onMoveTopicEarlier}
                onMoveTopicLater={onMoveTopicLater}
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
          No sessions yet. Adjust dates or class days in Settings.
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
  const primaryTopic = session.topics?.[0];

  const inner = (
    <Card className={`min-h-[200px] border-2 transition-all shadow-sm ${border}`}>
      <CardHeader className="py-3 px-4 border-b bg-muted/15 space-y-2">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                type === "holiday" || type === "skipped"
                  ? "destructive"
                  : type === "exam"
                    ? "default"
                    : "secondary"
              }
            >
              {type === "exam"
                ? "Exam"
                : type === "holiday"
                  ? "Cuti"
                  : type === "skipped"
                    ? "Skipped"
                    : `Class ${session.session_number}`}
            </Badge>
            <span className="font-semibold text-sm">
              {format(parseISO(session.date), "EEE, MMM d")}
            </span>
            {session.is_completed && (
              <Badge variant="outline" className="text-green-600 border-green-500">
                Done
              </Badge>
            )}
            {softHoliday && (
              <Badge
                variant="outline"
                className="text-amber-700 border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-[10px]"
              >
                Public holiday
              </Badge>
            )}
          </div>
          {primaryTopic && type !== "holiday" && type !== "skipped" && (
            <p className="text-xs text-muted-foreground truncate">
              {primaryTopic.subject ? `${primaryTopic.subject} · ` : ""}
              {primaryTopic.chapter_name}
              {primaryTopic.topic_name ? ` — ${primaryTopic.topic_name}` : ""}
              {topicCount > 1 ? ` (+${topicCount - 1} more)` : ""}
            </p>
          )}
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-1">
            {type === "class" && onSkip && (
              <ActionBtn onClick={() => onSkip(session.id)} className="text-orange-600">
                <XCircle className="w-3 h-3" /> Skip
              </ActionBtn>
            )}
            {type === "class" && onMarkCuti && (
              <ActionBtn
                onClick={() => onMarkCuti(session.id, session.holiday_name || "Cuti")}
                className="text-amber-700"
              >
                <Umbrella className="w-3 h-3" /> Cuti
              </ActionBtn>
            )}
            {type === "skipped" && onUnskip && (
              <ActionBtn onClick={() => onUnskip(session.id)} className="text-green-600">
                Restore
              </ActionBtn>
            )}
            {type === "holiday" && onTeachHoliday && (
              <ActionBtn onClick={() => onTeachHoliday(session.id)} className="text-primary">
                Class hobe
              </ActionBtn>
            )}
            {canTeach && onAddDay && (
              <ActionBtn onClick={() => onAddDay(session.id)}>
                <Plus className="w-3 h-3" /> Day
              </ActionBtn>
            )}
            {type === "class" && onAddExam && (
              <ActionBtn onClick={() => onAddExam(session.id)} className="text-blue-600">
                <FileSignature className="w-3 h-3" /> Exam
              </ActionBtn>
            )}
            {canTeach && onAddTopic && (
              <ActionBtn onClick={() => onAddTopic(session.id)}>
                <Plus className="w-3 h-3" /> Topic
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

      <CardContent className="p-4 space-y-2">
        {softHoliday && type === "class" && (
          <div className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5 rounded-md bg-amber-100/60 dark:bg-amber-950/40 px-2 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              <strong>{session.holiday_name}</strong> — default e class ache. Cuti dite
              &quot;Cuti&quot; chapun; topics pore chole jabe.
            </span>
          </div>
        )}
        {type === "holiday" && (
          <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <Umbrella className="w-4 h-4" />
            Cuti: {session.holiday_name || "Holiday"}
          </div>
        )}
        {type === "skipped" && (
          <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Skipped — topics next class e chole geche
          </div>
        )}
        {type === "exam" && session.exam_title && (
          <div className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
            <FileSignature className="w-4 h-4" />
            {session.exam_title}
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
                    className={`flex items-center justify-between gap-1 p-2 rounded-md text-sm border ${
                      snapshot.isDragging
                        ? "shadow-lg bg-background border-primary"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <TopicRow topic={topic} />
                    <div className="flex items-center gap-0.5 shrink-0">
                      {(onMoveTopicEarlier || onMoveTopicLater) && (
                        <div className="flex items-center rounded-md border bg-background/90 mr-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveTopicEarlier?.(session.id, topic.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30"
                            title="Ager class e nao (merge)"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveTopicLater?.(session.id, topic.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary"
                            title="Porer class e nao (merge)"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
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
              Topic drag kore anun ba + Topic
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
        <p className="break-words leading-tight font-medium">
          {topic.chapter_name}
          {topic.topic_name ? ` — ${topic.topic_name}` : ""}
        </p>
        {topic.subject && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{topic.subject}</p>
        )}
      </div>
      {topic.size > 1 && (
        <Badge variant="outline" className="text-[10px] shrink-0">
          x{topic.size}
        </Badge>
      )}
    </div>
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
      className={`h-7 px-2 text-xs gap-1 ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
