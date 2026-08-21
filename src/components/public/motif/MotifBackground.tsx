"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getMotifPack } from "./packs";
import type { MotifElement, MotifId, MotifLayer } from "./types";

const LAYER_RANGES: Record<MotifLayer, [number, number]> = {
  0: [0, -120],
  1: [0, 78],
  2: [0, -64],
  3: [0, 96],
};

interface MotifBackgroundProps {
  motif?: MotifId;
}

function MotifGlyph({
  el,
  scrollY,
  reduceMotion,
  index,
}: {
  el: MotifElement;
  scrollY: ReturnType<typeof useTransform<number, number>>;
  reduceMotion: boolean | null;
  index: number;
}) {
  const mobileHidden = el.mobile === false ? "hidden md:block" : "block";

  return (
    <motion.div
      style={{
        left: `${el.x}%`,
        top: `${el.y}%`,
        y: reduceMotion ? 0 : scrollY,
        rotate: el.rotate,
        opacity: Math.min(el.opacity + 0.12, 0.72),
        color: "hsl(var(--motif-color))",
        filter: "drop-shadow(0 0 10px hsl(var(--motif-glow) / 0.18))",
      }}
      className={`absolute will-change-transform ${mobileHidden}`}
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -5, 0, 4, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 13 + (index % 5) * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (index % 7) * 0.35,
              }
        }
      >
        {el.content}
      </motion.div>
    </motion.div>
  );
}

export function MotifBackground({ motif = "bangla" }: MotifBackgroundProps) {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const pack = useMemo(() => getMotifPack(motif), [motif]);

  const y0 = useTransform(scrollY, [0, 2000], LAYER_RANGES[0]);
  const y1 = useTransform(scrollY, [0, 2000], LAYER_RANGES[1]);
  const y2 = useTransform(scrollY, [0, 2000], LAYER_RANGES[2]);
  const y3 = useTransform(scrollY, [0, 2000], LAYER_RANGES[3]);

  const layerY = [y0, y1, y2, y3] as const;

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden
    >
      <div className="absolute top-0 right-0 h-1/2 w-1/2 rounded-full bg-[hsl(var(--motif-glow)/0.16)] blur-[140px]" />
      <div className="absolute bottom-0 left-0 h-1/2 w-1/2 rounded-full bg-[hsl(var(--primary)/0.12)] blur-[140px]" />
      <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-[hsl(var(--motif-glow)/0.08)] blur-[120px]" />

      {pack.map((el, index) => (
        <MotifGlyph
          key={el.id}
          el={el}
          scrollY={layerY[el.layer]}
          reduceMotion={reduceMotion}
          index={index}
        />
      ))}
    </div>
  );
}
