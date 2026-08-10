"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { PenTool, BookOpen, GraduationCap, Edit3, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingBackground() {
  const { scrollY } = useScroll();
  
  // Parallax transforms - subtle, so it doesn't affect performance heavily
  const y1 = useTransform(scrollY, [0, 2000], [0, -300]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -150]);
  const y3 = useTransform(scrollY, [0, 2000], [0, -200]);
  const y4 = useTransform(scrollY, [0, 2000], [0, -400]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const iconBaseClass = "text-primary/10 dark:text-primary/10 absolute will-change-transform";

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blurs and gradients for premium feel */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-sky-500/5 rounded-full blur-[120px] mix-blend-screen" />
      
      {/* Floating Outlined Icons */}
      <motion.div style={{ y: y1 }} className="absolute top-[15%] left-[10%] opacity-50 hidden md:block">
        <PenTool className={`${iconBaseClass} w-24 h-24 rotate-12`} />
      </motion.div>
      
      <motion.div style={{ y: y2 }} className="absolute top-[35%] right-[15%] opacity-50">
        <BookOpen className={`${iconBaseClass} w-32 h-32 -rotate-12`} />
      </motion.div>
      
      <motion.div style={{ y: y3 }} className="absolute top-[60%] left-[20%] opacity-40">
        <GraduationCap className={`${iconBaseClass} w-40 h-40 rotate-6`} />
      </motion.div>
      
      <motion.div style={{ y: y4 }} className="absolute top-[80%] right-[10%] opacity-50 hidden lg:block">
        <Edit3 className={`${iconBaseClass} w-20 h-20 -rotate-45`} />
      </motion.div>

      <motion.div style={{ y: y1 }} className="absolute top-[90%] left-[40%] opacity-30">
        <Lightbulb className={`${iconBaseClass} w-16 h-16 rotate-180`} />
      </motion.div>
    </div>
  );
}
