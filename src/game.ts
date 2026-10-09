export type Mark = "X" | "O";

/** A Cell is empty (null) or holds a Mark. */
export type Cell = Mark | null;

/** Each Player's name, keyed by their Mark. */
export type Names = Readonly<Record<Mark, string>>;

/** Three Cell indices in a row, column, or diagonal. */
export type Line = readonly [number, number, number];

export type Outcome =
  | { readonly kind: "win"; readonly mark: Mark; readonly line: Line }
  | { readonly kind: "draw" };

/** The row and column, each 0 to 2, of the Cell at an index in row-major order. */
export const rowAndColumn = (index: number) => [Math.floor(index / 3), index % 3] as const;

export type GameState =
  | { readonly phase: "setup"; readonly drafts: Names }
  | {
      readonly phase: "playing";
      readonly players: Names;
      /** Nine Cells in row-major order. */
      readonly board: readonly Cell[];
      readonly turn: Mark;
    }
  | {
      readonly phase: "finished";
      readonly players: Names;
      readonly board: readonly Cell[];
      readonly outcome: Outcome;
    };

export type GameEvent =
  | { readonly type: "start"; readonly names: Names }
  /** Place the Turn's Mark in the Cell at this index (0 to 8). */
  | { readonly type: "move"; readonly index: number }
  /** Return to Setup with the current names as drafts. */
  | { readonly type: "newPlayers" }
  /** A fresh Game between the same Players, after an Outcome. */
  | { readonly type: "rematch" }
  /** Abandon an unfinished Game for a fresh one between the same Players. */
  | { readonly type: "restart" };

export const initialState: GameState = { phase: "setup", drafts: { X: "", O: "" } };

/** The eight Lines, each with its name in words. */
const lines: readonly { readonly line: Line; readonly name: string }[] = [
  { line: [0, 1, 2], name: "the top row" },
  { line: [3, 4, 5], name: "the middle row" },
  { line: [6, 7, 8], name: "the bottom row" },
  { line: [0, 3, 6], name: "the left column" },
  { line: [1, 4, 7], name: "the middle column" },
  { line: [2, 5, 8], name: "the right column" },
  { line: [0, 4, 8], name: "the diagonal from top left" },
  { line: [2, 4, 6], name: "the diagonal from top right" },
];

/** A Line in words, such as "the top row". */
export const lineName = (line: Line) =>
  lines.find((l) => l.line.every((index, i) => index === line[i]))?.name ?? "a Line";

const emptyBoard: readonly Cell[] = Array(9).fill(null);

/** The most characters a Player's name keeps. */
export const maxNameLength = 20;

/** The name of a Player who left theirs blank. */
export const defaultName = (mark: Mark) => `Player ${mark}`;

/** Trim, cap at maxNameLength, and fall back to the default name when blank. */
const playerName = (names: Names, mark: Mark) =>
  names[mark].trim().slice(0, maxNameLength) || defaultName(mark);

const freshGame = (players: Names): GameState => ({
  phase: "playing",
  players,
  board: emptyBoard,
  turn: "X",
});

export function gameReducer(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "start":
      if (state.phase !== "setup") return state;
      return freshGame({ X: playerName(event.names, "X"), O: playerName(event.names, "O") });
    case "move": {
      if (state.phase !== "playing" || state.board[event.index] !== null) return state;
      const { players, turn } = state;
      const board = state.board.with(event.index, turn);
      const line = lines.find((l) => l.line.every((i) => board[i] === turn))?.line;
      if (line)
        return { phase: "finished", players, board, outcome: { kind: "win", mark: turn, line } };
      if (board.every((cell) => cell !== null)) {
        return { phase: "finished", players, board, outcome: { kind: "draw" } };
      }
      return { phase: "playing", players, board, turn: turn === "X" ? "O" : "X" };
    }
    case "newPlayers":
      return state.phase === "setup" ? state : { phase: "setup", drafts: state.players };
    case "rematch":
      return state.phase === "finished" ? freshGame(state.players) : state;
    case "restart":
      return state.phase === "playing" ? freshGame(state.players) : state;
  }
}
