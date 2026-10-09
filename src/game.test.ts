import { describe, expect, it } from "vite-plus/test";
import { type GameEvent, gameReducer, initialState } from "./game.ts";

const start: GameEvent = { type: "start", names: { X: "Ada", O: "Grace" } };

const newPlayers: GameEvent = { type: "newPlayers" };

const move = (cell: number): GameEvent => ({ type: "move", cell });

const rematch: GameEvent = { type: "rematch" };

const restart: GameEvent = { type: "restart" };

const freshGame = {
  phase: "playing",
  players: { X: "Ada", O: "Grace" },
  board: [null, null, null, null, null, null, null, null, null],
  turn: "X",
};

// Each Line, with three other Cells that never complete a Line themselves.
const lines = [
  { name: "top row", line: [0, 1, 2], others: [3, 4, 8] },
  { name: "middle row", line: [3, 4, 5], others: [0, 1, 6] },
  { name: "bottom row", line: [6, 7, 8], others: [0, 1, 5] },
  { name: "left column", line: [0, 3, 6], others: [1, 2, 4] },
  { name: "middle column", line: [1, 4, 7], others: [0, 2, 3] },
  { name: "right column", line: [2, 5, 8], others: [0, 1, 3] },
  { name: "diagonal from top left", line: [0, 4, 8], others: [1, 2, 3] },
  { name: "diagonal from top right", line: [2, 4, 6], others: [0, 1, 3] },
];

// Ends X O X / X O O / O X X with no Line filled.
const drawnGame = [0, 1, 2, 4, 3, 5, 7, 6, 8].map(move);

function play(...events: GameEvent[]) {
  return events.reduce(gameReducer, initialState);
}

describe("Game", () => {
  it("starts with an empty Board and X to move", () => {
    expect(play(start)).toEqual({
      phase: "playing",
      players: { X: "Ada", O: "Grace" },
      board: [null, null, null, null, null, null, null, null, null],
      turn: "X",
    });
  });

  it("places the Mark of the Player whose Turn it is and passes the Turn", () => {
    expect(play(start, move(4))).toMatchObject({
      board: [null, null, null, null, "X", null, null, null, null],
      turn: "O",
    });
    expect(play(start, move(4), move(0))).toMatchObject({
      board: ["O", null, null, null, "X", null, null, null, null],
      turn: "X",
    });
  });

  it("ignores a Move on a filled Cell", () => {
    const state = play(start, move(4));
    expect(gameReducer(state, move(4))).toBe(state);
  });

  it.each([-1, 9, 1.5])("ignores a Move on Cell index %s, which is off the Board", (cell) => {
    const state = play(start, move(4));
    expect(gameReducer(state, move(cell))).toBe(state);
  });

  describe.each(lines)("the $name", ({ line, others }) => {
    it("is a Win for X when X fills it", () => {
      const [a, b, c] = line;
      const [p, q] = others;
      expect(play(start, move(a), move(p), move(b), move(q), move(c))).toMatchObject({
        phase: "finished",
        players: { X: "Ada", O: "Grace" },
        outcome: { kind: "win", mark: "X", line },
      });
    });

    it("is a Win for O when O fills it", () => {
      const [a, b, c] = line;
      const [p, q, r] = others;
      expect(play(start, move(p), move(a), move(q), move(b), move(r), move(c))).toMatchObject({
        phase: "finished",
        players: { X: "Ada", O: "Grace" },
        outcome: { kind: "win", mark: "O", line },
      });
    });
  });

  it("is a Draw when every Cell is filled and no Line is complete", () => {
    expect(play(start, ...drawnGame)).toEqual({
      phase: "finished",
      players: { X: "Ada", O: "Grace" },
      board: ["X", "O", "X", "X", "O", "O", "O", "X", "X"],
      outcome: { kind: "draw" },
    });
  });

  it("is not a Draw while a Cell is empty, even when no Win is possible", () => {
    expect(play(start, ...drawnGame.slice(0, 8))).toMatchObject({ phase: "playing", turn: "X" });
  });

  it("is a Win, not a Draw, when the final Move fills the Board and completes a Line", () => {
    expect(play(start, ...[0, 1, 2, 3, 5, 4, 7, 6, 8].map(move))).toEqual({
      phase: "finished",
      players: { X: "Ada", O: "Grace" },
      board: ["X", "O", "X", "O", "O", "X", "O", "X", "X"],
      outcome: { kind: "win", mark: "X", line: [2, 5, 8] },
    });
  });

  it("ignores a Move after a Win", () => {
    const state = play(start, ...[0, 3, 1, 4, 2].map(move));
    expect(gameReducer(state, move(8))).toBe(state);
  });

  it("ignores a Move after a Draw", () => {
    const state = play(start, ...drawnGame);
    expect(gameReducer(state, move(0))).toBe(state);
  });

  it("ignores a Move during Setup", () => {
    expect(gameReducer(initialState, move(0))).toBe(initialState);
  });

  it("Rematch after a Win starts a fresh Game between the same Players with X to move", () => {
    expect(play(start, ...[0, 3, 1, 4, 2].map(move), rematch)).toEqual(freshGame);
  });

  it("ignores a Rematch before an Outcome", () => {
    const state = play(start, move(4));
    expect(gameReducer(state, rematch)).toBe(state);
  });

  it("Restart abandons an unfinished Game for a fresh one between the same Players with X to move", () => {
    expect(play(start, move(4), move(0), move(8), restart)).toEqual(freshGame);
  });

  it("Rematch after a Draw starts a fresh Game between the same Players", () => {
    expect(play(start, ...drawnGame, rematch)).toEqual(freshGame);
  });

  it("ignores a Restart after a Win", () => {
    const state = play(start, ...[0, 3, 1, 4, 2].map(move));
    expect(gameReducer(state, restart)).toBe(state);
  });

  it("ignores a Restart after a Draw", () => {
    const state = play(start, ...drawnGame);
    expect(gameReducer(state, restart)).toBe(state);
  });

  it.each([
    ["Rematch", rematch],
    ["Restart", restart],
  ])("ignores a %s during Setup", (_, event) => {
    expect(gameReducer(initialState, event)).toBe(initialState);
  });

  it("X moves first and Turns alternate after a Rematch", () => {
    const state = play(start, ...drawnGame, rematch, move(0), move(1));
    expect(state).toMatchObject({ board: ["X", "O", null, null, null, null, null, null, null] });
  });
});

