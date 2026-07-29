"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Bell, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StudentHeader() {
  const [student, setStudent] = useState<{name: string, photo: string | null} | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/student/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStudent(data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scroll is near top, always show
      if (currentScrollY < 50) {
        setIsVisible(true);
      } 
      // Scrolling down -> hide
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } 
      // Scrolling up -> show
      else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={cn(
        "flex h-16 md:h-20 items-center justify-between border-b border-white/10 bg-background/60 backdrop-blur-2xl px-4 md:px-8 w-full text-foreground fixed top-0 z-50 transition-transform duration-300 ease-in-out shadow-sm",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mobile Back Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden shrink-0 bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go Back</span>
        </Button>
        
        {/* Institute Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 hidden sm:block">
            Institute
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-4">
        <ThemeToggle />
        
        <Link href="/student/notices">
          <Button variant="ghost" size="icon" className="relative bg-white/5 hover:bg-white/10 rounded-full h-10 w-10 border border-white/10">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </Button>
        </Link>

        {student && (
          <Link href="/student/profile" className="flex items-center gap-3 ml-1">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium leading-none">{student.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Student</p>
            </div>
            <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-primary/30 hover:border-primary transition-colors shadow-[0_0_10px_rgba(var(--primary),0.2)]">
              <AvatarImage src={student.photo || ""} alt={student.name} />
              <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </header>
  );
}
