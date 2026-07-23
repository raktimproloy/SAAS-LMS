"use client";

import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Plus, FileDown, UploadCloud, Type, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  text: string;
}

export interface Question {
  id?: number | string;
  type: string;
  question_text: string;
  options?: Option[];
  correct_option?: string;
  marks?: number;
  explanation?: string;
  sort_order: number;
  parent_id?: number | string | null;
  children?: Question[];
  isNew?: boolean;
}

export default function QuestionEditor({ examId, initialQuestions, defaultMark }: { examId: string, initialQuestions: Question[], defaultMark?: number }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save logic
  useEffect(() => {
    // Avoid saving on initial load if empty or just loaded without changes
    // But since this is a simple implementation, a debounced save on any change is fine
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
    const newQ: Question = {
      id: newId,
      type: "passage",
      question_text: "",
      marks: 0,
      sort_order: questions.length,
      children: [],
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
        <Button variant="outline" onClick={() => window.open("/api/admin/exams/template?type=xlsx", "_blank")}>
          <FileDown className="mr-2 h-4 w-4" /> Download Template
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
          <Button variant="secondary" disabled={isUploading}>
            <UploadCloud className="mr-2 h-4 w-4" /> {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
        <div className="flex-1" />
        <Button onClick={() => handleAddPassage()} variant="secondary">
          <Type className="mr-2 h-4 w-4" /> Add Passage (MCQ Group)
        </Button>
        <Button onClick={() => handleAddMCQ()}>
          <Plus className="mr-2 h-4 w-4" /> Add Single MCQ
        </Button>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>{questions.length} total blocks</div>
        <div className="flex items-center gap-2">
          {isSaving && <span className="animate-pulse text-amber-500">Saving changes...</span>}
          {lastSaved && !isSaving && <span className="text-green-600">Saved</span>}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="root" type="group">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {questions.map((q, index) => (
                <Draggable key={q.id} draggableId={q.id?.toString() || `q-${index}`} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="bg-card border rounded-lg shadow-sm">
                      <div className="p-2 border-b bg-muted/20 flex items-center justify-between cursor-grab" {...provided.dragHandleProps}>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{q.type === 'passage' ? 'Passage Block' : 'MCQ'}</Badge>
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
                        <Textarea 
                          value={q.question_text} 
                          onChange={(e) => {
                            const newQs = structuredClone(questions);
                            newQs[index].question_text = e.target.value;
                            setQuestions(newQs);
                          }}
                          placeholder={q.type === 'passage' ? "Enter passage text..." : "Enter question text..."}
                          className="min-h-[150px] mb-4 rounded-sm resize-y"
                        />
                        
                        {q.type === 'mcq' && q.options && (
                          <div className="space-y-3 pl-4 border-l-2 border-muted">
                             {q.options.map((opt, oIdx) => (
                               <div key={opt.id} className="flex items-center gap-3">
                                 <input 
                                   type="radio" 
                                   name={`correct_${q.id}`} 
                                   checked={q.correct_option === opt.id}
                                   onChange={() => {
                                     const newQs = structuredClone(questions);
                                     newQs[index].correct_option = opt.id;
                                     setQuestions(newQs);
                                   }}
                                 />
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
                                   className={q.correct_option === opt.id ? "border-green-500" : ""}
                                 />
                                 <Button 
                                   variant="ghost" 
                                   size="icon"
                                   className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                   onClick={() => {
                                     const newQs = structuredClone(questions);
                                     newQs[index].options?.splice(oIdx, 1);
                                     setQuestions(newQs);
                                   }}
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </div>
                             ))}
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="mt-2 text-muted-foreground"
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
                          <div className="mt-4 flex gap-4">
                             <div className="w-24">
                               <Label className="text-xs text-muted-foreground">Marks</Label>
                               <Input 
                                 type="number" 
                                 step="0.5" 
                                 value={q.marks || 0} 
                                 onChange={(e) => {
                                   const newQs = structuredClone(questions);
                                   newQs[index].marks = parseFloat(e.target.value);
                                   setQuestions(newQs);
                                 }}
                               />
                             </div>
                             <div className="flex-1">
                               <Label className="text-xs text-muted-foreground">Explanation / Solution</Label>
                               <Input 
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
                              <Button size="sm" variant="outline" onClick={() => handleAddMCQ(q.id)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Child MCQ
                              </Button>
                            </h4>
                            
                            {q.children?.map((cq, cIdx) => (
                              <div key={cq.id} className="mb-4 pl-4 border-l-2 py-2">
                                <div className="flex justify-between items-center mb-2">
                                  <Badge variant="outline">Child MCQ</Badge>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                                <Textarea 
                                  value={cq.question_text} 
                                  onChange={(e) => {
                                    const newQs = structuredClone(questions);
                                    newQs[index].children![cIdx].question_text = e.target.value;
                                    setQuestions(newQs);
                                  }} 
                                  placeholder="Enter child question text..."
                                  className="min-h-[150px] mb-4 rounded-sm resize-y"
                                />
                                
                                {cq.options && (
                                  <div className="space-y-3 pl-4 border-l-2 border-muted mb-4">
                                     {cq.options.map((opt, oIdx) => (
                                       <div key={opt.id} className="flex items-center gap-3">
                                         <input 
                                           type="radio" 
                                           name={`correct_${cq.id}`} 
                                           checked={cq.correct_option === opt.id}
                                           onChange={() => {
                                             const newQs = structuredClone(questions);
                                             newQs[index].children![cIdx].correct_option = opt.id;
                                             setQuestions(newQs);
                                           }}
                                         />
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
                                           className={cq.correct_option === opt.id ? "border-green-500" : ""}
                                         />
                                         <Button 
                                           variant="ghost" 
                                           size="icon"
                                           className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                           onClick={() => {
                                             const newQs = structuredClone(questions);
                                             newQs[index].children![cIdx].options?.splice(oIdx, 1);
                                             setQuestions(newQs);
                                           }}
                                         >
                                           <Trash2 className="h-4 w-4" />
                                         </Button>
                                       </div>
                                     ))}
                                     <Button 
                                       variant="ghost" 
                                       size="sm" 
                                       className="mt-2 text-muted-foreground"
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

                                <div className="mt-4 flex gap-4">
                                   <div className="w-24">
                                     <Label className="text-xs text-muted-foreground">Marks</Label>
                                     <Input 
                                       type="number" 
                                       step="0.5" 
                                       value={cq.marks || 0} 
                                       onChange={(e) => {
                                         const newQs = structuredClone(questions);
                                         newQs[index].children![cIdx].marks = parseFloat(e.target.value);
                                         setQuestions(newQs);
                                       }}
                                     />
                                   </div>
                                   <div className="flex-1">
                                     <Label className="text-xs text-muted-foreground">Explanation / Solution</Label>
                                     <Input 
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
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
