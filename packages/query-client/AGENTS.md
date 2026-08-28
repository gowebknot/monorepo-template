# AGENTS.md

## Purpose

`@monorepo-template/query-client` owns shared TanStack Query React hooks built on top of `@monorepo-template/api-client`. All API contract types are imported from `@monorepo-template/entities`.

## Rules

- Invoke the `authentication-rbac` skill before changing auth/session queries, cache invalidation,
  role/permission presentation, or authorization error handling. Do not treat query visibility as
  server authorization.

- Keep generic hook factories in `src/`.
- Keep product-level concrete hooks (e.g., health, root API) in `src/`.
- Concrete hooks must consume services exported from `@monorepo-template/api-client` (or its `/example` subpath); do not build API services inside `query-client`.
- Keep domain-specific illustrative hooks in `example/` and expose them via the `@monorepo-template/query-client/example` subpath.
- Do not read `process.env` directly in this package. Runtime configuration such as `baseURL` is passed via `ServiceOptions`.
- Expose `ApiClientConfigProvider` for app-wide `ServiceOptions`; hooks inherit its options and accept inline options only for intentional per-operation overrides.
- Keep runtime-only peer dependencies (`react`, `@tanstack/react-query`) external in `vite.config.ts`.
- Import API types from `@monorepo-template/entities`; do not define contract types here.

## Source Layout

```text
src/
  index.ts
  create-crud-query-hooks.ts   # generic CRUD query/mutation hook factory
  create-query-hook.ts         # generic simple query hook factory
  health-hooks.ts              # concrete useHealth hook
  root-api-hooks.ts            # concrete useRootApi hook
example/
  index.ts                     # barrel for the example subpath
  todo-hooks.ts                # illustrative todo query/mutation hooks
```

## Imports

- Implementation, test, and configuration files must use absolute `@/...` imports or package names.
- Barrel files use relative exports so generated `.d.ts` files stay portable.

## Validation

Run from the repo root:

```sh
pnpm --filter @monorepo-template/query-client build
pnpm --filter @monorepo-template/query-client typecheck
pnpm --filter @monorepo-template/query-client lint
```

Verify example code from the package directory:

```sh
npx tsc -p example/tsconfig.json --noEmit
```
