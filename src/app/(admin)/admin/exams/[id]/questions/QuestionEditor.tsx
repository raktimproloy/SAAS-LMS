"use client";

import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Plus, FileDown, UploadCloud, Type, Trash2, Check, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Option {
  id: string;
  text: string;
  image_url?: string;
}

export interface Question {
  id?: number | string;
  type: string;
  question_text: string;
  image_url?: string;
  image_urls?: string[];
  options?: Option[];
  correct_option?: string;
  marks?: number;
  explanation?: string;
  sort_order: number;
  parent_id?: number | string | null;
  children?: Question[];
  isNew?: boolean;
}

export default function QuestionEditor({ examId, initialQuestions, defaultMark, initialStatus }: { examId: string, initialQuestions: Question[], defaultMark?: number, initialStatus?: string }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [examStatus, setExamStatus] = useState(initialStatus || 'inactive');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save logic
  useEffect(() => {
    // Avoid saving on initial load if empty or just loaded without changes
    if (questions.length === 0 && initialQuestions.length === 0) return;
    
    const timer = setTimeout(() => {
      saveBulk(questions);
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    if (type === "group") {
      const reordered = Array.from(questions);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      
      const updated = reordered.map((q, idx) => ({ ...q, sort_order: idx }));
      setQuestions(updated);
    } else {
      const parentId = parseInt(source.droppableId);
      const parentIndex = questions.findIndex(q => q.id === parentId);
      if (parentIndex === -1) return;

      const parent = questions[parentIndex];
      const children = Array.from(parent.children || []);
      const [moved] = children.splice(source.index, 1);
      children.splice(destination.index, 0, moved);

      const updatedChildren = children.map((c, idx) => ({ ...c, sort_order: idx }));
      const newQuestions = [...questions];
      newQuestions[parentIndex] = { ...parent, children: updatedChildren };
      
      setQuestions(newQuestions);
    }
  };

  const saveBulk = async (qs: Question[]) => {
    setIsSaving(true);
    try {
      const toSave = qs.map(q => ({
        ...q
      }));
      const res = await fetch(`/api/admin/exams/${examId}/questions/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: toSave })
      });
      const data = await res.json();
      
      if (data.idMap && Object.keys(data.idMap).length > 0) {
        setQuestions(prev => prev.map(q => {
          const newQ = { ...q };
          if (typeof q.id === 'string' && data.idMap[q.id]) {
            newQ.id = data.idMap[q.id];
          }
          if (newQ.children) {
            newQ.children = newQ.children.map(cq => {
              if (typeof cq.id === 'string' && data.idMap[cq.id]) {
                return { ...cq, id: data.idMap[cq.id] };
              }
              return cq;
            });
          }
          return newQ;
        }));
      }

      setLastSaved(new Date());
    } catch (e) {
      console.error(e);
      // alert("Failed to save"); (Silencing for autosave)
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuestionApi = async (id: number | string) => {
    if (typeof id === 'string') return; // Not saved to DB yet
    try {
      await fetch(`/api/admin/exams/${examId}/questions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error("Failed to delete question", e);
    }
  };

  const handleToggleExamStatus = async () => {
    const previousStatus = examStatus;
    const newStatus = examStatus === "active" ? "inactive" : "active";
    
    // Optimistic UI update
    setExamStatus(newStatus);
    
    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        setExamStatus(previousStatus); // Revert
        alert("Failed to change exam status");
      }
    } catch (err) {
      console.error(err);
      setExamStatus(previousStatus); // Revert
      alert("Failed to change exam status");
    }
  };

  const handleAddMCQ = (parentId: number | string | null = null) => {
    const newId = `new_${Date.now()}`;
    const newQ: Question = {
      id: newId,
      type: "mcq",
      question_text: "",
      options: [
        { id: "1", text: "" },
        { id: "2", text: "" },
        { id: "3", text: "" },
        { id: "4", text: "" },
      ],
      correct_option: "1",
      marks: defaultMark ?? 1,
      sort_order: parentId ? 0 : questions.length,
      parent_id: parentId,
      isNew: true
    };

    if (parentId) {
      setQuestions(questions.map(q => {
        if (q.id === parentId) {
          return { ...q, children: [...(q.children || []), { ...newQ, sort_order: (q.children?.length || 0) }] };
        }
        return q;
      }));
    } else {
      setQuestions([...questions, newQ]);
    }
  };

  const handleAddPassage = () => {
    const newId = `new_${Date.now()}`;
    const childId = `new_${Date.now()}_child`;
    
    const newChild: Question = {
      id: childId,
      type: "mcq",
      question_text: "",
      options: [
        { id: "1", text: "" },
        { id: "2", text: "" },
        { id: "3", text: "" },
        { id: "4", text: "" },
      ],
      correct_option: "1",
      marks: defaultMark ?? 1,
      sort_order: 0,
      parent_id: newId,
      isNew: true
    };

    const newQ: Question = {
      id: newId,
      type: "passage",
      question_text: "",
      marks: 0,
      sort_order: questions.length,
      children: [newChild],
      isNew: true
    };
    setQuestions([...questions, newQ]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/exams/${examId}/questions/upload`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        alert("Questions uploaded successfully!");
        window.location.reload();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSingleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/upload`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (err) {
      console.error(err);
    }
    alert("Image upload failed");
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Sticky Header Panel */}
      <div className="sticky -top-4 lg:-top-6 z-50 flex flex-col md:flex-row gap-4 py-3 px-4 lg:px-6 bg-background border-b shadow-sm justify-between items-start md:items-center -mx-4 lg:-mx-6 mb-6">
        
        {/* Left Side: Actions & Stats */}
        <div className="flex items-center flex-wrap gap-4">
          <Button variant="outline" size="sm" onClick={() => window.open("/api/admin/exams/template?type=xlsx", "_blank")}>
            <FileDown className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Download Template</span>
          </Button>
          
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx,.csv,.docx" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button variant="secondary" size="sm" disabled={isUploading}>
              <UploadCloud className="mr-2 h-4 w-4" /> {isUploading ? "Uploading..." : <span className="hidden sm:inline">Upload File</span>}
            </Button>
          </div>
          
          <div className="hidden md:block h-6 w-px bg-border mx-1"></div>
          
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            <span className="text-foreground">{questions.length}</span> blocks
          </div>
        </div>
        
        {/* Right Side: Toggles & Save Status */}
        <div className="flex items-center flex-wrap gap-6 w-full md:w-auto justify-between md:justify-end">
          
          {/* Exam Status Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground cursor-default">Status: {examStatus === "active" ? "Active" : "Inactive"}</span>
            <Switch 
              checked={examStatus === "active"} 
              onCheckedChange={handleToggleExamStatus}
            />
          </div>

          {/* Save Status */}
          <div className="flex items-center min-w-[100px] justify-end">
            {isSaving ? (
              <span className="animate-pulse text-amber-500 font-medium text-xs bg-amber-500/10 px-2 py-1 rounded-md whitespace-nowrap">Saving...</span>
            ) : lastSaved ? (
              <span className="text-emerald-600 font-medium text-xs bg-emerald-500/10 px-2 py-1 rounded-md whitespace-nowrap">Saved</span>
            ) : null}
          </div>

        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions-list" type="group">
          {(provided) => {
            let questionCounter = 1;
            let passageCounter = 1;
            const numberMap: Record<string | number, string> = {};
            
            questions.forEach((q) => {
              const qIdStr = q.id?.toString() || Math.random().toString();
              if (q.type === 'passage') {
                numberMap[qIdStr] = `Passage Block ${passageCounter++}`;
                q.children?.forEach(cq => {
                  const cqIdStr = cq.id?.toString() || Math.random().toString();
                  numberMap[cqIdStr] = `Question ${questionCounter++}`;
                });
              } else {
                numberMap[qIdStr] = `Question ${questionCounter++}`;
              }
            });

            return (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {questions.map((q, index) => {
                  const qIdStr = q.id?.toString() || "";
                  
                  return (
                    <Draggable key={q.id?.toString() || index.toString()} draggableId={q.id?.toString() || index.toString()} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-card border rounded-lg shadow-sm">
                          <div className="p-2 border-b bg-muted/20 flex items-center justify-between cursor-grab" {...provided.dragHandleProps}>
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline">{numberMap[qIdStr]}</Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              onClick={() => {
                                if (window.confirm('Delete this question?')) {
                                  if (q.id) deleteQuestionApi(q.id);
                                  const newQs = structuredClone(questions);
                                  newQs.splice(index, 1);
                                  setQuestions(newQs);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-4">
                            <div className="mb-4 space-y-2">
                              <Textarea 
                                value={q.question_text} 
                                onChange={(e) => {
                                  const newQs = structuredClone(questions);
                                  newQs[index].question_text = e.target.value;
                                  setQuestions(newQs);
                                }}
                                placeholder={q.type === 'passage' ? "Enter passage text..." : "Enter question text..."}
                                className="min-h-[100px] rounded-sm resize-y"
                              />
                              
                              {/* Legacy single image */}
                              {q.image_url && (!q.image_urls || q.image_urls.length === 0) && (
                                <div className="relative inline-block border rounded-md overflow-hidden bg-muted/30 p-1 mb-2">
                                  <img src={q.image_url} alt="Question" className="max-h-48 object-contain" />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                                    onClick={() => {
                                      const newQs = structuredClone(questions);
                                      newQs[index].image_url = undefined;
                                      setQuestions(newQs);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              
                              {/* Multiple images array */}
                              {q.image_urls && q.image_urls.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {q.image_urls.map((url, imgIdx) => (
                                    <div key={imgIdx} className="relative inline-block border rounded-md overflow-hidden bg-muted/30 p-1">
                                      <img src={url} alt={`Question image ${imgIdx + 1}`} className="max-h-48 object-contain" />
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                                        onClick={() => {
                                          const newQs = structuredClone(questions);
                                          newQs[index].image_urls?.splice(imgIdx, 1);
                                          setQuestions(newQs);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`q-img-${index}`}
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await handleSingleImageUpload(file);
                                      if (url) {
                                        const newQs = structuredClone(questions);
                                        if (!newQs[index].image_urls) {
                                          newQs[index].image_urls = [];
                                        }
                                        // Migration from old single image logic on first new image upload
                                        if (newQs[index].image_url && newQs[index].image_urls!.length === 0) {
                                          newQs[index].image_urls!.push(newQs[index].image_url as string);
                                          newQs[index].image_url = undefined;
                                        }
                                        newQs[index].image_urls!.push(url);
                                        setQuestions(newQs);
                                      }
                                    }
                                    e.target.value = '';
                                  }}
                                />
                                <Label htmlFor={`q-img-${index}`} className="cursor-pointer inline-flex items-center justify-center h-10 px-4 mt-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium gap-2">
                                  <ImagePlus className="h-4 w-4 text-muted-foreground" /> Add Image
                                </Label>
                              </div>
                            </div>
                            
                            {q.type === 'mcq' && q.options && (
                              <div className="space-y-4 pt-2 border-t border-muted mt-4">
                                <h4 className="text-sm font-medium text-muted-foreground px-1">Options</h4>
                                {q.options.map((opt, oIdx) => (
                                  <div key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                    q.correct_option === opt.id 
                                      ? 'border-green-500 bg-green-500/5 dark:bg-green-500/10' 
                                      : 'border-border bg-background hover:border-muted-foreground/30'
                                  }`}>
                                    <div className="flex flex-col gap-2 mt-1 shrink-0">
                                      <button
                                        type="button"
                                        title="Mark as correct option"
                                        onClick={() => {
                                          const newQs = structuredClone(questions);
                                          newQs[index].correct_option = opt.id;
                                          setQuestions(newQs);
                                        }}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg border font-bold text-sm transition-all cursor-pointer ${
                                          q.correct_option === opt.id 
                                            ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/30" 
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:bg-green-500/10 hover:text-green-500"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIdx)}
                                      </button>
                                    </div>
                                    <div className="flex flex-col flex-1 gap-3">
                                      <div className="flex items-center gap-2 w-full">
                                        <Input 
                                          value={opt.text}
                                          placeholder="Option text..."
                                          onChange={(e) => {
                                            const newQs = structuredClone(questions);
                                            if (newQs[index].options) {
                                              newQs[index].options![oIdx].text = e.target.value;
                                            }
                                            setQuestions(newQs);
                                          }}
                                          className={`flex-1 ${q.correct_option === opt.id ? "border-green-500/50 focus-visible:ring-green-500/30" : ""}`}
                                        />
                                        {!opt.image_url && (
                                          <div className="flex shrink-0">
                                             <input
                                               type="file"
                                               accept="image/*"
                                               id={`opt-img-${index}-${oIdx}`}
                                               className="hidden"
                                               onChange={async (e) => {
                                                 const file = e.target.files?.[0];
                                                 if (file) {
                                                   const url = await handleSingleImageUpload(file);
                                                   if (url) {
                                                     const newQs = structuredClone(questions);
                                                     if (newQs[index].options) {
                                                       newQs[index].options![oIdx].image_url = url;
                                                     }
                                                     setQuestions(newQs);
                                                   }
                                                 }
                                                 e.target.value = '';
                                               }}
                                             />
                                             <Label htmlFor={`opt-img-${index}-${oIdx}`} className="cursor-pointer inline-flex items-center justify-center h-10 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium gap-2">
                                               <ImagePlus className="h-4 w-4 text-muted-foreground" /> <span className="hidden sm:inline">Image</span>
                                             </Label>
                                          </div>
                                        )}
                                        <Button 
                                          variant="outline" 
                                          size="icon"
                                          className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 shrink-0"
                                          onClick={() => {
                                            const newQs = structuredClone(questions);
                                            newQs[index].options?.splice(oIdx, 1);
                                            setQuestions(newQs);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      {opt.image_url && (
                                        <div className="relative inline-block border rounded-md overflow-hidden bg-muted/30 p-1 self-start">
                                          <img src={opt.image_url} alt="Option" className="max-h-32 object-contain rounded" />
                                          <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                                            onClick={() => {
                                              const newQs = structuredClone(questions);
                                              if (newQs[index].options) {
                                                newQs[index].options![oIdx].image_url = undefined;
                                              }
                                              setQuestions(newQs);
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2 w-full border-dashed"
                                  onClick={() => {
                                    const newQs = structuredClone(questions);
                                    const newOptId = Date.now().toString();
                                    newQs[index].options?.push({ id: newOptId, text: "" });
                                    setQuestions(newQs);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" /> Add Option
                                </Button>
                              </div>
                            )}
                            
                            {q.type !== 'passage' && (
                              <div className="mt-6 flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-muted/30 border border-muted">
                                 <div className="w-full sm:w-32">
                                   <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Marks</Label>
                                   <Input 
                                     type="number" 
                                     step="0.5" 
                                     className="bg-background"
                                     value={q.marks || 0} 
                                     onChange={(e) => {
                                       const newQs = structuredClone(questions);
                                       newQs[index].marks = parseFloat(e.target.value);
                                       setQuestions(newQs);
                                     }}
                                   />
                                 </div>
                                 <div className="flex-1">
                                   <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Explanation / Solution</Label>
                                   <Input 
                                     className="bg-background"
                                     value={q.explanation || ""} 
                                     onChange={(e) => {
                                       const newQs = structuredClone(questions);
                                       newQs[index].explanation = e.target.value;
                                       setQuestions(newQs);
                                     }}
                                     placeholder="Add explanation..."
                                   />
                                 </div>
                              </div>
                            )}

                            {q.type === 'passage' && (
                              <div className="mt-6 border rounded-md p-4 bg-muted/10">
                                <h4 className="text-sm font-medium mb-4 flex items-center justify-between">
                                  Questions in this Passage
                                </h4>
                                
                                {q.children?.map((cq, cIdx) => {
                                  const cqIdStr = cq.id?.toString() || "";
                                  return (
                                    <div key={cq.id} className="mb-6 p-4 rounded-lg border bg-background shadow-sm">
                                      <div className="flex justify-between items-center mb-4">
                                        <Badge variant="secondary" className="px-3 py-1">{numberMap[cqIdStr]}</Badge>
                                        <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                          if (window.confirm('Delete this child question?')) {
                                            if (cq.id) deleteQuestionApi(cq.id);
                                            const newQs = structuredClone(questions);
                                            newQs[index].children?.splice(cIdx, 1);
                                            setQuestions(newQs);
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="mb-4 space-y-2">
                                       <Textarea 
                                         value={cq.question_text} 
                                         onChange={(e) => {
                                           const newQs = structuredClone(questions);
                                           newQs[index].children![cIdx].question_text = e.target.value;
                                           setQuestions(newQs);
                                         }} 
                                         placeholder="Enter child question text..."
                                         className="min-h-[100px] rounded-sm resize-y"
                                       />
                                       
                                       {/* Legacy single image */}
                                       {cq.image_url && (!cq.image_urls || cq.image_urls.length === 0) && (
                                         <div className="relative inline-block border rounded-md overflow-hidden bg-muted/30 p-1 mb-2">
                                           <img src={cq.image_url} alt="Question" className="max-h-48 object-contain" />
                                           <Button
                                             variant="destructive"
                                             size="icon"
                                             className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                                             onClick={() => {
                                               const newQs = structuredClone(questions);
                                               newQs[index].children![cIdx].image_url = undefined;
                                               setQuestions(newQs);
                                             }}
                                           >
                                             <X className="h-3 w-3" />
                                           </Button>
                                         </div>
                                       )}
                                       
                                       {/* Multiple images array */}
                                       {cq.image_urls && cq.image_urls.length > 0 && (
                                         <div className="flex flex-wrap gap-2 mb-2">
                                           {cq.image_urls.map((url, imgIdx) => (
                                             <div key={imgIdx} className="relative inline-block border rounded-md overflow-hidden bg-muted/30 p-1">
                                               <img src={url} alt={`Child question image ${imgIdx + 1}`} className="max-h-48 object-contain" />
                                               <Button
                                                 variant="destructive"
                                                 size="icon"
                                                 className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                                                 onClick={() => {
                                                   const newQs = structuredClone(questions);
                                                   newQs[index].children![cIdx].image_urls?.splice(imgIdx, 1);
                                                   setQuestions(newQs);
                                                 }}
                                               >
                                                 <X className="h-3 w-3" />
                                               </Button>
                                             </div>
                                           ))}
                                         </div>
                                       )}

                                       <div>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            id={`cq-img-${index}-${cIdx}`}
                                            className="hidden"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const url = await handleSingleImageUpload(file);
                                                if (url) {
                                                  const newQs = structuredClone(questions);
                                                  if (!newQs[index].children![cIdx].image_urls) {
                                                    newQs[index].children![cIdx].image_urls = [];
                                                  }
                                                  // Migration from old single image logic on first new image upload
                                                  if (newQs[index].children![cIdx].image_url && newQs[index].children![cIdx].image_urls!.length === 0) {
                                                    newQs[index].children![cIdx].image_urls!.push(newQs[index].children![cIdx].image_url as string);
                                                    newQs[index].children![cIdx].image_url = undefined;
                                                  }
                                                  newQs[index].children![cIdx].image_urls!.push(url);
                                                  setQuestions(newQs);
                                                }
                                              }
                                              e.target.value = '';
                                            }}
                                          />
                                          <Label htmlFor={`cq-img-${index}-${cIdx}`} className="cursor-pointer inline-flex items-center justify-center h-10 px-4 mt-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium gap-2">
                                            <ImagePlus className="h-4 w-4 text-muted-foreground" /> Add Image
                                          </Label>
                                       </div>
                                     </div>
                                    
                                    {cq.options && (
                                      <div className="space-y-4 pt-2 border-t border-muted mt-4">
                                        <h4 className="text-sm font-medium text-muted-foreground px-1">Options</h4>
                                        {cq.options.map((opt, oIdx) => (
                                          <div key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                            cq.correct_option === opt.id 
                                              ? 'border-green-500 bg-green-500/5 dark:bg-green-500/10' 
                                              : 'border-border bg-background hover:border-muted-foreground/30'
                                          }`}>
                                            <div className="flex flex-col gap-2 mt-1 shrink-0">
                                              <button
                                                type="button"
                                                title="Mark as correct option"
                                                onClick={() => {
                                                  const newQs = structuredClone(questions);
                                                  newQs[index].children![cIdx].correct_option = opt.id;
                                                  setQuestions(newQs);
                                                }}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg border font-bold text-sm transition-all cursor-pointer ${
                                                  cq.correct_option === opt.id 
                                                    ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/30" 
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:bg-green-500/10 hover:text-green-500"
                                                }`}
                                              >
                                                {String.fromCharCode(65 + oIdx)}
                                              </button>
                                            </div>
                                            <div className="flex flex-col flex-1 gap-3">
                                              <div className="flex items-center gap-2 w-full">
                                                <Input 
                                                  value={opt.text}
                                                  placeholder="Option text..."
                                                  onChange={(e) => {
                                                    const newQs = structuredClone(questions);
                                                    if (newQs[index].children![cIdx].options) {
                                                      newQs[index].children![cIdx].options![oIdx].text = e.target.value;
                                                    }
                                                    setQuestions(newQs);
                                                  }}
                                                  className={`flex-1 ${cq.correct_option === opt.id ? "border-green-500/50 focus-visible:ring-green-500/30" : ""}`}
                                                />
                                                {!opt.image_url && (
                                                  <div className="flex shrink-0">
                                                     <input
                                                       type="file"
                                                       accept="image/*"
                                                       id={`cq-img-${index}-${cIdx}-${oIdx}`}
                                                       className="hidden"
                                                       onChange={async (e) => {
                                                         const file = e.target.files?.[0];
                                                         if (file) {
                                                           const url = await handleSingleImageUpload(file);
                                                           if (url) {
                                                             const newQs = structuredClone(questions);
                                                             if (newQs[index].children![cIdx].options) {
                                                               newQs[index].children![cIdx].options![oIdx].image_url = url;
                                                             }
                                                             setQuestions(newQs);
                                                           }
                                                         }
                                                         e.target.value = '';
                                                       }}
                                                     />
                                                     <Label htmlFor={`cq-img-${index}-${cIdx}-${oIdx}`} className="cursor-pointer inline-flex items-center justify-center h-10 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium gap-2">
                                                       <ImagePlus className="h-4 w-4 text-muted-foreground" /> <span className="hidden sm:inline">Image</span>
                                                     </Label>
                                                  </div>
                                                )}
                                                <Button 
                                                  variant="outline" 
                                                  size="icon"
                                                  className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 shrink-0"
                                                  onClick={() => {
                                                    const newQs = structuredClone(questions);
                                                    newQs[index].children![cIdx].options?.splice(oIdx, 1);
                                                    setQuestions(newQs);
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                              {opt.image_url && (
                                                <div className="relative inline-block border rounded-md overflow-hidden bg-muted/30 p-1 self-start">
                                                  <img src={opt.image_url} alt="Option" className="max-h-32 object-contain rounded" />
                                                  <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                                                    onClick={() => {
                                                      const newQs = structuredClone(questions);
                                                      if (newQs[index].children![cIdx].options) {
                                                        newQs[index].children![cIdx].options![oIdx].image_url = undefined;
                                                      }
                                                      setQuestions(newQs);
                                                    }}
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="mt-2 w-full border-dashed"
                                          onClick={() => {
                                            const newQs = structuredClone(questions);
                                            const newOptId = Date.now().toString();
                                            newQs[index].children![cIdx].options?.push({ id: newOptId, text: "" });
                                            setQuestions(newQs);
                                          }}
                                        >
                                          <Plus className="h-4 w-4 mr-2" /> Add Option
                                        </Button>
                                      </div>
                                    )}

                                     <div className="mt-6 flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-muted/30 border border-muted">
                                        <div className="w-full sm:w-32">
                                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Marks</Label>
                                          <Input 
                                            type="number" 
                                            step="0.5" 
                                            className="bg-background"
                                            value={cq.marks || 0} 
                                            onChange={(e) => {
                                              const newQs = structuredClone(questions);
                                              newQs[index].children![cIdx].marks = parseFloat(e.target.value);
                                              setQuestions(newQs);
                                            }}
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Explanation / Solution</Label>
                                          <Input 
                                            className="bg-background"
                                            value={cq.explanation || ""} 
                                            onChange={(e) => {
                                              const newQs = structuredClone(questions);
                                              newQs[index].children![cIdx].explanation = e.target.value;
                                              setQuestions(newQs);
                                            }}
                                            placeholder="Add explanation..."
                                          />
                                        </div>
                                     </div>
                                    </div>
                                  );
                                })}
                                <div className="mt-4 pt-4 border-t border-dashed flex justify-center">
                                  <Button variant="outline" onClick={() => handleAddMCQ(q.id)} className="w-full max-w-sm border-dashed">
                                    <Plus className="h-4 w-4 mr-2" /> Add another child MCQ
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>

      <div className="flex flex-wrap gap-3 p-4 bg-muted/10 rounded-lg border border-dashed justify-center items-center mt-4">
        <Button onClick={() => handleAddPassage()} variant="secondary" size="lg">
          <Type className="mr-2 h-5 w-5" /> Add Passage (MCQ Group)
        </Button>
        <Button onClick={() => handleAddMCQ()} size="lg">
          <Plus className="mr-2 h-5 w-5" /> Add Single MCQ
        </Button>
      </div>
    </div>
  );
}
