"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Courses", href: "/courses" },
  { name: "Contact", href: "/contact" },
];

type LoginState = "none" | "student" | "admin";

export function Navbar({ initialLoginState = "none" }: { initialLoginState?: LoginState }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>(initialLoginState);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setLoginState(initialLoginState);
  }, [initialLoginState]);

  useEffect(() => {
    const activeIdx = navLinks.findIndex(
      (l) => l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
    );
    const el = navRefs.current[activeIdx];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const dashboardHref = loginState === "admin" ? "/admin/dashboard" : "/student/dashboard";
  const dashboardLabel = loginState === "admin" ? "Admin Dashboard" : "Dashboard";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Dna className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Doctor<span className="text-primary">Biology</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 relative">
            {/* Sliding active indicator */}
            <motion.div
              className="absolute bottom-0 h-0.5 rounded-full bg-primary"
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
            {navLinks.map((link, i) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  ref={(el) => { navRefs.current[i] = el; }}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {loginState !== "none" ? (
              <Link href={dashboardHref}>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 border-0 rounded-xl">
                  <LayoutDashboard className="h-4 w-4" />
                  {dashboardLabel}
                </Button>
              </Link>
            ) : (
              <Link href="/student/login">
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 border-0 rounded-xl">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: Theme + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-muted/60 border border-border text-foreground"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed top-[72px] left-4 right-4 z-50 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-3 flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                      >
                        {link.name}
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="mt-1 pt-3 border-t border-border">
                  {loginState !== "none" ? (
                    <Link href={dashboardHref} className="block">
                      <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl">
                        <LayoutDashboard className="h-4 w-4" />
                        {dashboardLabel}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/student/login" className="block">
                      <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl">
                        <LogIn className="h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
