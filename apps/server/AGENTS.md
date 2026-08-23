# AGENTS.md

## Purpose

`server` is a NestJS app scaffolded via `nest new`. It is the workspace's real API app.

The main application (`src/`) is intentionally minimal and exposes only a health endpoint. All example/reference modules (database, users, todos, todo-items, auth) live in `reference/` and can be run as a separate Nest application for demonstration or copy-paste purposes.

## Rules

- This app intentionally keeps Nest's default CommonJS runtime (no `"type": "module"` in `package.json`, so it runs as CommonJS at runtime despite `tsconfig.json`'s `module`/`moduleResolution: "nodenext"`; its own `eslint.config.mjs`/`.prettierrc`, Vitest) instead of the repo's ESM-everywhere convention — same kind of deliberate, self-contained exception `packages/entities` and `packages/env` make for their own build tooling.
- Do not read `process.env` directly. Import config from `@repo/env/server` (see `serverEnv` usage in `src/main.ts`) or `@repo/env/reference-server` for the reference entry point.
- Add any new required environment variables to `packages/env`'s `globalEnv` first, then pick them into `serverEnvSchema` or `referenceServerEnvSchema`, before consuming them here.
- The reference server (`reference/main.ts`) is the only place that imports `@repo/db/example`. The real server (`src/`) must not depend on database modules or example CRUD code.
- Controllers in the reference area skip request validation (no `class-validator`/DTO pipes) for demo simplicity — a real project should add a `ValidationPipe` and validated DTOs.

## Source Layout

```text
src/
  main.ts                  # real server entry point
  app.module.ts            # real server module (health only)
  app.controller.ts        # GET /health
  app.service.ts
reference/
  main.ts                  # reference server entry point
  app.module.ts            # reference server module
  database/
    database.module.ts       # provides EXAMPLE_DB, bootstraps demo schema on startup
    database.constants.ts
  users/                     # GET/POST/PATCH/DELETE /users
  todos/                     # GET/POST/PATCH/DELETE /todos
  todo-items/                # GET/POST/PATCH/DELETE /todo-items
  auth/                      # /auth/accounts, /auth/sessions
test/
  app.e2e-spec.ts
```

Each resource module in `reference/` follows the same shape: a `*.controller.ts` (HTTP routes), a `*.service.ts` (thin wrapper injecting `EXAMPLE_DB` and calling into `@repo/db/example`'s CRUD functions), and a `*.module.ts` wiring them together.

## Running the reference server

The reference server is a separate Nest application within the same app package:

```sh
pnpm --filter server dev:reference
```

It listens on `REFERENCE_PORT` (default `3001`).

## Validation

Run from the repo root:

```sh
pnpm --filter server build
pnpm --filter server build:reference
pnpm --filter server typecheck
pnpm --filter server lint
pnpm --filter server test:unit
pnpm --filter server test:api:e2e
pnpm --filter server build && pnpm --filter server test:api:smoke
pnpm --filter server dev
pnpm --filter server dev:reference
```

## Test boundaries

- `test:unit` runs isolated source tests under `src/**/*.spec.ts`.
- `test:api:e2e` runs exhaustive in-process Nest HTTP tests under `test/**/*.e2e-spec.ts`; it does not bind a network port.
- `test:api:smoke` starts the built real server as a separate process and verifies representative localhost behavior, startup, environment wiring, and teardown.
- The reference CRUD server is an example application and is not part of the real-server smoke suite.
