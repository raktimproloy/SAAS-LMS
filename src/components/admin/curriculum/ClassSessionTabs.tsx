"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, ClipboardList, FileSignature } from "lucide-react";

interface ClassSessionTabsProps {
  session: any;
  curriculum: any;
  onUpdateSession: (data: any) => void;
}

export default function ClassSessionTabs({ session, curriculum, onUpdateSession }: ClassSessionTabsProps) {
  
  return (
    <Tabs defaultValue="topics" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger 
          value="topics" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6 gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Topics
        </TabsTrigger>
        <TabsTrigger 
          value="attendance" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6 gap-2"
        >
          <Users className="w-4 h-4" />
          Attendance
        </TabsTrigger>
        <TabsTrigger 
          value="homework" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6 gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Homework
        </TabsTrigger>
        <TabsTrigger 
          value="exam" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-6 gap-2"
        >
          <FileSignature className="w-4 h-4" />
          Exam
        </TabsTrigger>
      </TabsList>
      
      <div className="pt-6">
        <TabsContent value="topics" className="mt-0 space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Class Topics</h3>
              {session?.topics?.length > 0 ? (
                <ul className="space-y-3">
                  {session.topics.map((topic: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border">
                      <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{topic.chapter_name}</p>
                        {topic.topic_name && <p className="text-sm text-muted-foreground">{topic.topic_name}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No topics assigned for this class yet. Go back to the planner to drag and drop topics.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-0">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">Attendance System</h3>
              <p className="text-sm max-w-md mx-auto">
                Attendance tracking for {curriculum?.batch?.name} will be available here when the class starts.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="homework" className="mt-0">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">Homework Assignments</h3>
              <p className="text-sm max-w-md mx-auto mb-4">
                Assign homework specific to this class session.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exam" className="mt-0">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">Class Exam</h3>
              <p className="text-sm max-w-md mx-auto">
                Schedule a mini-test or exam for this session.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
