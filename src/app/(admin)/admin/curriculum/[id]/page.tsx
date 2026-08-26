"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Loader2, Undo2, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurriculumDraft } from "@/hooks/useCurriculumDraft";
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
  const [publishOpen, setPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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
      toast({ title: "Published", description: "Curriculum is now active." });
      setPublishOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to publish.", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error === "not_found") {
    router.push("/admin/curriculum");
    return null;
  }

  if (!curriculum) return null;

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-5 pb-28">
      <RoadmapHeader
        curriculum={curriculum}
        progress={progress}
        saveStatus={saveStatus}
        onSettings={() => setSettingsOpen(true)}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          <div className="flex-1 bg-background rounded-xl border shadow-sm p-5 w-full min-w-0">
            <RoadmapTimeline
              sessions={curriculum.sessions}
              onRemoveTopic={actions.removeTopic}
              onSkip={(sid) =>
                setImpact({
                  title: "Skip this class?",
                  description:
                    "Ei diner topics + porer class gula next teachable dine chole jabe. Onno cuti untouched thakbe.",
                  action: () => actions.skip(sid),
                })
              }
              onUnskip={actions.unskip}
              onAddDay={actions.insertDay}
              onRemoveDay={(sid) =>
                setImpact({
                  title: "Remove this day?",
                  description: "Ei diner topics next available class e chole jabe.",
                  action: () => actions.removeDay(sid),
                })
              }
              onMarkCuti={(sid, name) =>
                setImpact({
                  title: "Ei din cuti diben?",
                  description: `${name} hishebe mark hobe. Topics pore chole jabe; chaile pore \"Class hobe\" diye ferot ante parben.`,
                  action: () => actions.markHoliday(sid, name),
                })
              }
              onTeachHoliday={actions.teachOnHoliday}
              onAddExam={(sid) => setExamTarget(sid)}
              onAddTopic={(sid) => setTopicTarget(sid)}
              onMoveTopicEarlier={(sid, tid) => actions.moveTopicEarlier(sid, tid)}
              onMoveTopicLater={(sid, tid) => actions.moveTopicLater(sid, tid)}
            />
          </div>

          <div className="hidden lg:block w-[360px] shrink-0">
            <SyllabusPoolPanel
              pool={pool}
              onAddToNext={actions.addFromPool}
              onAutoFillRemaining={() => {
                setImpact({
                  title: "Auto-fill remaining?",
                  description:
                    "Clears current topics and redistributes all book topics with chapter exams.",
                  action: () => actions.autoFill(),
                });
              }}
            />
          </div>
        </div>
      </DragDropContext>

      {/* Mobile remaining quick-add */}
      <div className="lg:hidden">
        <details className="border rounded-xl bg-background p-4">
          <summary className="font-semibold cursor-pointer">
            Remaining topics ({pool.remaining.length})
          </summary>
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {pool.remaining.slice(0, 40).map((t) => (
              <div
                key={t.key}
                className="flex items-center justify-between gap-2 text-sm border rounded-md p-2"
              >
                <span className="truncate">
                  {t.chapter_name}
                  {t.topic_name ? ` — ${t.topic_name}` : ""}
                </span>
                <Button size="sm" variant="outline" onClick={() => actions.addFromPool(t)}>
                  Add
                </Button>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t px-4 py-3 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-1" onClick={actions.undo}>
            <Undo2 className="w-4 h-4" /> Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setImpact({
                title: "Clear all topics?",
                description: "Removes topics from every session. Days stay intact.",
                action: () => actions.clear(),
              })
            }
          >
            Clear
          </Button>
          {curriculum.is_public && curriculum.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => window.open(`/student/roadmap/${id}`, "_blank")}
            >
              <Eye className="w-4 h-4" /> Student view
            </Button>
          )}
        </div>
        <Button onClick={() => setPublishOpen(true)}>Publish Curriculum</Button>
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
          toast({ title: "Settings updated", description: "Saved in the background." });
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