const startWith = (X: string, O: string): GameEvent => ({ type: "start", names: { X, O } });

describe("Setup", () => {
  it("opens on Setup with both names blank", () => {
    expect(initialState).toEqual({ phase: "setup", drafts: { X: "", O: "" } });
  });

  it("trims spaces from both ends of each Player's name", () => {
    expect(play(startWith("  Ada ", "\tGrace  "))).toMatchObject({
      players: { X: "Ada", O: "Grace" },
    });
  });

  it("caps each Player's name at 20 characters after trimming", () => {
    expect(play(startWith("  Bartholomew Fitzwilliam", "Ada Lovelace Byron King"))).toMatchObject({
      players: { X: "Bartholomew Fitzwill", O: "Ada Lovelace Byron K" },
    });
  });

  it("names a Player with a blank name after their Mark", () => {
    expect(play(startWith("", "   "))).toMatchObject({
      players: { X: "Player X", O: "Player O" },
    });
  });

  it("accepts the same name for both Players", () => {
    expect(play(startWith("Sam", "Sam"))).toMatchObject({ players: { X: "Sam", O: "Sam" } });
  });

  it("gives the first name X, and X makes the first Move", () => {
    const state = play(startWith("Ada", "Grace"), move(0));
    expect(state).toMatchObject({ players: { X: "Ada", O: "Grace" }, turn: "O" });
    expect(state).toMatchObject({ board: ["X", null, null, null, null, null, null, null, null] });
  });

  it("ignores start during a Game", () => {
    const state = play(start, move(4));
    expect(gameReducer(state, startWith("Bob", "Eve"))).toBe(state);
  });

  it("ignores start after an Outcome", () => {
    const state = play(start, ...drawnGame);
    expect(gameReducer(state, startWith("Bob", "Eve"))).toBe(state);
  });

  it("New players during a Game returns to Setup with the current names filled in", () => {
    expect(play(start, move(4), newPlayers)).toEqual({
      phase: "setup",
      drafts: { X: "Ada", O: "Grace" },
    });
  });

  it("New players after an Outcome returns to Setup with the current names filled in", () => {
    expect(play(startWith(" Ada ", ""), ...drawnGame, newPlayers)).toEqual({
      phase: "setup",
      drafts: { X: "Ada", O: "Player O" },
    });
  });

  it("ignores New players during Setup", () => {
    expect(gameReducer(initialState, newPlayers)).toBe(initialState);
  });

  it("starts a Game with new names after New players", () => {
    expect(play(start, newPlayers, startWith("Bob", "Eve"))).toMatchObject({
      phase: "playing",
      players: { X: "Bob", O: "Eve" },
      turn: "X",
    });
  });
});
