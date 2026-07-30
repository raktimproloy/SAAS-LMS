"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  FileText,
  LayoutDashboard,
  BookOpen,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Results", href: "/student/results", icon: FileText },
  { title: "Exams", href: "/student/exams", icon: GraduationCap },
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Notes", href: "/student/notes", icon: BookOpen },
  { title: "Payments", href: "/student/payments", icon: CreditCard },
];

export function StudentBottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setIsVisible(true);
      }
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      }
      else {
        setIsVisible(true); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-200 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="bg-card/40 backdrop-blur-3xl border-t border-white/10 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.3)] px-2 py-2 md:pb-4 relative overflow-hidden">
        {/* Ambient Floating Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-100">
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[150%] bg-[hsl(var(--gradient-1))]/50 rounded-full blur-[35px] animate-blob-y" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[120%] bg-[hsl(var(--gradient-2))]/40 rounded-full blur-[35px] animate-blob-y animation-delay-2000" />
          <div className="absolute top-[10%] left-[30%] w-[40%] h-[150%] bg-[hsl(var(--gradient-3))]/40 rounded-full blur-[35px] animate-blob-y animation-delay-4000" />
        </div>
        <div className="flex items-center justify-between relative z-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-1 relative group"
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-200 ease-out",
                    isActive
                      ? "scale-[1.15] animated-premium-glass shadow-md shadow-primary/20"
                      : "scale-100 group-hover:bg-primary/10"
                  )}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-muted-foreground"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold transition-all duration-200 drop-shadow-sm tracking-tight mt-0.5",
                    isActive
                      ? "text-white scale-110"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
