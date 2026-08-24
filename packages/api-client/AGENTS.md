# AGENTS.md

## Purpose

`@monorepo-template/api-client` owns shared Axios-based API call helpers.

## Rules

- Keep this package focused on reusable API path helpers, Axios client setup, and typed service helpers.
- Keep `axios` as a peer dependency and dev dependency; consumers provide their own compatible Axios install.
- Do not validate responses in this package. Make API calls and return `response.data` only.
- Always import API types from `@monorepo-template/entities`; create them in `@monorepo-template/entities` if they do not exist. Reference/example code imports from `@monorepo-template/entities/example`. Do not make this package depend on `zod` directly.
- Keep peer dependencies external in `vite.config.ts` so they are not bundled into this package output.
- Do not read `process.env` directly in this package. Pass runtime configuration, such as `baseURL`, into `createApiClient` from the consuming app.
- In TanStack Query applications, configure the generic `ServiceOptions` at the query-client provider boundary; keep inline options for intentional alternate API targets.
- Keep domain-specific routes and Zod contracts outside this package unless intentionally adapting the template into a real project.
- Product-level API services (e.g., `healthApi`, `rootApi`) live in `src/` and are exported from `src/index.ts`.
- Domain-specific reference code (concrete resource paths, per-resource API call functions) lives under `example/` and is exposed via the `@monorepo-template/api-client/example` subpath. It exists purely to show how `src/`'s generic helpers (`getClient`, `buildPath`, `createResourcePaths`, `createCrudService`) are meant to be used for a concrete resource.

## Source Layout

```text
src/
  api-paths.ts
  index.ts
  client/
    axios-instance.ts
  health-api.ts          # product-level healthApi
  root-api.ts            # product-level rootApi
  services/
    index.ts
    crud.service.ts      # generic createCrudService factory
example/
  index.ts               # barrel export for the @monorepo-template/api-client/example subpath
  api-paths.ts           # referenceApiRouteTemplates / referenceApiPaths — concrete route strings for the reference server
  auth-account-api.ts    # authAccountApi
  auth-session-api.ts    # authSessionApi
  todo-api.ts            # todoApi / todoCrudApi
  todo-item-api.ts       # todoItemApi
  user-api.ts            # userApi
```

`example/` has its own `tsconfig.json` (extends the package's `tsconfig.json`, includes `**/*.ts`) since the package's main `tsconfig.json`/`typecheck` script only includes `src`. Verify example code with `npx tsc -p example/tsconfig.json --noEmit` from this package's directory.

The `example/` directory is built as a separate entry (`dist/example.js`) and exposed via the `@monorepo-template/api-client/example` subpath export. Import reference API clients from there so domain-specific code stays separate from the generic helpers exported by the main package.

## Imports

- Implementation files may use absolute `@/...` imports (resolves to `./src/*`) — this works from `example/` files too, since the alias is package-root-relative, not importer-relative.
- Barrel files use relative exports so generated `.d.ts` files stay portable.

## Validation

Run from the repo root:

```sh
pnpm --filter @monorepo-template/api-client build
pnpm --filter @monorepo-template/api-client typecheck
pnpm --filter @monorepo-template/api-client lint
```
