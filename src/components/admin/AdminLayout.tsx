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
  ClipboardList
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

// Define the permissions mapping for sidebar links
const sidebarLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }, // no perm needed
  { name: "Assistants Team", href: "/admin/assistants", icon: Users, perm: "assistants" },
  { name: "Courses & Batches", href: "/admin/courses", icon: BookOpen, perm: "courses" },
  { name: "Video Courses", href: "/admin/video-courses", icon: Video, perm: "courses" },
  { name: "Student Management", href: "/admin/students", icon: Users, perm: "students" },
  { name: "Student Payment", href: "/admin/payments", icon: CreditCard, perm: "payments" },
  { name: "Exams", href: "/admin/exams", icon: FileText, perm: "exams" },
  { name: "Study Materials", href: "/admin/materials", icon: Database, perm: "materials" },
  { name: "Reports", href: "/admin/reports", icon: ClipboardList, perm: "reports" },
  { name: "Website Content", href: "/admin/content", icon: Bell, perm: "content" },
  { name: "Settings", href: "/admin/settings", icon: Settings }, // no perm needed
];

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

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
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin/login");
    router.refresh();
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading interface...</div>;
  }

  // Filter links based on user permissions
  const filteredLinks = sidebarLinks.filter(link => {
    if (!link.perm) return true; // Accessible by all (Dashboard, Settings)
    if (user?.role === "super_admin") return true;
    if (user?.permissions?.includes("all")) return true;
    return user?.permissions?.includes(link.perm);
  });

  // Client-side route protection
  const currentLink = sidebarLinks.find(link => pathname.startsWith(link.href));
  const hasAccess = (() => {
    if (!currentLink || !currentLink.perm) return true;
    if (user?.role === "super_admin") return true;
    if (user?.permissions?.includes("all")) return true;
    return user?.permissions?.includes(currentLink.perm);
  })();

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <Database className="h-6 w-6 text-primary" />
          <span className="">DoctorBiology</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 mt-auto">
        <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/20 md:block sticky top-0 h-screen">
        <SidebarContent />
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/20 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur-sm">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            {/* @ts-expect-error - Radix UI type mismatch for asChild */}
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SidebarContent />
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-50/50 dark:bg-transparent relative">
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
