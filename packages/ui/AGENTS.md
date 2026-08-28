# AGENTS.md

## Purpose

`@monorepo-template/ui` owns shared shadcn-based web components and Tailwind theme styling.

## Rules

- Keep this package focused on reusable library code.
- Export components from the single `src/index.ts` entrypoint; do not add component subpath exports.
- Keep `cn` and variant factories in server-safe modules; put `"use client"` only on interactive component modules.
- Keep shared color, radius, dark-mode, and base styling in `styles.css`; consumers own fonts and app-specific overrides.
- Consumers must import `@monorepo-template/ui/styles.css` after their Tailwind and shadcn CSS imports and scan this package with Tailwind v4 `@source`.
- This package targets React DOM web applications only; native apps must use their NativeWind components.
- Do not read `process.env` directly in this package. Runtime configuration should be passed in by consumers or imported from `@monorepo-template/env` when appropriate.
- Keep runtime-only peer dependencies external in `vite.config.ts`.
- Add package-specific rules here when this package gains concrete responsibilities.
- Every rendered shared component requires a consumer-provided, non-empty `data-testid` prop and
  must forward it to its rendered test target. Non-rendering helpers are exceptions only when
  documented by the shared-component checker.

## Source Layout

```text
src/
  index.ts
```

## Imports

- Implementation, test, and configuration files must use absolute `@/...` imports or package names.
- Barrel files use relative exports so generated `.d.ts` files stay portable.

## Validation

Run from the repo root:

```sh
pnpm --filter @monorepo-template/ui build
pnpm --filter @monorepo-template/ui typecheck
pnpm --filter @monorepo-template/ui lint
```
