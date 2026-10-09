import type { Cell, Line } from "./game.ts";

type Props = {
  board: readonly Cell[];
  winningLine?: Line;
  disabled: boolean;
  onMove: (cell: number) => void;
};

/** Centre of the Cell at an index, in a 3×3 coordinate space. */
const centre = (i: number) => ({ x: (i % 3) + 0.5, y: Math.floor(i / 3) + 0.5 });

export function Board({ board, winningLine, disabled, onMove }: Props) {
  return (
    <div className="relative grid aspect-square w-full max-w-96 grid-cols-3">
      {board.map((cell, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${cell ?? "empty"}`}
          aria-disabled={disabled || cell !== null}
          onClick={() => onMove(i)}
          className={`grid place-items-center border-grid font-display text-6xl leading-none sm:text-7xl ${
            i % 3 < 2 ? "border-r-2" : ""
          } ${i < 6 ? "border-b-2" : ""} ${disabled || cell ? "cursor-default" : "cursor-pointer"}`}
        >
          {cell}
        </button>
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
