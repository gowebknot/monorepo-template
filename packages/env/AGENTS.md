# AGENTS.md

## Purpose

`@monorepo-template/env` owns env validation for the whole workspace.

## Rules

- Invoke the `authentication-rbac` skill before adding or changing authentication or authorization
  environment values. Keep secrets server-only and document provider scope before adding variables.

- Put every env schema in the `globalEnv` Zod object in `src/global-env.ts` first.
- App-specific envs must derive their schema with `globalEnv.pick(...).shape`; do not define app env schemas directly in apps.
- This package is the only place that may read `process.env`; all other packages must import parsed envs, validators, or factory functions from `@monorepo-template/env`.
- Use current Zod imports, methods, and functions only; do not add deprecated pre-Zod-4 patterns or compatibility implementations.
- Export app-specific parsed constants from subpaths (`@monorepo-template/env/web`, `@monorepo-template/env/next`, `@monorepo-template/env/server`) so importing one app env does not validate another app's required variables. Client-rendered web apps read `import.meta.env` (Vite) or `process.env` (Next `NEXT_PUBLIC_`, Expo `EXPO_PUBLIC_`) via the matching `createXEnv(runtimeEnv)` factory.
- Root package exports `globalEnv`, app-specific validator objects (`webEnvSchema`, `webServerEnvSchema`, `webClientEnvSchema`, `serverEnvSchema`), and factory functions (`createWebEnv`, `createServerEnv`); it must not export parsed `webEnv` or `serverEnv` constants.

## Entry Points

- `vite.config.ts` sets `envDir` to the workspace root (`../..`) so Vite reads root `.env` files, not `packages/env/.env`.
- Vite root lib entry points at package-root `env.ts`, but outputs `dist/index.js` for `@monorepo-template/env`.
- Subpath exports output `dist/web-env.js` and `dist/server-env.js`.

## Import Rules

- Implementation files may use absolute `@/...` imports.
- Barrel files (`src/index.ts`, `src/env.ts`) use relative exports so generated `.d.ts` files stay portable.
- Keep `@t3-oss/env-core` and `zod` external in `vite.config.ts`.

## Validation

Run from the repo root:

```sh
pnpm --filter @monorepo-template/env build
pnpm --filter @monorepo-template/env typecheck
pnpm --filter @monorepo-template/env lint
```
