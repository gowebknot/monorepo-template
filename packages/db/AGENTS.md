# AGENTS.md

## Purpose

`@monorepo-template/db` owns shared Drizzle database connection helpers.

## Template Rule

- Keep `src/` connection-only in this template.
- Do not put driver-specific code in `src/`; concrete driver examples belong under `example/`.
- Do not put table/schema definitions in `src/` unless adapting the template into a real project intentionally.
- Example schema code lives under `example/schema/` and is used by `drizzle.config.ts`.
- Example CRUD helpers live under `example/crud/`, one file per schema file, each exporting plain async functions that take the Drizzle db instance as their first argument. These are reference implementations for the example schema — not exported from `src/`, but deliberately exported via the separate `./example` subpath (see below) so the example app (`apps/server`) can demonstrate them end-to-end. Do not treat `./example` as the package's production API surface.

## Source Layout

```text
src/
  index.ts
  db.ts
example/
  index.ts
  db.ts
example/schema/
  index.ts
  auth.ts
  user.ts
  todo.ts
  todo-item.ts
example/crud/
  index.ts
  auth.ts
  user.ts
  todo.ts
  todo-item.ts
```

## Imports

- Implementation files may use absolute `@/...` imports.
- Barrel files (`src/index.ts`, `example/index.ts`, `example/schema/index.ts`, `example/crud/index.ts`) use relative exports **with explicit `.js` extensions** (e.g. `export * from "./db.js"`), even though the source files are `.ts`. This is required: the package is built with `vite.config.ts`'s multi-entry lib mode (`index` + `example`), and NodeNext-mode consumers (e.g. `apps/server`, which uses `moduleResolution: "nodenext"`) cannot resolve extensionless relative specifiers inside a consumed `.d.ts` — they silently drop the exports instead of erroring. Any new barrel file added here must follow the same `.js`-extension convention.
- Keep runtime-only packages external in `vite.config.ts` (`better-sqlite3`, `drizzle-orm`, `drizzle-orm/better-sqlite3`, `drizzle-orm/sqlite-core`, `@monorepo-template/env/server`).
- Read database configuration from `@monorepo-template/env/server`; never read `process.env` directly in this package.
- Use the global `crypto.randomUUID()` (no import needed) instead of `import { randomUUID } from "node:crypto"` in example code — Vite's library build externalizes `node:crypto` with a browser-compat interop shim that breaks `randomUUID` at runtime when required from a CommonJS consumer.

## Exports

- `.` (JS at `dist/index.js`, types at `dist/src/index.d.ts`): connection-only helpers (`createDb`, `getDatabaseUrl`).
- `./example` (JS at `dist/example.js`, types at `dist/example/index.d.ts`): the example db connection, schema, and CRUD helpers, bundled together. This is the entry point `apps/server` imports from.

## Commands

Run from the repo root:

```sh
pnpm --filter @monorepo-template/db build
pnpm --filter @monorepo-template/db typecheck
pnpm --filter @monorepo-template/db lint
pnpm --filter @monorepo-template/db db:generate
```
