import { type RefObject, useReducer, useRef } from "react";
import { flushSync } from "react-dom";
import { Board } from "./Board.tsx";
import { type GameEvent, type GameState, gameReducer, initialState } from "./game.ts";
import { Setup } from "./Setup.tsx";

type GameInProgressOrOver = Exclude<GameState, { phase: "setup" }>;

function status(state: GameInProgressOrOver) {
  const { players } = state;
  if (state.phase === "playing") return `${players[state.turn]} (${state.turn}) to move`;
  const { outcome } = state;
  return outcome.kind === "win" ? `${players[outcome.mark]} (${outcome.mark}) wins` : "Draw";
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const xNameRef = useRef<HTMLInputElement>(null);
  const topLeftCellRef = useRef<HTMLButtonElement>(null);

  /** Dispatch, render the next view, then move focus into it. */
  const dispatchAndFocus = (event: GameEvent, target: RefObject<HTMLElement | null>) => {
    flushSync(() => dispatch(event));
    target.current?.focus();
  };

  const winningLine =
    state.phase === "finished" && state.outcome.kind === "win" ? state.outcome.line : undefined;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-10 px-6 py-12">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Tic-tac-toe</h1>
      {state.phase === "setup" ? (
        <Setup
          drafts={state.drafts}
          xNameRef={xNameRef}
          onStart={(names) => dispatchAndFocus({ type: "start", names }, topLeftCellRef)}
        />
      ) : (
        <>
          <p className="text-xl">{status(state)}</p>
          <Board
            board={state.board}
            winningLine={winningLine}
            disabled={state.phase === "finished"}
            onMove={(cell) => dispatch({ type: "move", cell })}
            topLeftCellRef={topLeftCellRef}
          />
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => dispatchAndFocus({ type: "newPlayers" }, xNameRef)}
              className="min-h-11 border-2 border-ink px-6 py-1 text-lg hover:bg-ink hover:text-paper"
            >
              New players
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default App;
