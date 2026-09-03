# AGENTS.md

## Purpose

This is the managed Vite React web application template.

## Conventions

- Keep app code under `src/` and use the configured `@/*` alias for implementation imports.
- Use shared workspace contracts, API helpers, and environment validation instead of redefining them locally.
- Keep client-side behavior accessible and test observable flows through the app's configured test tools.

## Validation

Run from the repository root:

```sh
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web build
```
