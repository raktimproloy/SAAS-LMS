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
  X,
  Settings2
} from "lucide-react";
import type { DraftSession } from "@/lib/curriculum-scheduler";
import { isSoftHoliday } from "@/lib/curriculum-scheduler";
import { cn } from "@/lib/utils";
import { eachDayOfInterval } from "date-fns";

type Props = {
  sessions: DraftSession[];
  curriculum?: any;
  showFullCalendar?: boolean;
  selectedSessionId?: number | string | null;
  onSelectSession?: (id: number | string | null) => void;
  readOnly?: boolean;
  onRemoveTopic?: (sessionId: number | string, topicId: number | string) => void;
  onMoveTopicEarlier?: (sessionId: number | string, topicId: number | string) => void;
  onMoveTopicLater?: (sessionId: number | string, topicId: number | string) => void;
  onShiftSessionEarlier?: (sessionId: number | string) => void;
  onShiftSessionLater?: (sessionId: number | string) => void;
  onSkip?: (sessionId: number | string) => void;
  onUnskip?: (sessionId: number | string) => void;
  onDuplicateDay?: (sessionId: number | string) => void;
  onRemoveDay?: (sessionId: number | string) => void;
  onMarkCuti?: (sessionId: number | string, name: string) => void;
  onTeachHoliday?: (sessionId: number | string) => void;
  onAddExam?: (sessionId: number | string) => void;
  onAddTopic?: (sessionId: number | string) => void;
};

