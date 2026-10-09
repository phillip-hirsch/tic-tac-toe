import { type ReactNode, type RefObject, useReducer, useRef } from "react";
import { flushSync } from "react-dom";
import { Board } from "./Board.tsx";
import { primaryButton, secondaryButton } from "./buttons.ts";
import { type GameEvent, type GameState, gameReducer, initialState } from "./game.ts";
import { Setup } from "./Setup.tsx";

type GameInProgressOrOver = Exclude<GameState, { phase: "setup" }>;

function status(state: GameInProgressOrOver) {
  const { players } = state;
  if (state.phase === "playing") return `${players[state.turn]} (${state.turn}) to move`;
  const { outcome } = state;
  return outcome.kind === "win" ? `${players[outcome.mark]} (${outcome.mark}) wins` : "Draw";
}

/** Ref callback: focus the element once, when it mounts. */
const focusOnMount = (element: HTMLElement | null) => element?.focus();

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const xName = useRef<HTMLInputElement>(null);
  const firstCell = useRef<HTMLButtonElement>(null);

  /** Dispatch, render the next view, then move focus into it. */
  const dispatchAndFocus = (event: GameEvent, target: RefObject<HTMLElement | null>) => {
    flushSync(() => dispatch(event));
    target.current?.focus();
  };

  const playAgain = (type: "rematch" | "restart") => {
    dispatch({ type });
    firstCell.current?.focus();
  };

  if (state.phase === "setup") {
    return (
      <Main>
        <Setup
          drafts={state.drafts}
          xNameRef={xName}
          onStart={(names) => dispatchAndFocus({ type: "start", names }, firstCell)}
        />
      </Main>
    );
  }

  const winningLine =
    state.phase === "finished" && state.outcome.kind === "win" ? state.outcome.line : undefined;

  return (
    <Main>
      <p className="text-xl">{status(state)}</p>
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
        <button
          type="button"
          className={secondaryButton}
          onClick={() => dispatchAndFocus({ type: "newPlayers" }, xName)}
        >
          New players
        </button>
      </div>
    </Main>
  );
}

function Main({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-10 px-6 py-12">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Tic-tac-toe</h1>
      {children}
    </main>
  );
}

export default App;
