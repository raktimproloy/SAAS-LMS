"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentHeader } from "@/components/student/StudentHeader";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/student/login") {
    return <>{children}</>;
  }

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="student-portal flex min-h-screen bg-background relative text-foreground">
      {/* Background Container with colorful floating animated shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        {/* Deep background color */}
        <div className="absolute inset-0 bg-background" />
        
        {/* Floating color orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/15 blur-[90px] animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] left-[10%] w-[25%] h-[25%] rounded-full bg-indigo-600/15 blur-[100px] animate-[pulse_9s_ease-in-out_infinite_reverse]" />
        
        {/* Optional subtle noise/texture overlay for premium feel */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>
      
      <div className="hidden lg:block z-10 sticky top-0 h-screen">
        <StudentSidebar />
      </div>
      <div className="flex flex-1 flex-col z-10 relative min-w-0">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
          <StudentHeader />
        </div>
        <main id="student-main-scroll" className="flex-1 p-4 md:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
