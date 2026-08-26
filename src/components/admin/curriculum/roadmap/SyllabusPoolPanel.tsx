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
};

export function SyllabusPoolPanel({ pool, onAddToNext, onAutoFillRemaining }: Props) {
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

  return (
    <Card className="h-[calc(100vh-11rem)] flex flex-col sticky top-24">
      <CardHeader className="pb-3 border-b space-y-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Syllabus Pool
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 text-xs">
          <Badge variant="secondary">{pool.assigned.length} added</Badge>
          <Badge variant="outline">{pool.remaining.length} remaining</Badge>
        </div>
        {pool.remaining.length > 0 && (
          <Button size="sm" variant="outline" className="w-full" onClick={onAutoFillRemaining}>
            Auto-fill remaining
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs defaultValue="remaining" className="h-full flex flex-col">
          <TabsList className="mx-3 mt-3 grid grid-cols-2">
            <TabsTrigger value="remaining">Remaining</TabsTrigger>
            <TabsTrigger value="added">Added</TabsTrigger>
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
                            title="Add to next empty class"
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
                        ? "All syllabus topics are on the roadmap."
                        : "No matches."}
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
              <p className="text-center text-sm text-muted-foreground py-8">Nothing assigned yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
