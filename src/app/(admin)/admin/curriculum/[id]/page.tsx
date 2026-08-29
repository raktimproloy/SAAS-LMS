"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Loader2, Undo2, Eye, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurriculumDraft } from "@/hooks/useCurriculumDraft";
import { topicKey } from "@/lib/curriculum-scheduler/types";
import { RoadmapHeader } from "@/components/admin/curriculum/roadmap/RoadmapHeader";
import { RoadmapTimeline } from "@/components/admin/curriculum/roadmap/RoadmapTimeline";
import { SyllabusPoolPanel } from "@/components/admin/curriculum/roadmap/SyllabusPoolPanel";
import { CurriculumSettingsSheet } from "@/components/admin/curriculum/roadmap/CurriculumSettingsSheet";
import {
  AddExamDialog,
  AddTopicDialog,
  ImpactPreviewDialog,
  PublishConfirmDialog,
} from "@/components/admin/curriculum/roadmap/dialogs";

export default function CurriculumPlannerPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const {
    curriculum,
    pool,
    progress,
    isLoading,
    error,
    saveStatus,
    actions,
    publish,
  } = useCurriculumDraft(id);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [headerHeight, setHeaderHeight] = useState(160);
  const [windowHeight, setWindowHeight] = useState(800);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight);
    }
    
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const asideRef = useRef<HTMLElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    
    const syncPos = () => {
      if (placeholderRef.current && asideRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        asideRef.current.style.left = `${rect.left}px`;
        asideRef.current.style.width = `${rect.width}px`;
      }
    };
    syncPos();
    window.addEventListener('resize', syncPos);
    
    const timer = setTimeout(() => {
      if (!headerRef.current) return;
      
      const observer = new ResizeObserver(() => {
        if (headerRef.current) {
          setHeaderHeight(headerRef.current.offsetHeight);
          syncPos();
        }
      });
      observer.observe(headerRef.current);
      
      setHeaderHeight(headerRef.current.offsetHeight);
      
      (headerRef as any)._observer = observer;
    }, 50);
    
    return () => {
      window.removeEventListener('resize', syncPos);
      clearTimeout(timer);
      if ((headerRef as any)._observer) {
        (headerRef as any)._observer.disconnect();
      }
    };
  }, [isLoading]);

  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | string | null>(null);
  const [examTarget, setExamTarget] = useState<string | number | null>(null);
  const [topicTarget, setTopicTarget] = useState<string | number | null>(null);
  const [impact, setImpact] = useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    try {
      const topicData = JSON.parse(result.draggableId);
      const destId = result.destination.droppableId.replace("session-", "");
      if (!result.destination.droppableId.startsWith("session-")) return;

      let sourceId: string | undefined;
      if (result.source.droppableId.startsWith("session-")) {
        sourceId = result.source.droppableId.replace("session-", "");
      }

      actions.moveTopic(topicData, destId, result.destination.index, sourceId);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publish();
      toast({ title: "প্রকাশ হয়েছে", description: "কারিকুলাম এখন চালু আছে।" });
      setPublishOpen(false);
    } catch {
      toast({ title: "সমস্যা হয়েছে", description: "প্রকাশ করা যায়নি।", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleFullCalendar = (checked: boolean) => {
    const cards = Array.from(document.querySelectorAll('.session-card-wrapper'));
    const headerEl = document.getElementById('curriculum-sticky-header');
    const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 208;
    const targetTop = headerBottom + 24;

    const topmost = cards.find(card => {
      const rect = card.getBoundingClientRect();
      return rect.top >= targetTop - 40; // -40 for a little leeway
    });
    const topmostId = topmost ? topmost.id : null;

    setShowFullCalendar(checked);

    if (topmostId) {
      setTimeout(() => {
        const el = document.getElementById(topmostId);
        const mainScroll = document.querySelector('main');
        if (el && mainScroll) {
          const rect = el.getBoundingClientRect();
          const distance = rect.top - targetTop;
          
          if (distance !== 0) {
            const startScroll = mainScroll.scrollTop;
            const duration = 600; // 600ms smooth animation
            let startTime: number | null = null;
            
            const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
            const animation = (currentTime: number) => {
              if (startTime === null) startTime = currentTime;
              const timeElapsed = currentTime - startTime;
              const progress = Math.min(timeElapsed / duration, 1);
              
              mainScroll.scrollTop = startScroll + distance * easeInOutQuad(progress);
              
              if (timeElapsed < duration) {
                requestAnimationFrame(animation);
              }
            };
            
            requestAnimationFrame(animation);
          }
        }
      }, 50); // slight delay to ensure DOM is updated
    }
  };

  const selectedTopicKeys = React.useMemo(() => {
    if (!selectedSessionId || !curriculum) return [];
    const session = curriculum.sessions.find(s => s.id === selectedSessionId);
    return (session?.topics || []).map(t => topicKey(t as any));
  }, [selectedSessionId, curriculum]);

  if (isLoading) {
    return (
      <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-6 space-y-4 sm:space-y-5 pb-36 sm:pb-32 lg:pb-28">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border shadow-sm">
          <div className="space-y-3 w-full lg:w-1/2">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <div className="pt-2">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-[72px] w-[90px] rounded-xl" />
            <Skeleton className="h-[72px] w-[70px] rounded-xl" />
            <Skeleton className="h-[72px] w-[70px] rounded-xl" />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 items-start w-full">
          <div className="flex-1 bg-background rounded-xl border shadow-sm p-3 sm:p-5 w-full min-w-0 space-y-6 sm:space-y-8">
            {/* Timeline Skeleton */}
            {[1, 2].map((month) => (
              <div key={month} className="space-y-3 sm:space-y-4">
                <Skeleton className="h-7 w-48 rounded-md" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 items-start">
                  {[1, 2, 3, 4, 5, 6].map((card) => (
                    <div
                      key={card}
                      className="h-[250px] flex flex-col border rounded-xl overflow-hidden shadow-sm bg-card"
                    >
                      <div className="py-3 px-4 border-b bg-muted/10 flex justify-between items-center">
                        <Skeleton className="h-5 w-28 rounded-md" />
                        <Skeleton className="h-5 w-16 rounded-md" />
                      </div>
                      <div className="p-4 space-y-3 flex-1 flex flex-col">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="hidden xl:block w-full xl:w-[320px] 2xl:w-[360px] shrink-0 sticky top-4 self-start">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </aside>
        </div>
      </div>
    );
  }

  if (error === "not_found") {
    router.push("/admin/curriculum");
    return null;
  }

  if (!curriculum) return null;

  return (
    <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 xl:px-6 pt-0 pb-[180px] sm:pb-[200px]">
      <div id="curriculum-sticky-header" ref={headerRef} className="sticky top-0 z-40 bg-background/95 backdrop-blur pb-2 pt-2 -mx-2 px-2 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6 xl:-mx-6 xl:px-6 border-b">
        <RoadmapHeader
          curriculum={curriculum}
          progress={progress}
          saveStatus={saveStatus}
          onSettings={() => setSettingsOpen(true)}
          showFullCalendar={showFullCalendar}
          onToggleFullCalendar={handleToggleFullCalendar}
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 items-start w-full pt-2">
          <div className="flex-1 bg-background rounded-xl border shadow-sm p-3 sm:p-5 w-full min-w-0">
            <RoadmapTimeline
              sessions={curriculum.sessions}
              curriculum={curriculum}
              showFullCalendar={showFullCalendar}
              selectedSessionId={selectedSessionId}
              onSelectSession={setSelectedSessionId}
              onRemoveTopic={actions.removeTopic}
              onSkip={(sid) =>
                setImpact({
                  title: "এই ক্লাস স্কিপ করবেন?",
                  description:
                    "এই দিনের টপিক আর পরের ক্লাসগুলো পরের খালি ক্লাসের দিনে চলে যাবে। অন্য ছুটি অপরিবর্তিত থাকবে।",
                  action: () => actions.skip(sid),
                })
              }
              onUnskip={actions.unskip}
              onDuplicateDay={actions.duplicateToNextRoutineDay}
              onAddDay={actions.insertDay}
              onRemoveDay={(sid) =>
                setImpact({
                  title: "এই দিনটা বাদ দেবেন?",
                  description: "এই দিনের টপিক পরের খালি ক্লাসে চলে যাবে।",
                  action: () => actions.removeDay(sid),
                })
              }
              onMarkCuti={(sid, name) =>
                setImpact({
                  title: "এই দিন ছুটি দেবেন?",
                  description: `${name} হিসেবে মার্ক হবে। টপিকগুলো পরে সরে যাবে; চাইলে পরে \"ক্লাস হবে\" দিয়ে ফিরিয়ে আনতে পারবেন।`,
                  action: () => actions.markHoliday(sid, name),
                })
              }
              onTeachHoliday={actions.teachOnHoliday}
              onAddExam={(sid) => setExamTarget(sid)}
              onAddTopic={(sid) => setTopicTarget(sid)}
              onMoveTopicEarlier={(sid, tid) => actions.moveTopicEarlier(sid, tid)}
              onMoveTopicLater={(sid, tid) => actions.moveTopicLater(sid, tid)}
              onShiftSessionEarlier={(sid) => actions.shiftSessionEarlier(sid)}
              onShiftSessionLater={(sid) => actions.shiftSessionLater(sid)}
            />
          </div>

          {/* Placeholder to maintain flex layout space */}
          <div ref={placeholderRef} className="hidden xl:block w-full xl:w-[360px] 2xl:w-[400px] shrink-0" />

          {/* Fixed Aside */}
          <aside 
            ref={asideRef}
            className="hidden xl:block shrink-0 z-20" 
            style={{ 
              position: 'fixed',
              top: `${headerHeight + 68}px`, // 60px Admin header + 8px gap
              bottom: `70px` // ~60px footer + 10px gap
            }}
          >
            <SyllabusPoolPanel
              pool={pool}
              selectedTopicKeys={selectedTopicKeys}
              onAddToNext={actions.addFromPool}
              onAutoFillRemaining={() => {
                setImpact({
                  title: "বাকি টপিক অটো বসাবেন?",
                  description:
                    "এখনকার টপিক মুছে বইয়ের সব টপিক আর অধ্যায় পরীক্ষা আবার সাজিয়ে বসবে।",
                  action: () => actions.autoFill(),
                });
              }}
            />
          </aside>
        </div>

        {/* Mobile / tablet syllabus pool FAB */}
        <Button
          type="button"
          size="lg"
          className="xl:hidden fixed bottom-[5.25rem] right-3 sm:right-4 z-40 shadow-lg gap-2 rounded-full h-12 px-4"
          onClick={() => setPoolOpen(true)}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">
            সিলেবাস
            {pool.remaining.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-primary-foreground/20 text-xs">
                {pool.remaining.length}
              </span>
            )}
          </span>
        </Button>

        <Sheet open={poolOpen} onOpenChange={setPoolOpen}>
          <SheetContent side="bottom" className="h-[min(85vh,640px)] p-0 rounded-t-xl flex flex-col">
            <SheetHeader className="px-4 pt-4 pb-2 border-b shrink-0">
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                সিলেবাস পুল
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 min-h-0 px-3 pb-4 pt-2">
              <SyllabusPoolPanel
                variant="embedded"
                className="border-0 shadow-none h-full"
                pool={pool}
                selectedTopicKeys={selectedTopicKeys}
                onAddToNext={(t) => {
                  actions.addFromPool(t);
                }}
                onAutoFillRemaining={() => {
                  setPoolOpen(false);
                  setImpact({
                    title: "বাকি টপিক অটো বসাবেন?",
                    description:
                      "এখনকার টপিক মুছে বইয়ের সব টপিক আর অধ্যায় পরীক্ষা আবার সাজিয়ে বসবে।",
                    action: () => actions.autoFill(),
                  });
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </DragDropContext>

      <div className="fixed bottom-0 left-0 right-0 md:left-[220px] lg:left-[260px] z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t px-3 sm:px-4 lg:px-6 xl:px-8 py-2.5 sm:py-3 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 max-w-full">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-1 flex-1 sm:flex-none" onClick={actions.undo}>
              <Undo2 className="w-4 h-4" /> আনডু
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() =>
                setImpact({
                  title: "সব টপিক মুছবেন?",
                  description: "সব ক্লাস থেকে টপিক সরে যাবে। দিনগুলো থাকবে।",
                  action: () => actions.clear(),
                })
              }
            >
              সব মুছুন
            </Button>
            {curriculum.is_public && curriculum.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 flex-1 sm:flex-none"
                onClick={() => window.open(`/student/roadmap/${id}`, "_blank")}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">স্টুডেন্ট ভিউ</span>
                <span className="sm:hidden">দেখুন</span>
              </Button>
            )}
          </div>
          <Button className="w-full sm:w-auto shrink-0" onClick={() => setPublishOpen(true)}>
            কারিকুলাম প্রকাশ করুন
          </Button>
        </div>
      </div>

      <CurriculumSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        curriculum={curriculum}
        onSave={(patch) => {
          if (patch.remapDays) {
            actions.changeClassDays(patch.class_days, patch.start_date, patch.end_date);
          } else {
            actions.updateMeta({
              title: patch.title,
              start_date: patch.start_date,
              end_date: patch.end_date,
              class_days: patch.class_days,
              is_public: patch.is_public,
            });
          }
          toast({ title: "সেটিংস আপডেট হয়েছে", description: "ব্যাকগ্রাউন্ডে সেভ হয়েছে।" });
        }}
      />

      <AddExamDialog
        open={examTarget !== null}
        onOpenChange={(o) => !o && setExamTarget(null)}
        onConfirm={(title) => {
          if (examTarget !== null) actions.addExam(examTarget, title);
        }}
      />

      <AddTopicDialog
        open={topicTarget !== null}
        onOpenChange={(o) => !o && setTopicTarget(null)}
        onConfirm={(data) => {
          if (topicTarget !== null) {
            actions.addCustomTopic(topicTarget, {
              chapter_name: data.chapter_name,
              topic_name: data.topic_name || null,
              size: 1,
              is_custom: true,
            });
          }
        }}
      />

      <ImpactPreviewDialog
        open={!!impact}
        onOpenChange={(o) => !o && setImpact(null)}
        title={impact?.title || ""}
        description={impact?.description || ""}
        onConfirm={() => impact?.action()}
      />

      <PublishConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onConfirm={handlePublish}
        isPublishing={isPublishing}
        stats={{
          classes: curriculum.sessions.filter((s) => s.session_type === "class").length,
          exams: progress?.exams || 0,
          holidays: progress?.holidays || 0,
          skipped: progress?.skipped || 0,
        }}
      />
    </div>
  );
}
