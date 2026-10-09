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
  | { readonly type: "move"; readonly cell: number }
  /** Return to Setup with the current names as drafts. */
  | { readonly type: "newPlayers" };

export const initialState: GameState = { phase: "setup", drafts: { X: "", O: "" } };

const lines: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const emptyBoard: readonly Cell[] = Array(9).fill(null);

/** Trim, cap at 20 characters, and fall back to "Player X" or "Player O" when blank. */
const playerName = (names: Names, mark: Mark) =>
  names[mark].trim().slice(0, 20) || `Player ${mark}`;

export function gameReducer(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "start":
      if (state.phase !== "setup") return state;
      return {
        phase: "playing",
        players: { X: playerName(event.names, "X"), O: playerName(event.names, "O") },
        board: emptyBoard,
        turn: "X",
      };
    case "move": {
      if (state.phase !== "playing" || state.board[event.cell] !== null) return state;
      const { players, turn } = state;
      const board = state.board.with(event.cell, turn);
      const line = lines.find((l) => l.every((i) => board[i] === turn));
      if (line)
        return { phase: "finished", players, board, outcome: { kind: "win", mark: turn, line } };
      if (board.every((cell) => cell !== null)) {
        return { phase: "finished", players, board, outcome: { kind: "draw" } };
      }
      return { phase: "playing", players, board, turn: turn === "X" ? "O" : "X" };
    }
    case "newPlayers":
      return state.phase === "setup" ? state : { phase: "setup", drafts: state.players };
  }
}
