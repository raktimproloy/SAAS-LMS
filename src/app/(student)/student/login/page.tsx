"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

const highlights = [
  { icon: BookOpen, title: "Classes & notes", desc: "Today’s routine and study materials in one place." },
  { icon: ClipboardList, title: "Homework", desc: "See what’s due and submit from your phone." },
  { icon: Trophy, title: "Results", desc: "Marks, GPA, and exam history whenever you need them." },
  { icon: CalendarCheck, title: "Attendance", desc: "Track present days without asking a teacher." },
];

export default function StudentLoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/student/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <div className="student-portal relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="animate-blob absolute -left-[12%] -top-[18%] h-[55vw] max-h-[720px] w-[55vw] max-w-[720px] rounded-full opacity-70 blur-[110px] dark:opacity-35"
          style={{ background: "hsl(var(--gradient-1) / 0.45)" }}
        />
        <div
          className="animate-blob animation-delay-2000 absolute -right-[10%] top-[18%] h-[42vw] max-h-[560px] w-[42vw] max-w-[560px] rounded-full opacity-70 blur-[110px] dark:opacity-35"
          style={{ background: "hsl(var(--gradient-2) / 0.4)" }}
        />
        <div
          className="animate-blob animation-delay-4000 absolute -bottom-[18%] left-[22%] h-[50vw] max-h-[640px] w-[50vw] max-w-[640px] rounded-full opacity-60 blur-[110px] dark:opacity-30"
          style={{ background: "hsl(var(--gradient-3) / 0.4)" }}
        />
      </div>

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">Student Portal</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 px-5 pb-12 pt-2 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Built for students
          </div>
          <h1 className="mt-5 max-w-md text-4xl font-black leading-tight tracking-tight text-foreground xl:text-5xl">
            Welcome back.
            <span className="mt-1 block text-primary">Your school day starts here.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Log in with your student ID or phone to see classes, homework, attendance, and results — all in one place.
          </p>

          <ul className="mt-10 grid grid-cols-2 gap-3">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
          <div className="rounded-[2rem] border border-border/80 bg-card/80 p-7 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-9">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 lg:mx-0">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Student sign in</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Use the ID or phone number your school gave you.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student ID or phone
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="studentId"
                    type="text"
                    autoComplete="username"
                    placeholder="Your ID or 01…"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="h-12 rounded-2xl border-border bg-background/80 pl-11 text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border-border bg-background/80 pl-11 pr-11 text-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Enter my dashboard"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              Forgot your password? Ask your class teacher or school office — they can reset it for you.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
