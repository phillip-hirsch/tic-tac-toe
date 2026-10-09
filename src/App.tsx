import { useReducer, useRef } from "react";
import { Board } from "./Board.tsx";
import { type GameState, gameReducer, initialState } from "./game.ts";

type GameInProgressOrOver = Exclude<GameState, { phase: "setup" }>;

// Until the Setup screen lands, every visit opens straight into a Game.
const startWithDefaultNames = (state: GameState) =>
  gameReducer(state, { type: "start", names: { X: "Player X", O: "Player O" } });

// The Line in words, keyed by its Cell indices.
const lineNames: Record<string, string> = {
  "0,1,2": "the top row",
  "3,4,5": "the middle row",
  "6,7,8": "the bottom row",
  "0,3,6": "the left column",
  "1,4,7": "the middle column",
  "2,5,8": "the right column",
  "0,4,8": "the diagonal from top left",
  "2,4,6": "the diagonal from top right",
};

function status(state: GameInProgressOrOver) {
  const { players } = state;
  if (state.phase === "playing") return `${players[state.turn]} (${state.turn}) to move`;
  const { outcome } = state;
  return outcome.kind === "win"
    ? `${players[outcome.mark]} (${outcome.mark}) wins with ${lineNames[outcome.line.join()]}`
    : "Draw";
}

const button = "min-h-11 rounded-sm px-6 text-lg";
const primaryButton = `${button} bg-ink text-paper`;
const secondaryButton = `${button} border-2 border-grid hover:border-ink`;

/** Ref callback: focus the element once, when it mounts. */
const focusOnMount = (element: HTMLElement | null) => element?.focus();

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState, startWithDefaultNames);
  const firstCell = useRef<HTMLButtonElement>(null);
  if (state.phase === "setup") return null;

  const playAgain = (type: "rematch" | "restart") => {
    dispatch({ type });
    firstCell.current?.focus();
  };

  const winningLine =
    state.phase === "finished" && state.outcome.kind === "win" ? state.outcome.line : undefined;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-10 px-6 py-12">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Tic-tac-toe</h1>
      {/* The status line doubles as the polite live region for Turns and Outcomes. */}
      <p role="status" className="text-xl">
        {status(state)}
      </p>
      <Board
        board={state.board}
        firstCellRef={firstCell}
        winningLine={winningLine}
        disabled={state.phase === "finished"}
        onMove={(cell) => dispatch({ type: "move", cell })}
      />
      <div className="flex flex-wrap justify-center gap-4">
        {state.phase === "finished" ? (
          <button
            ref={focusOnMount}
            type="button"
            className={primaryButton}
            onClick={() => playAgain("rematch")}
          >
            Rematch
          </button>
        ) : (
          <button type="button" className={secondaryButton} onClick={() => playAgain("restart")}>
            Restart
          </button>
        )}
      </div>
    </main>
  );
}

export default App;
