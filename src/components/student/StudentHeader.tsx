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
  const [clickedPath, setClickedPath] = useState<string | null>(null);
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

  // Clear clicked state when navigation completes (using an approximation, or just let unmount handle it)
  // But wait, the header doesn't unmount! So we clear it after a short delay or when pathname changes.
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (clickedPath) {
      timeoutId = setTimeout(() => {
        setClickedPath(null);
      }, 1000); // safety fallback
    }
    return () => clearTimeout(timeoutId);
  }, [clickedPath]);

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
        "flex h-16 md:h-20 items-center justify-between w-full text-foreground z-40 transition-transform duration-300 ease-in-out",
        "fixed lg:relative top-0",
        "bg-background",
        "px-4 md:px-8",
        isVisible ? "translate-y-0" : "-translate-y-full lg:translate-y-0"
      )}
    >
      <div className="flex items-center gap-3 md:gap-4 lg:hidden">
        {/* Mobile Back Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 bg-muted/60 hover:bg-muted rounded-full h-10 w-10 border border-border" 
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

      {/* Desktop spacer to push right items */}
      <div className="hidden lg:block flex-1" />

      <div className="flex items-center justify-end gap-2 md:gap-4">
        <ThemeToggle />
        
        <Link 
          href="/student/notices" 
          onClick={() => setClickedPath('/student/notices')}
          className={cn(
            "transition-all duration-200",
            clickedPath === '/student/notices' ? "scale-90 opacity-70" : "scale-100 opacity-100"
          )}
        >
          <Button variant="ghost" size="icon" className="relative bg-muted/60 hover:bg-muted rounded-full h-10 w-10 border border-border">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </Button>
        </Link>

        {student && (
          <Link 
            href="/student/profile" 
            onClick={() => setClickedPath('/student/profile')}
            className={cn(
              "flex items-center gap-3 ml-1 transition-all duration-200",
              clickedPath === '/student/profile' ? "scale-95 opacity-70" : "scale-100 opacity-100"
            )}
          >
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
