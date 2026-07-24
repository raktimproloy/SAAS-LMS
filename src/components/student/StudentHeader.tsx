"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function StudentHeader() {
  const [student, setStudent] = useState<{name: string, photo: string | null} | null>(null);

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

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 w-full text-foreground">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <ThemeToggle />
        {student && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium leading-none">{student.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Student</p>
            </div>
            <Avatar>
              <AvatarImage src={student.photo || ""} alt={student.name} />
              <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
}
