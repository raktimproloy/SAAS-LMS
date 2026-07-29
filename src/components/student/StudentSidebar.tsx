"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  GraduationCap, 
  CreditCard,
  Bell,
  LogOut,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const navItems = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Profile", href: "/student/profile", icon: User },
  { title: "Results", href: "/student/results", icon: FileText },
  { title: "Online Exams", href: "/student/exams", icon: GraduationCap },
  { title: "Study Materials", href: "/student/notes", icon: BookOpen },
  { title: "Payments", href: "/student/payments", icon: CreditCard },
  { title: "Notices", href: "/student/notices", icon: Bell },
];

interface StudentSidebarProps {
  onLinkClick?: () => void;
  LinkWrapper?: React.ElementType;
}

export function StudentSidebar({ onLinkClick, LinkWrapper }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const Wrapper = LinkWrapper || React.Fragment;

  const handleLogout = async () => {
    await fetch('/api/student/auth/logout', { method: 'POST' });
    router.push('/student/login');
    router.refresh();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/5 bg-transparent backdrop-blur-[40px] text-foreground relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-border/40">
        <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">Student Portal</h2>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-2 px-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Wrapper key={item.title} {...(LinkWrapper ? { asChild: true } : {})}>
                <Link 
                  href={item.href} 
                  onClick={(e) => {
                    if (onLinkClick) onLinkClick();
                    if (LinkWrapper) {
                      e.preventDefault();
                      setTimeout(() => {
                        router.push(item.href);
                      }, 300);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_auto] animate-gradient text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] translate-x-2 border-0"
                      : "text-foreground/70 hover:bg-white/5 hover:text-foreground hover:translate-x-1 border border-transparent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Wrapper>
            );
          })}
        </nav>
      </div>
      <div className="p-4 mt-auto border-t border-border/40">
        <Wrapper {...(LinkWrapper ? { asChild: true } : {})}>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 border-border/50 bg-background/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors rounded-xl" 
            onClick={() => {
              if (onLinkClick) onLinkClick();
              handleLogout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </Wrapper>
      </div>
    </div>
  );
}
