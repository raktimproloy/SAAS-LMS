"use client";

import React, { useState, useEffect } from "react";

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
  { title: "Online Exams", href: "/student/exams", icon: GraduationCap },
  { title: "Results", href: "/student/results", icon: FileText },
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
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);
  
  const Wrapper = LinkWrapper || React.Fragment;

  const handleLogout = async () => {
    await fetch('/api/student/auth/logout', { method: 'POST' });
    router.push('/student/login');
    router.refresh();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar/90 backdrop-blur-2xl text-foreground relative z-20 overflow-hidden">
      {/* Ambient Floating Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-80 dark:mix-blend-screen">
        <div className="absolute -top-[5%] -left-[20%] w-[140%] h-[40%] bg-[hsl(var(--gradient-1))]/40 rounded-full blur-[60px] animate-blob-y" />
        <div className="absolute top-[35%] -right-[30%] w-[120%] h-[30%] bg-[hsl(var(--gradient-2))]/35 rounded-full blur-[60px] animate-blob-y animation-delay-2000" />
        <div className="absolute -bottom-[5%] -left-[10%] w-[100%] h-[40%] bg-[hsl(var(--gradient-3))]/35 rounded-full blur-[60px] animate-blob-y animation-delay-4000" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-sidebar-border/50 bg-sidebar/40">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Student Portal</h2>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid gap-2 px-4">
            {navItems.map((item, index) => {
              const currentPath = optimisticPath || pathname;
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <Wrapper key={item.title} {...(LinkWrapper ? { asChild: true } : {})}>
                  <Link 
                    href={item.href} 
                    onClick={(e) => {
                      setOptimisticPath(item.href);
                      if (onLinkClick) onLinkClick();
                      if (LinkWrapper) {
                        e.preventDefault();
                        setTimeout(() => {
                          router.push(item.href);
                        }, 300);
                      }
                    }}
                    className={cn(
                      "flex items-center rounded-full px-4 py-3 text-base transition-all duration-300",
                      isActive
                        ? "animated-premium-glass text-primary-foreground font-bold shadow-lg shadow-primary/20"
                        : "text-foreground/70 hover:bg-sidebar-accent hover:text-foreground border border-transparent font-medium gap-3"
                    )}
                  >
                    {isActive ? (
                      <div className="flex items-center gap-3 w-full">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    ) : (
                      <>
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </>
                    )}
                  </Link>
                </Wrapper>
              );
            })}
          </nav>
        </div>
        <div className="p-4 mt-auto border-t border-sidebar-border/50 bg-sidebar/40">
          <Wrapper {...(LinkWrapper ? { asChild: true } : {})}>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors rounded-xl" 
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
    </div>
  );
}
