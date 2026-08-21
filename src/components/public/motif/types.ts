import type { ReactNode } from "react";

export type MotifId = "bangla" | "medical";

export type MotifLayer = 0 | 1 | 2 | 3;

export interface MotifElement {
  id: string;
  content: ReactNode;
  /** Horizontal position as % of viewport */
  x: number;
  /** Vertical position as % of viewport */
  y: number;
  /** Size in px (width/height of the glyph box) */
  size: number;
  /** Rotation in degrees */
  rotate: number;
  /** Parallax layer: lower = slower / opposite direction grouping */
  layer: MotifLayer;
  /** Opacity 0–1 */
  opacity: number;
  /** If false, hidden on mobile (< md) */
  mobile?: boolean;
}

export type MotifPack = MotifElement[];
