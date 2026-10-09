import { useReducer, useRef } from "react";
import { Board } from "./Board.tsx";
import { type GameState, gameReducer, initialState } from "./game.ts";

type GameInProgressOrOver = Exclude<GameState, { phase: "setup" }>;

// Until the Setup screen lands, every visit opens straight into a Game.
const startWithDefaultNames = (state: GameState) =>
  gameReducer(state, { type: "start", names: { X: "Player X", O: "Player O" } });

function status(state: GameInProgressOrOver) {
  const { players } = state;
  if (state.phase === "playing") return `${players[state.turn]} (${state.turn}) to move`;
  const { outcome } = state;
  return outcome.kind === "win" ? `${players[outcome.mark]} (${outcome.mark}) wins` : "Draw";
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
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-5 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Tic-tac-toe</h1>
      {/* Two lines are reserved so a long name wrapping never moves the Board. */}
      <p className="flex min-h-[2lh] items-center text-center text-lg wrap-anywhere sm:text-xl">
        {status(state)}
      </p>
      <Board
        board={state.board}
        firstCellRef={firstCell}
        winningLine={winningLine}
        turn={state.phase === "playing" ? state.turn : undefined}
        disabled={state.phase === "finished"}
        onMove={(cell) => dispatch({ type: "move", cell })}
      />
      <div className="flex min-h-11 flex-wrap justify-center gap-4">
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
