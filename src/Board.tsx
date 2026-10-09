import type { Ref } from "react";
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
 * after the heading, status line and controls, whichever is smaller. Never below 9rem, so Cells
 * stay 48px or more, and never above 32rem on large screens.
 */
const boardSize =
  "size-[clamp(9rem,min(100vw_-_2rem,100dvh_-_16rem),32rem)] sm:size-[clamp(9rem,min(100vw_-_3rem,100dvh_-_21rem),32rem)]";

export function Board({ board, firstCellRef, winningLine, turn, disabled, onMove }: Props) {
  return (
    <div className={`relative grid shrink-0 grid-cols-3 grid-rows-3 ${boardSize}`}>
      <GridLines />
      {board.map((cell, i) => (
        <button
          key={i}
          ref={i === 0 ? firstCellRef : undefined}
          type="button"
          aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${cell ?? "empty"}`}
          aria-disabled={disabled || cell !== null}
          onClick={() => onMove(i)}
          className={`group relative ${disabled || cell ? "cursor-default" : "cursor-pointer"}`}
        >
          {cell ? (
            <Mark mark={cell} cell={i} />
          ) : (
            turn && !disabled && <GhostMark mark={turn} cell={i} />
          )}
        </button>
      ))}
      {winningLine && <Strike line={winningLine} />}
    </div>
  );
}
