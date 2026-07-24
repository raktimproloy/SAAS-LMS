"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  GraduationCap, 
  CreditCard,
  Bell,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const navItems = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { title: "Profile", href: "/student/profile", icon: User },
  { title: "My Exams", href: "/student/exams", icon: GraduationCap },
  { title: "Study Materials", href: "/student/notes", icon: BookOpen },
  { title: "Payments", href: "/student/payments", icon: CreditCard },
  { title: "Notices", href: "/student/notices", icon: Bell },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // In a real app we'd have a logout API to clear the cookie
    // For now we can just clear it client side if it was not httpOnly,
    // But since it's httpOnly, we need to call an API.
    // Let's assume there is or will be an api/student/auth/logout. 
    // Or we can just redirect to login and let the login page overwrite the cookie if needed.
    // We'll redirect to login which isn't perfect without clearing, so let's call a logout route.
    await fetch('/api/student/auth/logout', { method: 'POST' });
    router.push('/student/login');
    router.refresh();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-16 items-center px-6 border-b">
        <h2 className="text-xl font-bold tracking-tight">Student Portal</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 mt-auto border-t">
        <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
