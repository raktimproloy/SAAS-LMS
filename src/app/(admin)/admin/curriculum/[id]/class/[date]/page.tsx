"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import ClassSessionTabs from "@/components/admin/curriculum/ClassSessionTabs";

export default function ClassSessionPage() {
  const params = useParams();
  const id = params.id as string;
  const dateStr = params.date as string;
  
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/curriculum/${id}`);
      
      if (res.ok) {
        const data = await res.json();
        setCurriculum(data);
        
        // Find the specific session by date
        const targetSession = data.sessions?.find((s: any) => {
          const sDate = format(parseISO(s.date), 'yyyy-MM-dd');
          return sDate === dateStr;
        });
        
        if (targetSession) {
          setSession(targetSession);
        } else {
          toast({ title: "Not Found", description: "Class session not found for this date", variant: "destructive" });
          router.push(`/admin/curriculum/${id}`);
        }
      } else {
        toast({ title: "Error", description: "Failed to load curriculum", variant: "destructive" });
        router.push("/admin/curriculum");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, dateStr]);

  const handleUpdateSession = async (updateData: any) => {
    if (!session) return;
    
    try {
      const res = await fetch(`/api/admin/curriculum/${id}/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      
      if (res.ok) {
        toast({ title: "Success", description: "Session updated successfully" });
        fetchData(); // Refresh
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update session", variant: "destructive" });
    }
  };

  const toggleCompleted = () => {
    handleUpdateSession({ is_completed: !session.is_completed });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!curriculum || !session) return null;

  const sessionDate = parseISO(session.date);

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <Link href={`/admin/curriculum/${id}`}>
          <Button variant="outline" size="icon" className="h-10 w-10 mt-1 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  {session.session_type === "exam"
                    ? "Exam"
                    : session.session_type === "holiday"
                      ? "Holiday"
                      : session.session_type === "skipped"
                        ? "Skipped"
                        : `Class ${session.session_number}`}
                </Badge>
                {session.is_completed && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </Badge>
                )}
                {(session.session_type === "holiday" || session.is_holiday) && session.holiday_name && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 gap-1">
                    <AlertCircle className="w-3 h-3" /> {session.holiday_name}
                  </Badge>
                )}
                {session.session_type === "exam" && session.exam_title && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 gap-1">
                    {session.exam_title}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {format(sessionDate, 'EEEE, MMMM do, yyyy')}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {curriculum.title} • {curriculum.course?.title} • {curriculum.batch?.name}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant={session.is_completed ? "outline" : "default"} 
                className="gap-2"
                onClick={toggleCompleted}
              >
                <CheckCircle2 className="w-4 h-4" />
                {session.is_completed ? "Mark as Pending" : "Mark as Completed"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        <ClassSessionTabs 
          session={session} 
          curriculum={curriculum}
          onUpdateSession={handleUpdateSession}
        />
      </div>
    </div>
  );
}
