import type { ReactNode } from "react";
import type { MotifPack } from "../types";

function IconBox({
  size,
  children,
}: {
  size: number;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Stethoscope({ size }: { size: number }) {
  return (
    <IconBox size={size}>
      <path d="M20 10v18a12 12 0 0 0 24 0V10" />
      <circle cx="20" cy="10" r="3" />
      <circle cx="44" cy="10" r="3" />
      <path d="M32 40v6a8 8 0 1 0 8 8" />
      <circle cx="44" cy="54" r="4" />
    </IconBox>
  );
}

function Dna({ size }: { size: number }) {
  return (
    <IconBox size={size}>
      <path d="M22 8c12 8 12 16 0 24s-12 16 0 24" />
      <path d="M42 8c-12 8-12 16 0 24s12 16 0 24" />
      <path d="M24 18h16M24 32h16M24 46h16" />
    </IconBox>
  );
}

function HeartPulse({ size }: { size: number }) {
  return (
    <IconBox size={size}>
      <path d="M32 52s-18-10-18-24a10 10 0 0 1 18-6 10 10 0 0 1 18 6c0 14-18 24-18 24z" />
      <path d="M14 30h8l4-8 6 16 4-8h8" />
    </IconBox>
  );
}

function Capsule({ size }: { size: number }) {
  return (
    <IconBox size={size}>
      <path d="M24 18h16a8 8 0 0 1 0 16H24a8 8 0 0 1 0-16z" />
      <path d="M32 18v16" />
    </IconBox>
  );
}

function Microscope({ size }: { size: number }) {
  return (
    <IconBox size={size}>
      <path d="M20 52h24" />
      <path d="M28 52V36l10-10" />
      <circle cx="42" cy="22" r="8" />
      <path d="M42 14v-4M42 30v4M34 22h-4M50 22h4" />
    </IconBox>
  );
}

const ITEMS: Array<{
  id: string;
  render: (size: number) => ReactNode;
  x: number;
  y: number;
  size: number;
  rotate: number;
  layer: 0 | 1 | 2 | 3;
  opacity: number;
  mobile?: boolean;
}> = [
  { id: "steth-1", render: (s) => <Stethoscope size={s} />, x: 10, y: 14, size: 88, rotate: -10, layer: 0, opacity: 0.5, mobile: true },
  { id: "dna-1", render: (s) => <Dna size={s} />, x: 78, y: 10, size: 72, rotate: 12, layer: 1, opacity: 0.48, mobile: true },
  { id: "heart-1", render: (s) => <HeartPulse size={s} />, x: 20, y: 40, size: 64, rotate: 8, layer: 2, opacity: 0.42, mobile: false },
  { id: "cap-1", render: (s) => <Capsule size={s} />, x: 88, y: 36, size: 56, rotate: -18, layer: 0, opacity: 0.45, mobile: true },
  { id: "micro-1", render: (s) => <Microscope size={s} />, x: 8, y: 68, size: 80, rotate: 6, layer: 3, opacity: 0.45, mobile: true },
  { id: "dna-2", render: (s) => <Dna size={s} />, x: 70, y: 58, size: 52, rotate: -14, layer: 1, opacity: 0.4, mobile: false },
  { id: "steth-2", render: (s) => <Stethoscope size={s} />, x: 42, y: 78, size: 68, rotate: 16, layer: 2, opacity: 0.48, mobile: true },
  { id: "heart-2", render: (s) => <HeartPulse size={s} />, x: 90, y: 80, size: 48, rotate: -8, layer: 0, opacity: 0.4, mobile: false },
  { id: "cap-2", render: (s) => <Capsule size={s} />, x: 50, y: 28, size: 44, rotate: 20, layer: 3, opacity: 0.38, mobile: false },
  { id: "micro-2", render: (s) => <Microscope size={s} />, x: 30, y: 90, size: 60, rotate: -6, layer: 1, opacity: 0.42, mobile: false },
];

export const medicalPack: MotifPack = ITEMS.map((item) => ({
  id: item.id,
  content: item.render(item.size),
  x: item.x,
  y: item.y,
  size: item.size,
  rotate: item.rotate,
  layer: item.layer,
  opacity: item.opacity,
  mobile: item.mobile,
}));
