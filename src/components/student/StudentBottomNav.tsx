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
      <div className="bg-gradient-to-b from-cyan-500/90 to-blue-600/95 backdrop-blur-xl border-t border-white/20 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] px-2 py-2 md:pb-4">
        <div className="flex items-center justify-between">
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
                      ? "scale-[1.15] bg-white/25 shadow-sm backdrop-blur-md border border-white/30"
                      : "scale-100 group-hover:bg-white/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-white/60"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-all duration-200 drop-shadow-sm tracking-tight mt-0.5",
                    isActive
                      ? "text-white scale-110"
                      : "text-white/70"
                  )}
                >
                  {item.title}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
