"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Menu, Medal, ChevronRight, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Course {
  id: number | string;
  title: string;
}

interface LeaderboardClientProps {
  courses: Course[];
}

// Mock data for leaderboard
const generateMockLeaderboard = (courseId: string | number) => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    rank: i + 1,
    name: `Student Name ${i + 1}`,
    score: 100 - (i * 2),
    institution: i % 2 === 0 ? "Dhaka College" : "Notre Dame College",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${courseId}-${i}`
  }));
};

export function LeaderboardClient({ courses }: LeaderboardClientProps) {
  const [activeCourseId, setActiveCourseId] = useState<string | number>(courses[0]?.id || 1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const leaderboardData = generateMockLeaderboard(activeCourseId);
  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/40 backdrop-blur-md rounded-2xl border border-border/60 p-4">
      <div className="mb-6 px-2">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          ক্যাটাগরি
        </h3>
      </div>
      
      <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-grow">
        {courses.map((course) => {
          const isActive = activeCourseId === course.id;
          return (
            <button
              key={course.id}
              onClick={() => {
                setActiveCourseId(course.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                isActive 
                ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                : "text-foreground hover:bg-muted font-semibold"
              }`}
            >
              <span className="line-clamp-1 pr-2">{course.title}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-primary-foreground" : "text-foreground/90 group-hover:text-foreground group-hover:translate-x-1"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto min-h-[70vh]">
      
      {/* Mobile Drawer */}
      <div className="md:hidden flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground line-clamp-1">{activeCourse?.title || "Select Category"}</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" className="shrink-0 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0 border-r-border bg-background">
            <SheetHeader className="p-4 border-b border-border/50 bg-muted/30">
              <SheetTitle className="text-left flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                ক্যাটাগরি নির্বাচন
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 h-[calc(100vh-80px)]">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 shrink-0">
        <div className="sticky top-24 h-[calc(100vh-120px)]">
          <SidebarContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl p-6 sm:p-8 shadow-xl min-h-[500px]">
          <div className="mb-8 pb-6 border-b border-border/50 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
                <span className="text-primary mr-2">#</span> 
                {activeCourse?.title}
              </h2>
              <p className="text-foreground font-semibold">টপ পারফর্মার তালিকা</p>
            </div>
            
            {/* Top 3 display badges */}
            <div className="flex items-end gap-3 hidden lg:flex">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-300 border-2 border-background flex items-center justify-center shadow-lg -mb-2 z-10 text-xl font-bold">2</div>
                <div className="h-16 w-16 bg-muted rounded-t-lg"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-background flex items-center justify-center shadow-xl -mb-4 z-10 text-2xl font-black text-white">1</div>
                <div className="h-24 w-20 bg-primary/20 rounded-t-lg"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-400 border-2 border-background flex items-center justify-center shadow-md -mb-2 z-10 text-lg font-bold">3</div>
                <div className="h-12 w-16 bg-muted rounded-t-lg"></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-4 sm:px-6 py-3 bg-muted rounded-xl text-sm font-bold text-foreground mb-4">
              <div className="w-12 text-center">Rank</div>
              <div>Student Name</div>
              <div className="hidden sm:block w-48 text-left">Institution</div>
              <div className="w-16 text-right">Score</div>
            </div>

            {leaderboardData.map((student, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={student.id}
                className={`group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-4 sm:px-6 py-4 rounded-2xl transition-all border ${
                  index === 0 ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60" :
                  index === 1 ? "bg-slate-300/10 border-slate-300/30 hover:border-slate-300/60" :
                  index === 2 ? "bg-orange-400/10 border-orange-400/30 hover:border-orange-400/60" :
                  "bg-card/50 border-border/40 hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                {/* Rank */}
                <div className="w-12 flex justify-center">
                  {index === 0 ? <Medal className="w-8 h-8 text-amber-500 fill-amber-500/20" /> :
                   index === 1 ? <Medal className="w-7 h-7 text-slate-400 fill-slate-400/20" /> :
                   index === 2 ? <Medal className="w-6 h-6 text-orange-400 fill-orange-400/20" /> :
                   <span className="text-xl font-bold text-foreground">{student.rank}</span>
                  }
                </div>
                
                {/* Name & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">{student.name}</div>
                    <div className="text-xs text-foreground/90 sm:hidden line-clamp-1">{student.institution}</div>
                  </div>
                </div>

                {/* Institution (Desktop) */}
                <div className="hidden sm:block w-48 text-sm font-medium text-foreground/90 line-clamp-1 text-left">
                  {student.institution}
                </div>

                {/* Score */}
                <div className="w-16 text-right">
                  <span className={`font-black text-lg ${
                    index === 0 ? "text-amber-500" :
                    index === 1 ? "text-slate-500" :
                    index === 2 ? "text-orange-500" :
                    "text-foreground"
                  }`}>
                    {student.score}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
