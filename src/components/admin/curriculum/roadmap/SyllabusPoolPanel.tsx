"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
  onClose?: () => void;
};

export function SyllabusPoolPanel({
  pool,
  onAddToNext,
  onAutoFillRemaining,
  selectedTopicKeys = [],
  variant = "sidebar",
  className = "",
  onClose,
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTopicKeys.length > 0 && scrollContainerRef.current) {
      const firstKey = selectedTopicKeys[0];
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        // Escape key to handle spaces or special characters safely
        const escapedKey = CSS.escape(firstKey);
        const el = container.querySelector(`[data-topic-key="${escapedKey}"]`) as HTMLElement;
        
        if (el) {
          // Precise scrolling within the container ONLY to avoid page jumps
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          
          // Guarantee smooth scroll behavior with a custom animation function
          const startScroll = container.scrollTop;
          const targetScroll = startScroll + (elRect.top - containerRect.top) - (containerRect.height / 2) + (elRect.height / 2);
          const distance = targetScroll - startScroll;
          const duration = 800; // 800ms for a pronounced motion animation
          let startTime: number | null = null;
          
          const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          
          const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            container.scrollTop = startScroll + distance * easeInOutQuad(progress);
            
            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };
          
          requestAnimationFrame(animation);
          
          el.classList.add("ring-2", "ring-primary", "ring-offset-2", "transition-all", "duration-500", "scale-[1.02]", "bg-primary/10");
          setTimeout(() => el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "scale-[1.02]", "bg-primary/10"), 1800);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTopicKeys]);

  return (
    <Card
      className={`flex flex-col min-h-0 ${
        isSidebar ? "h-full" : "h-full min-h-0"
      } ${className}`}
    >
      <CardHeader className="pb-3 border-b space-y-3 sticky top-0 z-30 bg-card/90 backdrop-blur-md rounded-t-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-all">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground/90">
            <BookOpen className="w-4 h-4 text-primary" />
            সিলেবাস পুল
          </CardTitle>
          <div className="flex gap-1.5 items-center">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{pool.assigned.length} টি যোগ</Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{pool.remaining.length} টি বাকি</Badge>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 hover:bg-destructive/10 hover:text-destructive" onClick={onClose} title="সিলেবাস পুল বন্ধ করুন">
                <Check className="w-3 h-3 hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="টপিক খুঁজুন…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {pool.remaining.length > 0 && (
          <Button size="sm" variant="outline" className="w-full" onClick={onAutoFillRemaining}>
            বাকিগুলো অটো বসান
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col relative z-0">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 scroll-smooth">
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
                          data-topic-key={topic.key}
                          className={`flex items-start gap-2 p-2.5 border rounded-lg transition-all duration-200 text-sm ${
                            snapshot.isDragging 
                              ? "shadow-lg border-primary bg-background scale-[1.02] z-50" 
                              : isActive
                                ? "border-green-400 bg-green-50 shadow-sm ring-1 ring-green-400/50 dark:bg-green-900/40 dark:border-green-600 dark:ring-green-600"
                                : isAssigned
                                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm transition-opacity"
                                  : "bg-background hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold truncate ${isActive ? 'text-green-950 dark:text-green-300' : isAssigned ? 'text-emerald-950 dark:text-emerald-300' : 'text-foreground'}`}>
                              {topic.chapter_name}
                            </p>
                            {topic.topic_name && (
                              <p className={`text-xs font-medium truncate mt-0.5 ${isActive ? 'text-green-900 dark:text-green-400' : isAssigned ? 'text-emerald-900 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                {topic.topic_name}
                              </p>
                            )}
                            <p className={`text-[10px] font-medium mt-1.5 ${isActive ? 'text-green-700 dark:text-green-500' : isAssigned ? 'text-emerald-700 dark:text-emerald-500' : 'text-muted-foreground/70 dark:text-muted-foreground'}`}>
                              {topic.book_label || topic.subject}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            {isAssigned && (
                              <div className="flex items-center justify-center" title="ইতিমধ্যে যোগ করা হয়েছে">
                                <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-green-500 dark:text-green-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
                              </div>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0 hover:bg-primary/10 hover:text-primary"
                              title="যোগ করুন"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToNext(topic);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
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
