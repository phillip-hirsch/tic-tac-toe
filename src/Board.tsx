import { type KeyboardEvent, type Ref, useState } from "react";
import type { Cell, Line, Mark as MarkType } from "./game.ts";
import { GhostMark, GridLines, Mark, Strike } from "./Strokes.tsx";

type Props = {
  board: readonly Cell[];
  /** The top-left Cell, for moving focus there when a fresh Game starts. */
  firstCellRef?: Ref<HTMLButtonElement>;
  winningLine?: Line;
  /** The Mark a Move would place, previewed on empty Cells. Omitted once the Game is over. */
  turn?: MarkType;
  disabled: boolean;
  onMove: (cell: number) => void;
};

/**
 * A fixed square from the viewport: the full width less the page margins, or the height left
 * after the heading, status line, controls and gaps (18rem on phones, 21rem from `sm`),
 * whichever is smaller. Never below 9rem, so Cells stay 48px or more, and never above 32rem.
 */
const boardSize =
  "size-[clamp(9rem,min(100vw_-_2rem,100dvh_-_18rem),32rem)] sm:size-[clamp(9rem,min(100vw_-_3rem,100dvh_-_21rem),32rem)]";

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

export function Board({ board, firstCellRef, winningLine, turn, disabled, onMove }: Props) {
  // Roving tabindex: only the last focused Cell is in the Tab order, so focusing
  // any Cell (including through firstCellRef) moves the Board's Tab stop there.
  const [active, setActive] = useState(0);

  return (
    <div
      role="grid"
      aria-label="Board"
      className={`relative grid shrink-0 grid-cols-3 grid-rows-3 ${boardSize}`}
    >
      <GridLines />
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
                className={`group relative ${disabled || cell ? "cursor-default" : "cursor-pointer"}`}
              >
                {cell ? (
                  <Mark mark={cell} cell={i} />
                ) : (
                  turn && !disabled && <GhostMark mark={turn} cell={i} />
                )}
              </button>
            );
          })}
        </div>
      ))}
      {winningLine && <Strike line={winningLine} />}
    </div>
  );
}
