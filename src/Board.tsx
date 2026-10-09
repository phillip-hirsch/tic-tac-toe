import { type KeyboardEvent, type Ref, useState } from "react";
import type { Cell, Line } from "./game.ts";

type Props = {
  board: readonly Cell[];
  /** The top-left Cell, for moving focus there when a fresh Game starts. */
  firstCellRef?: Ref<HTMLButtonElement>;
  winningLine?: Line;
  disabled: boolean;
  onMove: (cell: number) => void;
};

/** Centre of the Cell at an index, in a 3×3 coordinate space. */
const centre = (i: number) => ({ x: (i % 3) + 0.5, y: Math.floor(i / 3) + 0.5 });

/** Row and column step for each arrow key. */
const steps: Partial<Record<string, readonly [number, number]>> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

const clamp = (n: number) => Math.min(2, Math.max(0, n));

/** Focus the Cell an arrow key points to, stopping at the Board's edges. */
function onKeyDown(e: KeyboardEvent<HTMLElement>, i: number) {
  const step = steps[e.key];
  if (!step) return;
  e.preventDefault();
  const next = clamp(Math.floor(i / 3) + step[0]) * 3 + clamp((i % 3) + step[1]);
  e.currentTarget
    .closest("[role=grid]")
    ?.querySelectorAll<HTMLElement>("[role=gridcell]")
    [next].focus();
}

const rows = [0, 1, 2];

export function Board({ board, firstCellRef, winningLine, disabled, onMove }: Props) {
  // Roving tabindex: only the last focused Cell is in the Tab order, so focusing
  // any Cell (including through firstCellRef) moves the Board's Tab stop there.
  const [active, setActive] = useState(0);

  return (
    <div
      role="grid"
      aria-label="Board"
      className="relative grid aspect-square w-full max-w-96 grid-cols-3"
    >
      {rows.map((r) => (
        <div key={r} role="row" className="contents">
          {board.slice(r * 3, r * 3 + 3).map((cell, c) => {
            const i = r * 3 + c;
            return (
              <button
                key={i}
                ref={i === 0 ? firstCellRef : undefined}
                type="button"
                role="gridcell"
                tabIndex={i === active ? 0 : -1}
                aria-label={`Row ${r + 1}, column ${c + 1}, ${cell ?? "empty"}`}
                aria-disabled={disabled || cell !== null}
                onFocus={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                onClick={() => onMove(i)}
                className={`grid place-items-center border-grid font-display text-6xl leading-none sm:text-7xl ${
                  c < 2 ? "border-r-2" : ""
                } ${r < 2 ? "border-b-2" : ""} ${disabled || cell ? "cursor-default" : "cursor-pointer"}`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      ))}
      {winningLine && <Strike line={winningLine} />}
    </div>
  );
}

function Strike({ line }: { line: Line }) {
  const from = centre(line[0]);
  const to = centre(line[2]);
  // Run a little past the outer Cells' centres, as a pen stroke would.
  const dx = (to.x - from.x) * 0.15;
  const dy = (to.y - from.y) * 0.15;
  return (
    <svg viewBox="0 0 3 3" aria-hidden className="pointer-events-none absolute inset-0 size-full">
      <line
        x1={from.x - dx}
        y1={from.y - dy}
        x2={to.x + dx}
        y2={to.y + dy}
        className="stroke-accent"
        strokeWidth={6}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
