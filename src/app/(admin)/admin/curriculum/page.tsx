"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Plus, BookOpen, Search, Trash2, Calendar as CalendarIcon, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import NCTBBookImporter from "@/components/admin/curriculum/NCTBBookImporter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CurriculumListPage() {
  const [curricula, setCurricula] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCurricula = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/curriculum");
      if (res.ok) {
        const data = await res.json();
        setCurricula(data);
      }
    } catch (error) {
      console.error("Failed to fetch curricula:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurricula();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this curriculum?")) return;
    
    try {
      const res = await fetch(`/api/admin/curriculum/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCurricula(curricula.filter(c => c.id !== id));
      } else {
        alert("Failed to delete curriculum.");
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const filtered = curricula.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.batch?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum Roadmaps</h1>
          <p className="text-muted-foreground mt-1">
            Plan classes, chapter exams, and holidays — then publish for students.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <NCTBBookImporter onSuccess={fetchCurricula} />
          
          <Link href="/admin/curriculum/new">
            <Button className="w-full sm:w-auto gap-2 shadow-md">
              <Plus className="w-4 h-4" />
              New Curriculum
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, course, or batch..."
            className="pl-8 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 bg-muted/50 w-full animate-pulse" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="pt-4 flex gap-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">No curricula found</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                Get started by creating a new curriculum to plan your course schedules.
              </p>
            </div>
            <Link href="/admin/curriculum/new" className="mt-2">
              <Button>Create Curriculum</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((curriculum) => (
            <Card key={curriculum.id} className="group hover:shadow-md transition-all hover:border-primary/50 overflow-hidden flex flex-col">
              <div className={`h-2 w-full ${
                curriculum.status === 'active' ? 'bg-primary' :
                curriculum.status === 'draft' ? 'bg-amber-500' : 'bg-muted-foreground'
              }`} />
              
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1" title={curriculum.title}>
                      {curriculum.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={curriculum.status === 'active' ? 'default' : 'secondary'}
                        className={`text-[10px] h-5 ${curriculum.status === 'draft' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : ''}`}
                      >
                        {curriculum.status}
                      </Badge>
                      {curriculum.is_public && (
                        <Badge variant="outline" className="text-[10px] h-5 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400">
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(curriculum.id)}
                    title="Delete Curriculum"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 flex-1 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <BookOpen className="w-4 h-4 shrink-0 text-primary/70" />
                    <span className="truncate">{curriculum.course?.title || 'Unknown Course'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <Users className="w-4 h-4 shrink-0 text-primary/70" />
                    <span className="truncate">{curriculum.batch?.name || 'Unknown Batch'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <CalendarIcon className="w-4 h-4 shrink-0 text-primary/70" />
                    <span>
                      {format(parseISO(curriculum.start_date), 'MMM d')} - {format(parseISO(curriculum.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between mt-auto">
                  <div className="text-sm font-medium text-muted-foreground">
                    <span className="text-foreground">{curriculum._count?.sessions || 0}</span> Classes
                  </div>
                  <Link href={`/admin/curriculum/${curriculum.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Open Planner <CalendarIcon className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
