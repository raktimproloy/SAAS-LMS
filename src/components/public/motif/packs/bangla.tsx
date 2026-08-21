import type { MotifPack } from "../types";

function BanglaGlyph({
  char,
  size,
}: {
  char: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="select-none"
    >
      <text
        x="51.5"
        y="69.5"
        textAnchor="middle"
        fontSize="72"
        fontFamily="'Noto Sans Bengali', 'Hind Siliguri', 'Nikosh', 'Kalpurush', sans-serif"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {char}
      </text>
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontSize="72"
        fontFamily="'Noto Sans Bengali', 'Hind Siliguri', 'Nikosh', 'Kalpurush', sans-serif"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.92"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1.4 1.6"
      >
        {char}
      </text>
    </svg>
  );
}

const LETTERS: Array<{
  id: string;
  char: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  layer: 0 | 1 | 2 | 3;
  opacity: number;
  mobile?: boolean;
}> = [
  { id: "o", char: "অ", x: 8, y: 12, size: 88, rotate: -12, layer: 0, opacity: 0.55, mobile: true },
  { id: "aa", char: "আ", x: 78, y: 8, size: 72, rotate: 14, layer: 1, opacity: 0.5, mobile: true },
  { id: "i", char: "ই", x: 22, y: 28, size: 56, rotate: 8, layer: 2, opacity: 0.45, mobile: false },
  { id: "u", char: "উ", x: 88, y: 32, size: 64, rotate: -18, layer: 0, opacity: 0.5, mobile: true },
  { id: "e", char: "এ", x: 5, y: 48, size: 70, rotate: 6, layer: 3, opacity: 0.4, mobile: false },
  { id: "o2", char: "ও", x: 70, y: 48, size: 52, rotate: -10, layer: 1, opacity: 0.45, mobile: false },
  { id: "ko", char: "ক", x: 42, y: 18, size: 48, rotate: 20, layer: 2, opacity: 0.4, mobile: true },
  { id: "kho", char: "খ", x: 15, y: 68, size: 80, rotate: -8, layer: 0, opacity: 0.5, mobile: true },
  { id: "go", char: "গ", x: 85, y: 62, size: 60, rotate: 12, layer: 3, opacity: 0.45, mobile: false },
  { id: "gho", char: "ঘ", x: 55, y: 72, size: 44, rotate: -22, layer: 1, opacity: 0.4, mobile: false },
  { id: "cho", char: "চ", x: 32, y: 82, size: 68, rotate: 10, layer: 2, opacity: 0.48, mobile: true },
  { id: "jo", char: "জ", x: 92, y: 78, size: 50, rotate: -6, layer: 0, opacity: 0.42, mobile: false },
  { id: "to", char: "ত", x: 48, y: 42, size: 40, rotate: 16, layer: 3, opacity: 0.38, mobile: false },
  { id: "no", char: "ন", x: 62, y: 22, size: 58, rotate: -14, layer: 1, opacity: 0.45, mobile: true },
  { id: "bo", char: "ব", x: 28, y: 55, size: 46, rotate: 4, layer: 2, opacity: 0.4, mobile: false },
  { id: "mo", char: "ম", x: 75, y: 88, size: 74, rotate: -16, layer: 0, opacity: 0.48, mobile: true },
  { id: "ro", char: "র", x: 10, y: 88, size: 54, rotate: 18, layer: 3, opacity: 0.42, mobile: false },
  { id: "sho", char: "শ", x: 50, y: 92, size: 62, rotate: -4, layer: 1, opacity: 0.4, mobile: false },
  { id: "oo", char: "ঊ", x: 18, y: 6, size: 44, rotate: 22, layer: 2, opacity: 0.34, mobile: false },
  { id: "oi", char: "ঐ", x: 36, y: 8, size: 52, rotate: -10, layer: 3, opacity: 0.33, mobile: true },
  { id: "ou", char: "ঔ", x: 58, y: 6, size: 46, rotate: 8, layer: 0, opacity: 0.32, mobile: false },
  { id: "ngo", char: "ঙ", x: 94, y: 16, size: 36, rotate: -14, layer: 2, opacity: 0.28, mobile: false },
  { id: "chho", char: "ছ", x: 10, y: 24, size: 42, rotate: 14, layer: 1, opacity: 0.3, mobile: true },
  { id: "jho", char: "ঝ", x: 48, y: 26, size: 40, rotate: -20, layer: 0, opacity: 0.28, mobile: false },
  { id: "tto", char: "ট", x: 74, y: 26, size: 38, rotate: 12, layer: 3, opacity: 0.3, mobile: true },
  { id: "ttho", char: "ঠ", x: 28, y: 38, size: 34, rotate: -8, layer: 2, opacity: 0.27, mobile: false },
  { id: "ddo", char: "ড", x: 58, y: 38, size: 38, rotate: 18, layer: 1, opacity: 0.29, mobile: true },
  { id: "ddho", char: "ঢ", x: 80, y: 40, size: 34, rotate: -12, layer: 0, opacity: 0.27, mobile: false },
  { id: "nno", char: "ণ", x: 42, y: 50, size: 32, rotate: 10, layer: 3, opacity: 0.26, mobile: false },
  { id: "tho", char: "থ", x: 92, y: 52, size: 36, rotate: -18, layer: 2, opacity: 0.28, mobile: false },
  { id: "dho", char: "ধ", x: 6, y: 60, size: 40, rotate: 8, layer: 1, opacity: 0.3, mobile: false },
  { id: "pho", char: "ফ", x: 40, y: 64, size: 34, rotate: -6, layer: 0, opacity: 0.28, mobile: true },
  { id: "bho", char: "ভ", x: 62, y: 66, size: 42, rotate: 16, layer: 3, opacity: 0.31, mobile: false },
  { id: "yo", char: "য", x: 82, y: 70, size: 36, rotate: -10, layer: 1, opacity: 0.27, mobile: true },
  { id: "lo", char: "ল", x: 22, y: 74, size: 32, rotate: 14, layer: 2, opacity: 0.26, mobile: false },
  { id: "sso", char: "ষ", x: 66, y: 80, size: 34, rotate: -16, layer: 0, opacity: 0.28, mobile: false },
  { id: "so", char: "স", x: 90, y: 90, size: 42, rotate: 6, layer: 2, opacity: 0.3, mobile: true },
  { id: "ho", char: "হ", x: 4, y: 94, size: 38, rotate: -14, layer: 1, opacity: 0.29, mobile: false },
  { id: "kkho", char: "ক্ষ", x: 34, y: 96, size: 48, rotate: 12, layer: 3, opacity: 0.31, mobile: false },
  { id: "ggo", char: "জ্ঞ", x: 62, y: 96, size: 44, rotate: -8, layer: 0, opacity: 0.3, mobile: false },
];

export const banglaPack: MotifPack = LETTERS.map((l) => ({
  id: l.id,
  content: <BanglaGlyph char={l.char} size={l.size} />,
  x: l.x,
  y: l.y,
  size: l.size,
  rotate: l.rotate,
  layer: l.layer,
  opacity: l.opacity,
  mobile: l.mobile,
}));
