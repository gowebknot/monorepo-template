---
name: create-minimal-package
description: "Create minimal workspace packages following the entities package pattern. Use when adding or restructuring a package, Vite library package, barrel exports, package exports, or @/ absolute imports."
---

# Create Minimal Package

Create or restructure repo packages to match the minimal library pattern used by `packages/entities`.

1. Inspect `packages/entities` first; treat it as the executable pattern for package layout, scripts, Vite lib mode, TypeScript settings, and exports.
2. For new packages, run `pnpm package:create <project-name>` from the repo root instead of writing the package setup by hand; the script sets `name` to `@repo/<project-name>` and creates package-local `README.md` and `AGENTS.md` files.
3. Use `references/minimal-package-pattern.md` when restructuring existing packages or adding feature folders.
4. Make library packages expose `src/index.ts` through package `exports` and `types`; do not rely on consumers importing source files.
5. Use absolute `@/...` imports in implementation files, but use relative exports in barrel files such as `src/index.ts` and nested `index.ts` files so emitted `.d.ts` files stay portable.
6. Remove app scaffold boilerplate from library packages (`index.html`, demo CSS/assets, counters, and public demo files) unless the package is intentionally an app.
7. Validate with the focused package commands: `pnpm --filter <package> build`, `pnpm --filter <package> typecheck`, and `pnpm --filter <package> lint` when those scripts exist, followed by the repository formatting check `pnpm format:check`.
