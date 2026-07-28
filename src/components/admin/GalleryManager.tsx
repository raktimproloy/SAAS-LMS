"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GalleryImage {
  id: number;
  image_path: string;
  category: string;
  caption: string | null;
  sort_order: number;
}

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [newCaption, setNewCaption] = useState("");

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/content/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload file");
      
      const imageUrl = uploadData.url;

      // 2. Save to gallery database
      const saveRes = await fetch("/api/admin/content/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_path: imageUrl,
          category: "home",
          caption: newCaption || "Gallery Image"
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save to gallery");
      
      setNewCaption("");
      fetchImages();
      
    } catch (err: unknown) {
      if (err instanceof Error) setUploadError(err.message);
      else setUploadError("An error occurred during upload");
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/content/gallery/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setImages(images.filter(img => img.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Optimistically update UI
    const newItems = Array.from(images);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);

    setImages(newItems);

    // Send new order to API
    try {
      await fetch("/api/admin/content/gallery/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedIds: newItems.map(item => item.id),
        }),
      });
    } catch (err) {
      console.error("Failed to save reorder", err);
      fetchImages(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading gallery images...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4">Add New Image</h3>
        {uploadError && <p className="text-sm text-red-500 mb-4">{uploadError}</p>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input 
              id="caption" 
              placeholder="e.g. Students in practical lab" 
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>
        </div>
        {isUploading && (
          <div className="mt-4 flex items-center text-sm text-primary font-medium">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading and saving...
          </div>
        )}
      </div>

      {/* Gallery List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Gallery Order</h3>
          <p className="text-xs text-muted-foreground">Drag and drop to reorder images</p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">No images found. Upload your first image above.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="gallery-list">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {images.map((img, index) => (
                    <Draggable key={img.id.toString()} draggableId={img.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-lg border",
                            snapshot.isDragging 
                              ? "border-primary shadow-lg ring-1 ring-primary/20 z-50" 
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          )}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="cursor-grab hover:text-primary active:cursor-grabbing p-2 text-slate-400 transition-colors"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          
                          <div className="w-20 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 dark:border-slate-700 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.image_path} alt={img.caption || "Gallery Image"} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{img.caption || "Untitled Image"}</h4>
                            <p className="text-xs text-muted-foreground truncate">{img.image_path}</p>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(img.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
