# AGENTS.md

## Purpose

`server` is a NestJS app scaffolded via `nest new`. It is the workspace's real API app.

The main application (`src/`) exposes health and production Better Auth. Example/reference modules (database, users, todos, todo-items, auth) live in `reference/` and can be run as a separate Nest application for demonstration or copy-paste purposes.

## Rules

- Invoke the `authentication-rbac` skill before changing authentication, sessions, roles,
  permissions, ownership, protected endpoints, or authorization tests. Enforce authorization before
  protected reads and writes; route/UI guards are not a data boundary.

- This app intentionally keeps Nest's default CommonJS runtime (no `"type": "module"` in `package.json`, so it runs as CommonJS at runtime despite `tsconfig.json`'s `module`/`moduleResolution: "nodenext"`; its own `eslint.config.mjs`/`.prettierrc`, Vitest) instead of the repo's ESM-everywhere convention — same kind of deliberate, self-contained exception `packages/entities` and `packages/env` make for their own build tooling.
- Do not read `process.env` directly. Import config from `@monorepo-template/env/server` (see `serverEnv` usage in `src/main.ts`) or `@monorepo-template/env/reference-server` for the reference entry point.
- Add any new required environment variables to `packages/env`'s `globalEnv` first, then pick them into `serverEnvSchema` or `referenceServerEnvSchema`, before consuming them here.
- The reference server (`reference/main.ts`) is the only place that imports `@monorepo-template/db/example`. The real server (`src/`) must not depend on database modules or example CRUD code.
- Production auth transport belongs under `src/http/auth/`; Better Auth and PostgreSQL adapter construction belongs under `src/infra/auth/`.
- `src/app.module.ts` is the composition root and imports the production auth module. Do not put production auth files at the `src/` root.
- Production auth currently supports PostgreSQL email/password only. OAuth providers and email delivery are intentionally deferred.
- Production OpenAPI JSON is served at `/api/docs-json` and Swagger UI at `/api/docs`. Every `src/**/*.controller.ts` HTTP handler must have `@ApiOperation` and at least one `@Api*Response`; `pnpm swagger:check` enforces this in pre-commit. Health DTOs are transport adapters over entity-owned schemas, while Better Auth remains a documented delegation boundary rather than duplicated DTO contracts.
- Controllers in the reference area skip request validation (no `class-validator`/DTO pipes) for demo simplicity — a real project should add a `ValidationPipe` and validated DTOs.
- Implementation, test, and configuration imports must use project aliases or package names. Relative imports are prohibited outside barrel exports; fix module resolution instead of adding a convenience exception.

## Source Layout

```text
src/
  main.ts                  # real server entry point
  swagger.ts               # OpenAPI/Swagger UI bootstrap and local URL helper
  app.module.ts            # real server composition root
  app.controller.ts        # GET /health
  app.service.ts
  http/
    auth/
      auth.controller.ts   # /api/auth/* transport boundary
      auth.module.ts
      auth.controller.spec.ts
  infra/
    auth/
      auth-handler.provider.ts
      auth.constants.ts
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

Each resource module in `reference/` follows the same shape: a `*.controller.ts` (HTTP routes), a `*.service.ts` (thin wrapper injecting `EXAMPLE_DB` and calling into `@monorepo-template/db/example`'s CRUD functions), and a `*.module.ts` wiring them together.

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
