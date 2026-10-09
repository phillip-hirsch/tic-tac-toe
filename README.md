# Tic-tac-toe

Two Players take turns on one device. Play it at **https://tic-tac-toe.phillip-b52.workers.dev**.

- Enter names for X and O, or leave them blank to play as "Player X" and "Player O".
- X always moves first. A full Board with no Win is a Draw.
- Rematch after a Win or Draw, Restart mid-Game, or switch to New players at any time.
- Playable by keyboard (arrow keys, Enter or Space) and screen reader.
- Light and dark themes follow the system setting.
- Nothing is saved. Refreshing the page returns to an empty Setup screen.

Built with React 19, Tailwind CSS v4 and [Vite+](https://viteplus.dev/). Domain terms are defined in [GLOSSARY.md](GLOSSARY.md).

## Develop

| Command      | What it does                                                   |
| ------------ | -------------------------------------------------------------- |
| `vp install` | Install dependencies                                           |
| `vp dev`     | Start the dev server (runs through the Cloudflare Vite plugin) |
| `vp check`   | Format, lint and type check                                    |
| `vp test`    | Run the game rule tests in `src/game.test.ts`                  |

All game rules live in `src/game.ts`, a pure reducer with no React or DOM imports. It is the only code with automated tests. The UI is checked by hand.

## Deploy

The app deploys to Cloudflare Workers as a static-assets Worker named `tic-tac-toe`. The `cf` CLI handles the deploy.

| Command                 | What it does                                                  |
| ----------------------- | ------------------------------------------------------------- |
| `vp run deploy:dry-run` | Type check, build, and validate the upload without publishing |
| `vp run deploy`         | Type check, build, and publish to the URL above               |

Run the dry run first. Deploy from `main`.

`vp run deploy -- --dry-run` does **not** pass `--dry-run` through to `cf`, so it publishes. Use the `deploy:dry-run` script instead.

Both scripts build with `vp build` and then run `cf deploy --prebuilt`. Running `cf deploy` on its own fails because it calls `vite build`, and this Vite+ project has no `vite` binary.
