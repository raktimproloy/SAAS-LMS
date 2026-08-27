"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BookOpen, Check, GripVertical, Plus, Search } from "lucide-react";
import type { PoolTopic, SyllabusPool } from "@/lib/curriculum-scheduler";

type Props = {
  pool: SyllabusPool;
  onAddToNext: (topic: PoolTopic) => void;
  onAutoFillRemaining: () => void;
  /** sidebar = sticky desktop panel; embedded = sheet / inline mobile */
  variant?: "sidebar" | "embedded";
  className?: string;
};

export function SyllabusPoolPanel({
  pool,
  onAddToNext,
  onAutoFillRemaining,
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

  const remaining = useMemo(() => pool.remaining.filter(filterFn), [pool.remaining, search]);
  const assigned = useMemo(() => pool.assigned.filter(filterFn), [pool.assigned, search]);

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

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs defaultValue="remaining" className="h-full flex flex-col">
          <TabsList className="mx-3 mt-3 grid grid-cols-2">
            <TabsTrigger value="remaining">বাকি</TabsTrigger>
            <TabsTrigger value="added">যোগ করা</TabsTrigger>
          </TabsList>

          <TabsContent value="remaining" className="flex-1 overflow-y-auto mt-0 p-3 space-y-2">
            <Droppable droppableId="pool-remaining" isDropDisabled>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {remaining.map((topic, index) => (
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
                          className={`flex items-start gap-2 p-2 border rounded-md bg-background text-sm ${
                            snapshot.isDragging ? "shadow-lg border-primary" : ""
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{topic.chapter_name}</p>
                            {topic.topic_name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {topic.topic_name}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {topic.book_label || topic.subject}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            title="পরের খালি ক্লাসে যোগ করুন"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToNext(topic);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {remaining.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      {pool.remaining.length === 0
                        ? "সব সিলেবাস টপিক রোডম্যাপে বসে গেছে।"
                        : "কোনো মিল পাওয়া যায়নি।"}
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </TabsContent>

          <TabsContent value="added" className="flex-1 overflow-y-auto mt-0 p-3 space-y-2">
            {assigned.map((topic) => (
              <div
                key={topic.key}
                className="flex items-start gap-2 p-2 border rounded-md bg-muted/20 text-sm"
              >
                <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{topic.chapter_name}</p>
                  {topic.topic_name && (
                    <p className="text-xs text-muted-foreground truncate">{topic.topic_name}</p>
                  )}
                </div>
              </div>
            ))}
            {assigned.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">এখনো কিছু যোগ করা হয়নি।</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
