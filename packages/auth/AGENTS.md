# AGENTS.md

## Purpose

`@monorepo-template/auth` owns shared Better Auth integration for PostgreSQL email/password authentication.

## Rules

- Invoke the `authentication-rbac` skill before changing authentication, session, role, permission,
  or authorization behavior. Keep its server-side boundary rules aligned with this package.

- Keep this package focused on reusable library code.
- Do not read `process.env` directly in this package. Runtime configuration should be passed in by consumers or imported from `@monorepo-template/env` when appropriate.
- Keep runtime-only peer dependencies external in `vite.config.ts`.
- Keep OAuth providers, email delivery, and provider-specific environment variables out of this initial package.

## Source Layout

```text
src/
  index.ts
  server.ts
  web.ts
  expo.ts
```

## Imports

- Implementation, test, and configuration files must use absolute `@/...` imports or package names.
- Barrel files use relative exports so generated `.d.ts` files stay portable.

## Validation

Run from the repo root:

```sh
pnpm --filter @monorepo-template/auth build
pnpm --filter @monorepo-template/auth typecheck
pnpm --filter @monorepo-template/auth lint
```
