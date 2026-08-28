# AGENTS.md

## Purpose

`@monorepo-template/entities` owns shared API contracts for frontend and backend packages.

## Contract Rule

- Invoke the `authentication-rbac` skill before defining or changing identity, session, role,
  permission, ownership, or authorization error contracts. Never model client-supplied policy data
  as trusted authorization.

- Define API request, response, params, and error contracts here first.
- Export each contract as a Zod schema plus an inferred TypeScript type.
- Use current Zod imports, methods, and functions only; do not add deprecated pre-Zod-4 patterns or compatibility implementations.
- Consumer packages must import schemas/types from `@monorepo-template/entities`; do not hand-write matching API contract types in consumers.

## Layout

Real, exported contracts live under `src/api-contracts` and are re-exported from root `src/index.ts`.

Purely illustrative sample contracts live under `example/api-contracts` and are exported from the `@monorepo-template/entities/example` subpath. Do not put sample/domain code directly in `src`.

```text
src/api-contracts/         # real, product-level contracts
  index.ts
  health/
    index.ts
    health.contract.ts
  root-api/
    index.ts
    root-api.contract.ts
example/api-contracts/     # illustrative reference contracts
  index.ts
  auth/
    index.ts
    auth.contract.ts
  todo/
    index.ts
    todo.contract.ts
  todo-item/
    index.ts
    todo-item.contract.ts
  user/
    index.ts
    user.contract.ts
```

Add new real contracts in `src/api-contracts/<feature>/<feature>.contract.ts` + `index.ts`, re-export them from `src/api-contracts/index.ts`, which is itself re-exported from root `src/index.ts`.

Add new illustrative contracts in `example/api-contracts/<feature>/<feature>.contract.ts` + `index.ts`, re-export them from `example/api-contracts/index.ts`, which is itself re-exported from `example/index.ts`.

**Barrel files must use explicit `.js` extensions** in their relative re-exports (e.g. `export * from "./todo/index.js"`), even though the source files are `.ts`. Without this, NodeNext-mode consumers (e.g. `apps/server`) silently fail to resolve the transitive exports from the compiled `.d.ts` — see the same issue documented in `packages/db/AGENTS.md`.

## Contract Pattern

```ts
import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok")
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
```

Use explicit names: `<action><Resource>RequestSchema`, `<action><Resource>ResponseSchema`, `<Action><Resource>Request`, `<Action><Resource>Response`.

## Imports

- Implementation, test, and configuration files must use absolute `@/...` imports or package names.
- Barrel files (`src/index.ts`, nested `index.ts`) use relative exports so generated `.d.ts` files stay portable.
- Example barrel files under `example/` also use relative exports.
- `zod` is both a peer dependency and dev dependency; consumers must provide a compatible `zod` install.

## Validation

Run from the repo root:

```sh
pnpm --filter @monorepo-template/entities build
pnpm --filter @monorepo-template/entities typecheck
pnpm --filter @monorepo-template/entities lint
```

Verify example code from the package directory:

```sh
npx tsc -p example/tsconfig.json --noEmit
```
