# Vendored anti-slop

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop), commit `13909c9e07590f5a85d93c62712259fe14a883f7` (merge of PR #45; same skill tree as `d2a9aea3b896ffcb291a85f2c1301aa2543ad8c8`).

Copied from `skills/install-anti-slop/assets/anti-slop/` with the skill's `scripts/install.mjs`, via the copy installed at `.claude/skills/install-anti-slop` (`skills-lock.json` hash `1b9b5d3c…d7d7`). That skill directory was compared byte for byte against the upstream commit above; it matched with no differences.

Installed paths:

- `tools/oxlint/anti-slop/index.ts`: generic plugin, registered in `vite.config.ts` as `anti-slop`
- `tools/oxlint/anti-slop/effect/`: Effect plugin, copied but not registered (the project does not depend on `effect`)
- `tools/oxlint/anti-slop/vendor/eslint-stylistic/`: vendored rule with its `LICENSE` and `UPSTREAM.md`

Runtime dependency: `@oxlint/plugins@1.87.0`, pinned to match the `oxlint@1.87.0` that `vite-plus` ships.

## Local deviations

None. Every generic rule and `oxc/no-accumulating-spread` is enabled at `"error"`.
