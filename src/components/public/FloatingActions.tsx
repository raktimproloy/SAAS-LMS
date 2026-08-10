"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Phone, GripHorizontal } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/svg";

const PHONE_NUMBER = "8801987654321";
const WHATSAPP_MESSAGE = encodeURIComponent("হ্যালো! Institute Web সম্পর্কে জানতে চাই।");

const STORAGE_KEY = "floating-actions-pos";

function getInitialPos() {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed.x >= 0 && parsed.x <= window.innerWidth - 64 &&
        parsed.y >= 0 && parsed.y <= window.innerHeight - 150
      ) {
        return parsed;
      }
    }
  } catch {}
  return {
    x: typeof window !== "undefined" ? window.innerWidth - 70 : 0,
    y: typeof window !== "undefined" ? window.innerHeight - 180 : 0,
  };
}

export function FloatingActions() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const hasDragged = useRef(false);

  useEffect(() => {
    setPos(getInitialPos());
    setMounted(true);
  }, []);

  const savePos = useCallback((p: { x: number; y: number }) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
  }, []);

  const clampPos = useCallback((x: number, y: number) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const btnW = 60; // width of pill
    const btnH = 140; // height of pill
    return {
      x: Math.max(8, Math.min(x, W - btnW - 8)),
      y: Math.max(8, Math.min(y, H - btnH - 8)),
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    hasDragged.current = false;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mouseX;
    const dy = e.clientY - dragStart.current.mouseY;
    
    // If moved more than 5px, it's a drag
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDragged.current = true;
      setIsDragging(true);
    }
    
    if (isDragging || hasDragged.current) {
      const newX = dragStart.current.posX + dx;
      const newY = dragStart.current.posY + dy;
      setPos(clampPos(newX, newY));
    }
  }, [isDragging, clampPos]);

  const onPointerUp = useCallback(() => {
    if (isDragging) {
      savePos(pos);
    }
    setIsDragging(false);
    dragStart.current = null;
  }, [isDragging, pos, savePos]);

  if (!mounted) return null;

  return (
    <div
      className="fixed z-50 flex flex-col items-center gap-3 bg-card/60 backdrop-blur-xl border border-white/10 p-2.5 rounded-full shadow-2xl hover:shadow-primary/20 transition-shadow duration-300"
      style={{
        left: pos.x,
        top: pos.y,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Drag Handle Area */}
      <div className="w-full flex justify-center py-1 opacity-50 hover:opacity-100 transition-opacity">
        <GripHorizontal className="w-5 h-5 text-foreground" />
      </div>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${PHONE_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 transition-transform active:scale-95 hover:scale-105"
        onClick={(e) => { if (hasDragged.current) e.preventDefault(); }}
        onPointerDown={(e) => e.stopPropagation()}
        title="WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>

      {/* Phone Button */}
      <a
        href={`tel:+${PHONE_NUMBER}`}
        className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 hover:scale-105"
        onClick={(e) => { if (hasDragged.current) e.preventDefault(); }}
        onPointerDown={(e) => e.stopPropagation()}
        title="Call Us"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
}
