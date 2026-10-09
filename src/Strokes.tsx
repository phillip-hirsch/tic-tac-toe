import type { CSSProperties } from "react";
import type { Line, Mark as MarkType } from "./game.ts";

/**
 * Pen strokes for a Cell, in a 100×100 space. X is two strokes, top-left to bottom-right, then
 * top-right to bottom-left. O is one counter-clockwise loop that overshoots where it started.
 * Each entry is [path, draw duration, delay] in seconds.
 */
const strokes: Record<MarkType, readonly (readonly [string, number, number])[]> = {
  X: [
    ["M23 21C39 37 59 61 79 80", 0.18, 0],
    ["M77 19C62 36 41 58 22 80", 0.18, 0.2],
  ],
  O: [["M56 18C36 15 20 31 21 52C22 72 37 84 54 82C72 80 82 64 80 46C78 29 64 18 45 21", 0.36, 0]],
};

/** A small, repeatable tilt per Cell so the Marks look placed by hand, not stamped. */
const tilt = (cell: number) => `${((cell * 5) % 7) - 3}deg`;

const svg = "pointer-events-none absolute inset-0 size-full";

type MarkProps = { mark: MarkType; cell: number };

/** A Mark drawn in ink, animated as a pen stroke when it first appears. */
export function Mark({ mark, cell }: MarkProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={svg} style={{ rotate: tilt(cell) }}>
      {strokes[mark].map(([d, duration, delay]) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          className="stroke-draw fill-none stroke-ink stroke-[7]"
          strokeLinecap="round"
          style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        />
      ))}
    </svg>
  );
}

/** A dotted tracing guide of the Mark a Move would place, shown on hover and focus. */
export function GhostMark({ mark, cell }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={`${svg} opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`}
      style={{ rotate: tilt(cell) }}
    >
      {strokes[mark].map(([d]) => (
        <path
          key={d}
          d={d}
          className="fill-none stroke-grid stroke-[4] [stroke-dasharray:0_9]"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/** The Board's two vertical and two horizontal lines, ruled freehand, in a 300×300 space. */
export function GridLines() {
  return (
    <svg viewBox="0 0 300 300" aria-hidden className={svg}>
      <path
        d="M101 8C98 90 103 200 99 292M199 6C202 100 197 210 201 293M7 99C90 102 210 96 293 101M8 201C100 198 200 204 292 199"
        className="fill-none stroke-grid stroke-3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Centre of the Cell at an index, in the Board's 300×300 space. */
const centre = (i: number) => ({ x: (i % 3) * 100 + 50, y: Math.floor(i / 3) * 100 + 50 });

/**
 * A slightly wavering pen line through the winning Line. It runs past the outer Cells' centres
 * and starts once the final Mark has been drawn.
 */
export function Strike({ line }: { line: Line }) {
  const a = centre(line[0]);
  const b = centre(line[2]);
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const [ux, uy] = [(b.x - a.x) / length, (b.y - a.y) / length];
  // A point `along` units from the first centre, nudged `off` units to one side.
  const at = (along: number, off: number) =>
    `${(a.x + ux * along - uy * off).toFixed(1)} ${(a.y + uy * along + ux * off).toFixed(1)}`;
  const d = `M${at(-32, 3)}C${at(length * 0.3, -5)} ${at(length * 0.7, 6)} ${at(length + 32, -2)}`;
  const timing: CSSProperties = { animationDuration: "0.45s", animationDelay: "0.4s" };
  return (
    <svg viewBox="0 0 300 300" aria-hidden className={svg}>
      <path
        d={d}
        pathLength={1}
        className="stroke-draw fill-none stroke-accent stroke-[9]"
        strokeLinecap="round"
        style={timing}
      />
    </svg>
  );
}
