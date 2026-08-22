"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentHeader } from "@/components/student/StudentHeader";
import { StudentBottomNav } from "@/components/student/StudentBottomNav";
import { cn } from "@/lib/utils";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/student/login") {
    return <>{children}</>;
  }

  // Check if we are on the exam taking page
  const isTakeExamPage = pathname?.includes('/take');

  return (
    <div className="student-portal flex min-h-screen bg-background relative text-foreground">
      {/* Background Container */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-background">
        {/* Animated Background Orbs */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] sm:blur-[140px] opacity-60 dark:opacity-30 animate-blob" 
          style={{ background: 'hsl(var(--gradient-1) / 0.4)' }}
        />
        <div 
          className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] sm:blur-[140px] opacity-60 dark:opacity-30 animate-blob animation-delay-2000" 
          style={{ background: 'hsl(var(--gradient-2) / 0.4)' }}
        />
        <div 
          className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full blur-[100px] sm:blur-[140px] opacity-60 dark:opacity-30 animate-blob animation-delay-4000" 
          style={{ background: 'hsl(var(--gradient-3) / 0.4)' }}
        />
      </div>
      
      {!isTakeExamPage && (
        <div className="hidden lg:block z-10 sticky top-0 h-screen">
          <StudentSidebar />
        </div>
      )}
      
      <div className="flex flex-1 flex-col z-10 relative min-w-0">
        {!isTakeExamPage && (
          <div className="z-50">
            <StudentHeader />
          </div>
        )}
        
        <main 
          id="student-main-scroll" 
          className={cn(
            "flex-1 relative flex flex-col",
            isTakeExamPage 
              ? "p-0" // No padding for exam page, let ExamInterface handle it
              : "p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 pt-20 md:pt-28 lg:pt-8"
          )}
        >
          {children}
        </main>
        
        {!isTakeExamPage && <StudentBottomNav />}
      </div>
    </div>
  );
}
