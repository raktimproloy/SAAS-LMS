"use client";

import React from "react";
import { Edit, Trash2, Link as LinkIcon, Lock, Globe, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type VideoCourse = {
  id: number;
  title: string;
  description?: string;
  url: string;
  price: number;
  is_free: boolean;
  is_public: boolean;
  tags?: unknown;
  thumbnail?: string;
  course?: { title: string };
  batch?: { name: string };
};

interface VideoCourseCardProps {
  course: VideoCourse;
  onEdit: (course: VideoCourse) => void;
  onDelete: (id: number) => void;
}

export function VideoCourseCard({ course, onEdit, onDelete }: VideoCourseCardProps) {
  const tags = course.tags ? (typeof course.tags === 'string' ? JSON.parse(course.tags) : course.tags) : [];

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex flex-col">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <PlayCircle className="h-12 w-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {course.is_free ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600">Free</Badge>
          ) : (
            <Badge variant="default">৳{course.price}</Badge>
          )}
          {course.is_public ? (
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
              <Globe className="h-3 w-3 mr-1" /> Public
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
              <Lock className="h-3 w-3 mr-1" /> Private
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 text-xs text-muted-foreground flex items-center justify-between">
          <span className="font-semibold text-primary">{course.course?.title || "No Course"}</span>
          {course.batch?.name && <span>{course.batch.name}</span>}
        </div>
        
        <h3 className="font-semibold tracking-tight text-lg mb-1 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.description || "No description provided."}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto border-t pt-4">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(course.url, "_blank")}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Watch
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(course)} className="flex-1">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
            if (confirm("Are you sure you want to delete this video course?")) {
              onDelete(course.id);
            }
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
