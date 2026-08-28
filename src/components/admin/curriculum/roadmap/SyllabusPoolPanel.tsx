"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BookOpen, Check, GripVertical, Plus, Search, CheckCircle2 } from "lucide-react";
import type { PoolTopic, SyllabusPool } from "@/lib/curriculum-scheduler";

type Props = {
  pool: SyllabusPool;
  onAddToNext: (topic: PoolTopic) => void;
  onAutoFillRemaining: () => void;
  selectedTopicKeys?: string[];
  /** sidebar = sticky desktop panel; embedded = sheet / inline mobile */
  variant?: "sidebar" | "embedded";
  className?: string;
};

export function SyllabusPoolPanel({
  pool,
  onAddToNext,
  onAutoFillRemaining,
  selectedTopicKeys = [],
  variant = "sidebar",
  className = "",
}: Props) {
  const [search, setSearch] = useState("");

  const filterFn = (t: PoolTopic) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      t.chapter_name.toLowerCase().includes(q) ||
      (t.topic_name || "").toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  };

  const displayTopics = useMemo(() => {
    return (pool.all || []).filter(filterFn);
  }, [pool.all, search]);

  const assignedKeys = useMemo(() => new Set(pool.assigned.map(t => t.key)), [pool.assigned]);
  const activeKeys = useMemo(() => new Set(selectedTopicKeys), [selectedTopicKeys]);

  const isSidebar = variant === "sidebar";

  return (
    <Card
      className={`flex flex-col min-h-0 ${
        isSidebar ? "h-full max-h-[calc(100dvh-5rem)]" : "h-full min-h-0"
      } ${className}`}
    >
      <CardHeader className="pb-3 border-b space-y-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          সিলেবাস পুল
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="টপিক খুঁজুন…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 text-xs">
          <Badge variant="secondary">{pool.assigned.length} টি যোগ</Badge>
          <Badge variant="outline">{pool.remaining.length} টি বাকি</Badge>
        </div>
        {pool.remaining.length > 0 && (
          <Button size="sm" variant="outline" className="w-full" onClick={onAutoFillRemaining}>
            বাকিগুলো অটো বসান
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          <Droppable droppableId="pool-remaining" isDropDisabled>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {displayTopics.map((topic, index) => {
                  const isAssigned = assignedKeys.has(topic.key);
                  const isActive = activeKeys.has(topic.key);
                  
                  return (
                    <Draggable
                      key={topic.key}
                      draggableId={JSON.stringify({
                        id: `new-${topic.key}`,
                        nctb_book_id: topic.nctb_book_id,
                        subject: topic.subject,
                        chapter_name: topic.chapter_name,
                        topic_name: topic.topic_name,
                        size: topic.size,
                        is_custom: false,
                      })}
                      index={index}
                    >
                      {(p, snapshot) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                          className={`flex items-start gap-2 p-2.5 border rounded-lg transition-all duration-200 text-sm ${
                            snapshot.isDragging 
                              ? "shadow-lg border-primary bg-background scale-[1.02] z-50" 
                              : isActive
                                ? "border-green-500 bg-green-500/10 shadow-sm ring-1 ring-green-500/50 dark:bg-green-500/20 dark:border-green-400 dark:ring-green-400"
                                : isAssigned
                                  ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/30 hover:border-emerald-300 shadow-sm opacity-80 hover:opacity-100"
                                  : "bg-background hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold truncate ${isActive ? 'text-green-700 dark:text-green-300' : isAssigned ? 'text-emerald-700 dark:text-emerald-400/80' : 'text-foreground dark:text-gray-100'}`}>
                              {topic.chapter_name}
                            </p>
                            {topic.topic_name && (
                              <p className={`text-xs font-medium truncate ${isActive ? 'text-green-600 dark:text-green-200/80' : isAssigned ? 'text-emerald-600/80 dark:text-emerald-500/70' : 'text-muted-foreground dark:text-gray-300'}`}>
                                {topic.topic_name}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground dark:text-gray-400 mt-1 opacity-90 font-medium">
                              {topic.book_label || topic.subject}
                            </p>
                          </div>
                          
                          {isAssigned ? (
                            <div className="h-7 w-7 flex items-center justify-center shrink-0">
                              <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-green-500' : 'text-emerald-500/70'}`} />
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0 hover:bg-primary/10 hover:text-primary"
                              title="পরের খালি ক্লাসে যোগ করুন"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToNext(topic);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                {displayTopics.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-12 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                    {pool.all?.length === 0
                      ? "সিলেবাসে কোনো টপিক নেই।"
                      : "খুঁজে পাওয়া যায়নি।"}
                  </p>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </CardContent>
    </Card>
  );
}
