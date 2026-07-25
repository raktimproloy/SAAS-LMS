"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { StudentSidebar } from "./StudentSidebar";

export function StudentHeader() {
  const [student, setStudent] = useState<{name: string, photo: string | null} | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    <header className="flex h-20 items-center justify-between border-b border-border/40 bg-background/20 backdrop-blur-2xl px-8 w-full text-foreground relative z-20" data-aos="fade-down" data-aos-duration="600">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger 
            render={
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 border-none bg-transparent shadow-2xl !w-64 !max-w-[16rem]" showCloseButton={false}>
            <div className="relative w-full h-full">
              <StudentSidebar onLinkClick={() => setIsSheetOpen(false)} LinkWrapper={SheetClose} />
              
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-5 right-4 lg:hidden h-10 w-10 text-muted-foreground hover:text-foreground shrink-0 z-50 bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-xl border border-white/10">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
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