export function RoadmapTimeline({
  sessions,
  curriculum,
  showFullCalendar,
  selectedSessionId,
  onSelectSession,
  readOnly = false,
  onRemoveTopic,
  onMoveTopicEarlier,
  onMoveTopicLater,
  onShiftSessionEarlier,
  onShiftSessionLater,
  onSkip,
  onUnskip,
  onDuplicateDay,
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

  const displaySessions = React.useMemo(() => {
    if (!showFullCalendar || !curriculum) return sessions;
    
    try {
      const start = parseISO(curriculum.start_date);
      const end = parseISO(curriculum.end_date);
      const allDays = eachDayOfInterval({ start, end });
      
      const sessionsByDate = new Map(sessions.map(s => [format(parseISO(s.date), "yyyy-MM-dd"), s]));
      
      return allDays.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        const existing = sessionsByDate.get(dateStr);
        if (existing) return existing;
        
        return {
          id: `empty-${dateStr}`,
          date: date.toISOString(),
          session_type: "empty-calendar-day",
          topics: [],
        } as unknown as DraftSession;
      });
    } catch (e) {
      return sessions;
    }
  }, [sessions, showFullCalendar, curriculum]);

  const grouped: Record<string, DraftSession[]> = {};
  displaySessions.forEach((session) => {
    const monthKey = format(parseISO(session.date), "MMMM yyyy");
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(session);
  });

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="relative">
      <div className="space-y-6 sm:space-y-8 transition-all duration-300">
        {Object.entries(grouped).map(([month, monthSessions]) => (
          <div key={month} className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold border-b pb-2 flex items-center gap-2 py-2 -mx-1 px-1">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <span className="truncate">{month}</span>
              <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-auto shrink-0">
                {monthSessions.length} দিন
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 items-start">
              {monthSessions.map((session) => (
                <div key={String(session.id)} className="session-card-wrapper" id={`wrapper-${String(session.id)}`}>
                  <SessionCard
                    session={session}
                    readOnly={readOnly}
                  isSelected={session.id === selectedSessionId}
                  onClick={() => {
                    if (readOnly) return;
                    onSelectSession?.(session.id === selectedSessionId ? null : session.id);
                  }}
                  onRemoveTopic={onRemoveTopic}
                  onMoveTopicEarlier={onMoveTopicEarlier}
                  onMoveTopicLater={onMoveTopicLater}
                  onShiftSessionEarlier={onShiftSessionEarlier}
                  onShiftSessionLater={onShiftSessionLater}
                  onSkip={onSkip}
                  onUnskip={onUnskip}
                  onDuplicateDay={onDuplicateDay}
                  onRemoveDay={onRemoveDay}
                  onMarkCuti={onMarkCuti}
                  onTeachHoliday={onTeachHoliday}
                  onAddExam={onAddExam}
                    onAddTopic={onAddTopic}
                  />
                </div>
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
    </div>
  );
}

function ControlBtn({
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
      variant="outline"
      className={cn("w-full justify-start h-9 px-3 text-sm font-medium transition-colors", className)}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function SessionCard({
  session,
  readOnly,
  isSelected,
  onClick,
  onRemoveTopic,
  onMoveTopicEarlier,
  onMoveTopicLater,
  onShiftSessionEarlier,
  onShiftSessionLater,
  onSkip,
  onUnskip,
  onDuplicateDay,
  onRemoveDay,
  onMarkCuti,
  onTeachHoliday,
  onAddExam,
  onAddTopic,
}: {
  session: DraftSession;
  readOnly?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onRemoveTopic?: (sessionId: number | string, topicId: number | string) => void;
  onMoveTopicEarlier?: (sessionId: number | string, topicId: number | string) => void;
  onMoveTopicLater?: (sessionId: number | string, topicId: number | string) => void;
  onShiftSessionEarlier?: (sessionId: number | string) => void;
  onShiftSessionLater?: (sessionId: number | string) => void;
  onSkip?: (sessionId: number | string) => void;
  onUnskip?: (sessionId: number | string) => void;
  onDuplicateDay?: (sessionId: number | string) => void;
  onRemoveDay?: (sessionId: number | string) => void;
  onMarkCuti?: (sessionId: number | string, name: string) => void;
  onTeachHoliday?: (sessionId: number | string) => void;
  onAddTopic?: (sessionId: number | string) => void;
  onAddDay?: (sessionId: number | string, dateKey?: string) => void;
}) {
  const type = session.session_type;
  const softHoliday = isSoftHoliday(session);
  const canTeach = type === "class" || type === "exam";

  const border = isSelected 
    ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
    : type === "empty-calendar-day"
      ? "border-border/50 bg-muted/20 opacity-70 grayscale-[0.5]"
      : softHoliday
        ? "border-amber-400/80 dark:border-amber-600/80 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-500"
        : type === "exam"
          ? "border-blue-400 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30 hover:border-blue-500"
          : type === "holiday"
            ? "border-orange-300 dark:border-orange-800 bg-orange-50/60 dark:bg-orange-950/30 hover:border-orange-400"
            : type === "skipped"
              ? "border-red-400 dark:border-red-800 border-dashed bg-red-50/60 dark:bg-red-950/30 hover:border-red-500"
              : "border-border hover:border-primary/50 bg-card hover:bg-muted/20";

  const droppable = !readOnly && canTeach;
  const topicCount = session.topics?.length || 0;
  const isTodayClass = isToday(parseISO(session.date));

  const inner = (
    <Card 
      id={isTodayClass ? "today-session" : undefined} 
      className={cn(
        "flex flex-col border transition-all duration-300 shadow-sm cursor-pointer overflow-hidden relative", 
        border, 
        isTodayClass && !isSelected ? 'ring-2 ring-primary/60 shadow-md' : '',
        isSelected ? 'h-auto shadow-lg scale-[1.01] z-10 ring-1 ring-primary/40' : 'h-[250px] hover:-translate-y-0.5'
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        "py-3 px-4 border-b space-y-2 transition-colors duration-300",
        isSelected ? "bg-primary/10" : "bg-muted/10"
      )}>
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-extrabold text-sm sm:text-base", isSelected ? "text-primary" : "text-foreground dark:text-gray-100")}>
              {format(parseISO(session.date), "EEE, MMM d")}
            </span>
            {isTodayClass && (
              <Badge className="bg-primary text-primary-foreground text-xs px-2 shadow-sm font-bold">
                Today
              </Badge>
            )}
            {softHoliday && (
              <Badge
                variant="outline"
                className="text-amber-800 dark:text-amber-300 border-amber-500 bg-amber-100 dark:bg-amber-950/60 text-[10px] font-bold"
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
              className="text-xs font-bold shadow-sm"
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
              <Badge variant="outline" className="text-green-700 dark:text-green-400 border-green-600 bg-green-50 dark:bg-green-950/50 text-[10px] sm:text-xs font-bold">
                সম্পন্ন (Done)
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-3 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {softHoliday && type === "class" && (
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 rounded-lg bg-amber-200/50 dark:bg-amber-900/40 px-3 py-2 border border-amber-400/60 dark:border-amber-700/50 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{session.holiday_name || "সরকারি ছুটি"}</span>
            </div>
          )}
          {type === "holiday" && (
            <div className="text-sm font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2 py-1 px-1">
              <Umbrella className="w-4 h-4 shrink-0" />
              <span>{session.holiday_name || "ছুটির দিন"}</span>
            </div>
          )}
          {type === "skipped" && (
            <div className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2 py-1 px-1">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>স্কিপ করা হয়েছে</span>
            </div>
          )}
          {type === "exam" && session.exam_title && (
            <div className="text-sm text-blue-800 dark:text-blue-300 font-extrabold flex items-center gap-2 py-1 px-1">
              <FileSignature className="w-4 h-4 shrink-0" />
              <span>{session.exam_title}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {session.topics.map((topic, index) =>
              readOnly ? (
                <div
                  key={`${topic.id}-${index}`}
                  className="flex items-center p-2.5 rounded-lg text-sm border bg-muted/40 shadow-sm"
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
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg text-sm border transition-colors shadow-sm",
                        snapshot.isDragging
                          ? "shadow-xl bg-background border-primary ring-1 ring-primary scale-105 z-50"
                          : "bg-background/80 hover:bg-muted/50 border-border"
                      )}
                    >
                      <TopicRow topic={topic} />
                      <div className="flex items-center justify-end gap-1 shrink-0 self-end sm:self-auto">
                        {(onMoveTopicEarlier || onMoveTopicLater) && (
                          <div className="flex items-center rounded-md border bg-card shadow-sm mr-1">
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
                                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 rounded-l-md transition-colors"
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
                                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-r-md transition-colors"
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
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              )
            )}
            {topicCount === 0 && canTeach && !readOnly && (
              <p className="text-sm font-medium text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg bg-muted/10">
                টপিক ড্র্যাগ করে আনুন বা দিন সিলেক্ট করে + টপিক চাপুন
              </p>
            )}
          </div>
        </div>
        
        {/* Inline Expandable Controls */}
        {!readOnly && (
          <div 
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              isSelected ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
            )}
            onClick={(e) => e.stopPropagation()} // Prevent clicking controls from toggling the card
          >
            <div className="overflow-hidden">
              <div className="pt-4 border-t border-border/60">
                <h5 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-3 px-1">দিন কন্ট্রোল প্যানেল</h5>
                <div className="grid grid-cols-2 gap-2.5">
                  {type === "class" && onSkip && (
                    <ControlBtn onClick={() => onSkip(session.id)} className="text-orange-600 dark:text-white hover:bg-orange-500/15 hover:border-orange-500/40">
                      <XCircle className="w-4 h-4 mr-1.5" /> স্কিপ করুন
                    </ControlBtn>
                  )}
                  {type === "class" && onMarkCuti && (
                    <ControlBtn
                      onClick={() => onMarkCuti(session.id, session.holiday_name || "ছুটি")}
                      className="text-amber-700 dark:text-white hover:bg-amber-500/15 hover:border-amber-500/40"
                    >
                      <Umbrella className="w-4 h-4 mr-1.5" /> ছুটি মার্ক
                    </ControlBtn>
                  )}
                  {type === "skipped" && onUnskip && (
                    <ControlBtn onClick={() => onUnskip(session.id)} className="text-green-600 dark:text-white hover:bg-green-500/15 hover:border-green-500/40">
                      <XCircle className="w-4 h-4 mr-1.5" /> স্কিপ বাতিল
                    </ControlBtn>
                  )}
                  {type === "holiday" && onTeachHoliday && (
                    <ControlBtn onClick={() => onTeachHoliday(session.id)} className="text-primary dark:text-white hover:bg-primary/15 hover:border-primary/40">
                      <BookOpen className="w-4 h-4 mr-1.5" /> ক্লাস হবে
                    </ControlBtn>
                  )}
                  {(type === "class" || type === "exam") && onDuplicateDay && (
                    <ControlBtn onClick={() => onDuplicateDay(session.id)} className="hover:bg-accent/50 text-foreground dark:text-white">
                      <Plus className="w-4 h-4 mr-1.5 opacity-70" /> <span>নতুন দিন</span>
                    </ControlBtn>
                  )}
                  {type === "class" && onAddExam && (
                    <ControlBtn onClick={() => onAddExam(session.id)} className="text-blue-600 dark:text-white hover:bg-blue-500/15 hover:border-blue-500/40">
                      <FileSignature className="w-4 h-4 mr-1.5" /> পরীক্ষা যোগ
                    </ControlBtn>
                  )}
                  {type === "empty-calendar-day" && onAddDay && (
                    <ControlBtn onClick={() => onAddDay(session.id, session.date.substring(0, 10))} className="text-primary dark:text-white hover:bg-primary/15 hover:border-primary/40 col-span-2">
                      <Plus className="w-4 h-4 mr-1.5" /> ক্লাস যোগ করুন
                    </ControlBtn>
                  )}
                  {onRemoveDay && type !== "holiday" && type !== "empty-calendar-day" && (
                    <ControlBtn onClick={() => {
                        onRemoveDay(session.id);
                      }} 
                      className="text-destructive dark:text-red-400 hover:bg-destructive/15 hover:border-destructive/40 border-dashed col-span-2 sm:col-span-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5 opacity-70" /> দিনটি মুছুন
                    </ControlBtn>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
          className={cn(
            "transition-all duration-300",
            snapshot.isDraggingOver ? "ring-2 ring-primary/50 rounded-xl bg-primary/5 scale-[1.02] shadow-lg" : ""
          )}
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
      <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="break-words leading-snug font-bold text-foreground dark:text-gray-100">
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
