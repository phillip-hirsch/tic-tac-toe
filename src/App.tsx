import { type RefObject, useReducer, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Board } from "./Board.tsx";
import { button, primaryButton, secondaryButton } from "./buttons.ts";
import { type GameEvent, type GameState, gameReducer, initialState, lineName } from "./game.ts";
import { Setup } from "./Setup.tsx";

/** The Turn or Outcome in words, or nothing during Setup. */
function announcement(state: GameState) {
  if (state.phase === "setup") return "";
  const { players } = state;
  if (state.phase === "playing") return `${players[state.turn]} (${state.turn}) to move`;
  const { outcome } = state;
  return outcome.kind === "win"
    ? `${players[outcome.mark]} (${outcome.mark}) wins with ${lineName(outcome.line)}`
    : "Draw";
}

/** Ref callback: focus the element once, when it mounts. */
const focusOnMount = (element: HTMLElement | null) => element?.focus();

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  // Bumped whenever the view changes, so the live region announces it even when the words repeat.
  const [views, setViews] = useState(0);
  const xName = useRef<HTMLInputElement>(null);
  const firstCell = useRef<HTMLButtonElement>(null);

  /** Dispatch, render and announce the next view, then move focus into it. */
  const dispatchAndFocus = (event: GameEvent, target: RefObject<HTMLElement | null>) => {
    flushSync(() => {
      dispatch(event);
      setViews((n) => n + 1);
    });
    target.current?.focus();
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-5 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Tic-tac-toe</h1>
      {state.phase === "setup" ? (
        <Setup
          drafts={state.drafts}
          xNameRef={xName}
          onStart={(names) => dispatchAndFocus({ type: "start", names }, firstCell)}
        />
      ) : (
        <>
          {/* Room is reserved for the longest status, so wrapping never moves the Board. */}
          <p className="flex min-h-[3lh] items-center text-center text-lg wrap-anywhere sm:min-h-[2lh] sm:text-xl">
            {announcement(state)}
          </p>
          <Board
            board={state.board}
            firstCellRef={firstCell}
            winningLine={
              state.phase === "finished" && state.outcome.kind === "win"
                ? state.outcome.line
                : undefined
            }
            turn={state.phase === "playing" ? state.turn : undefined}
            onMove={(index) => dispatch({ type: "move", index })}
          />
          <div className="flex min-h-11 flex-wrap justify-center gap-3 sm:gap-4">
            {/* Restart and Rematch share one slot, sized by an unseen copy of the other label,
                so an Outcome never moves or resizes a control. */}
            <div className="grid *:col-start-1 *:row-start-1">
              {state.phase === "finished" ? (
                <button
                  ref={focusOnMount}
                  type="button"
                  className={primaryButton}
                  onClick={() => dispatchAndFocus({ type: "rematch" }, firstCell)}
                >
                  Rematch
                </button>
              ) : (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => dispatchAndFocus({ type: "restart" }, firstCell)}
                >
                  Restart
                </button>
              )}
              <span className={`${button} invisible`}>
                {state.phase === "finished" ? "Restart" : "Rematch"}
              </span>
            </div>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => dispatchAndFocus({ type: "newPlayers" }, xName)}
            >
              New players
            </button>
          </div>
        </>
      )}
      {/* The one polite live region, mounted for the app's lifetime (W3C ARIA22). Each view
          gets a fresh span, an addition screen readers announce even when the words repeat. */}
      <p role="status" className="sr-only">
        <span key={views}>{announcement(state)}</span>
      </p>
    </main>
  );
}

export default App;
