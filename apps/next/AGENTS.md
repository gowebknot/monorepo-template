# AGENTS.md

## Purpose

`next` is a Next.js App Router reference app for the monorepo template. It mirrors `apps/web`'s
todos demo (create + filter + delete) using the shared workspace packages, so the same contracts and
data layer power both a Vite SPA and a Next.js app.

## Conventions

- App Router under `src/app`, `@/*` alias → `src/*`.
- UI uses shadcn (`base-mira` style) + Tailwind v4, ported to match `apps/web`. Add components with
  `pnpm dlx shadcn@latest add <name>`.
- Server state comes from `@repo/query-client/example`; API contracts/types from
  `@repo/entities/example`; HTTP from `@repo/api-client/example`. Do not redefine these locally.
- Environment access goes through `@repo/env/next` (`createNextEnv`). Only `NEXT_PUBLIC_*` variables
  reach the client, and `src/lib/env.ts` spells out the runtime map so Next can inline them.
- Components that use `@base-ui/react` primitives or React hooks must be client components
  (`"use client"`).

## Validation

```sh
pnpm --filter next typecheck
pnpm --filter next lint
pnpm --filter next build
```
