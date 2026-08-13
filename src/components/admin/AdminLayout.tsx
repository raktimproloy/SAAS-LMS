"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Bell,
  Settings,
  Menu,
  LogOut,
  Database,
  Video,
  ClipboardList,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  MessageSquare
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

// Define the permissions mapping for sidebar links
type SidebarLink = {
  name: string;
  href?: string;
  icon?: any;
  perm?: string;
  subItems?: { name: string; href: string; perm?: string }[];
};

const sidebarLinks: SidebarLink[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }, // no perm needed
  { name: "Courses & Batches", href: "/admin/courses", icon: BookOpen, perm: "courses" },
  { name: "Assistants Team", href: "/admin/assistants", icon: Users, perm: "assistants" },
  { name: "Video Courses", href: "/admin/video-courses", icon: Video, perm: "courses" },
  {
    name: "Management",
    icon: Users,
    subItems: [
      { name: "Students", href: "/admin/students", perm: "students" },
      { name: "Attendance", href: "/admin/attendance", perm: "students" },
      { name: "QR Scanner", href: "/admin/qr-scanner", perm: "students" },
      { name: "QR Cards", href: "/admin/qr-cards", perm: "students" },
      { name: "Payment", href: "/admin/payments", perm: "payments" },
      { name: "Expenses", href: "/admin/expenses", perm: "expenses" },
      { name: "Study Materials", href: "/admin/materials", perm: "materials" },
      { name: "Report", href: "/admin/reports", perm: "reports" },
      { name: "Notices", href: "/admin/notices", perm: "notices" },
    ]
  },
  {
    name: "Exam",
    icon: FileText,
    subItems: [
      { name: "Online Exam", href: "/admin/exams", perm: "exams" },
      { name: "Result", href: "/admin/offline-results", perm: "exams" },
    ]
  },
  { name: "Website Content", href: "/admin/content", icon: Bell, perm: "content" },
  { name: "SMS Logs", href: "/admin/sms", icon: MessageSquare, perm: "sms" },
  { name: "Settings", href: "/admin/settings", icon: Settings }, // no perm needed
];

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

// Extracted Sidebar component to avoid re-mounting and losing state on parent re-renders
const SidebarContent = ({
  pathname,
  user,
  setIsMobileOpen,
  handleLogout
}: {
  pathname: string;
  user: AdminUser | null;
  setIsMobileOpen: (v: boolean) => void;
  handleLogout: () => void;
}) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebarLinks.forEach(link => {
      if (link.subItems && link.subItems.some(sub => pathname.startsWith(sub.href))) {
        initial[link.name] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <Database className="h-6 w-6 text-primary" />
          <span className="">Institute Web</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {sidebarLinks.map((link) => {
            // Check permission for parent link if it has no subItems
            if (!link.subItems) {
              const hasPerm = !link.perm || user?.role === "super_admin" || user?.permissions?.includes("all") || user?.permissions?.includes(link.perm);
              if (!hasPerm) return null;
            } else {
              // For group, filter subItems based on permissions
              const visibleSubItems = link.subItems.filter(sub => {
                return !sub.perm || user?.role === "super_admin" || user?.permissions?.includes("all") || user?.permissions?.includes(sub.perm);
              });
              if (visibleSubItems.length === 0) return null; // Hide group if no subItems are accessible
            }

            const Icon = link.icon;

            if (link.subItems) {
              const isOpen = openMenus[link.name];
              const isActiveGroup = link.subItems.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));

              const visibleSubItems = link.subItems.filter(sub => {
                return !sub.perm || user?.role === "super_admin" || user?.permissions?.includes("all") || user?.permissions?.includes(sub.perm);
              });

              return (
                <div key={link.name} className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleMenu(link.name)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:text-primary",
                      isActiveGroup
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.name}
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen ? "rotate-0" : "-rotate-90")} />
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-9 flex flex-col gap-1 border-l pl-2 mt-1 mb-1">
                        {visibleSubItems.map(sub => {
                          const isActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:text-primary",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.name}
                href={link.href as string}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:text-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 mt-auto">
        <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/admin/login");
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout failed", err);
    }
    router.push("/admin/login");
    router.refresh();
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading interface...</div>;
  }

  // Client-side route protection
  const flattenedLinks = sidebarLinks.flatMap(link => link.subItems ? link.subItems : [{ name: link.name, href: link.href || "", perm: link.perm }]);
  const currentLink = flattenedLinks.find(link => link.href && pathname.startsWith(link.href));

  const hasAccess = (() => {
    if (!currentLink || !currentLink.perm) return true;
    if (user?.role === "super_admin") return true;
    if (user?.permissions?.includes("all")) return true;
    return user?.permissions?.includes(currentLink.perm);
  })();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/20 md:block sticky top-0 h-screen print:hidden">
        <SidebarContent
          pathname={pathname}
          user={user}
          setIsMobileOpen={setIsMobileOpen}
          handleLogout={handleLogout}
        />
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/20 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur-sm print:hidden">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            {/* @ts-expect-error - Radix UI type mismatch for asChild */}
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SidebarContent
                pathname={pathname}
                user={user}
                setIsMobileOpen={setIsMobileOpen}
                handleLogout={handleLogout}
              />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            {/* Can add global search or breadcrumbs here */}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.role === "super_admin" ? "Super Admin" : "Assistant"}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.name || "Admin"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-50/50 dark:bg-transparent relative print:p-0 print:m-0 print:bg-transparent">
          {!hasAccess ? (
            <div className="flex flex-col items-center justify-center flex-1 h-[60vh]">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-destructive">Access Denied</h1>
                <p className="text-muted-foreground text-lg">You don&apos;t have permission to view this page.</p>
                <Button onClick={() => router.push("/admin/dashboard")}>Return to Dashboard</Button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
