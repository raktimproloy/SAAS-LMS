"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomePopupProps {
  enabled: boolean;
  title: string;
  text: string;
  image: string;
}

export function WelcomePopup({ enabled, title, text, image }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    
    // Check local storage to see if user has already seen the popup
    const hasSeenPopup = localStorage.getItem("welcome_popup_seen");
    
    if (!hasSeenPopup) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("welcome_popup_seen", "true");
  };

  if (!enabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
        {image && (
          <div className="w-full h-48 sm:h-56 bg-slate-100 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image} 
              alt="Welcome" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        <div className="p-6 pt-4 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-center text-primary">
              {title || "Welcome!"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {text}
          </div>
          <div className="pt-4 flex justify-center">
            <Button onClick={handleClose} size="lg" className="px-8 rounded-full shadow-md font-semibold">
              Get Started
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
