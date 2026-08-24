# AGENTS.md

## Purpose

`@monorepo-template/config` owns shared application configuration constants.

## Rules

- Keep this package focused on static shared configuration.
- Do not read `process.env` directly in this package. Environment-specific values belong in `@monorepo-template/env`.
- Preserve the current plain `tsc` package shape unless intentionally migrating this package to the Vite library scaffold.
- Export public configuration from `src/index.ts` through the package root export.

## Source Layout

```text
src/
  index.ts
```

## Validation

Run from the repo root:

```sh
pnpm --filter @monorepo-template/config build
pnpm --filter @monorepo-template/config typecheck
pnpm --filter @monorepo-template/config lint
```
