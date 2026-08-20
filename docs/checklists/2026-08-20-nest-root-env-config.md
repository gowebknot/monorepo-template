# Nest Root Environment Configuration

Status: active

## Scope

- [/] Load the repository-root `.env` through Nest configuration in the template server. (CORS e2e
  verification still blocked — see TEST-SERVER-003.)
  - [x] Add `@nestjs/config` to the server template.
  - [x] Validate loaded values with the shared `serverEnvSchema`.
  - [/] Keep server startup and CORS configuration on validated `ConfigService` values. Application
    code is wired (`apps/server/src/main.ts`); TEST-SERVER-003's e2e CORS assertion was never
    added and `pnpm --filter server test:e2e` is currently blocked for an unrelated reason (see
    TEST-SERVER-003).
  - [x] Apply the equivalent configuration to the reference server with `referenceServerEnvSchema`.
- [x] Add `ALLOWED_ORIGINS` to the shared server environment contract and template examples.
- [x] Update generated-template fixtures and Turbo environment declarations.
- [x] Run focused and repository-required validation.

## Acceptance Criteria

- Direct Nest server commands load `.env` from the repository root without requiring `just`.
- `ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000` permits both origins.
- `REFERENCE_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000` permits both reference-server origins.
- Invalid server environment values fail during Nest configuration initialization.
- Existing `createServerEnv` exports remain available for non-Nest consumers.

## Test Cases

### TEST-SERVER-001: Shared server schema validates the added origin setting

- Small task: Add `ALLOWED_ORIGINS` to the shared server environment contract.
- Source: User request and `packages/env` ownership rules.
- Test place: `packages/env` schema/typecheck validation.
- Starting state: The current schema has `PORT` but no `ALLOWED_ORIGINS`.
- Exact input or fixture: `{ NODE_ENV: "development", DATABASE_URL: "./local.db", PORT: "3000", ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:5173" }`.
- Interaction steps: Parse the input with `serverEnvSchema`.
- Main behavior: The shared schema accepts the comma-separated origin string and coerces the port.
- Expected result: Parsing succeeds with `PORT` equal to `3000`.
- Must change: The schema and its inferred output include `ALLOWED_ORIGINS`.
- Must not happen: The app defines a duplicate local schema.
- Planned command: `pnpm --filter @repo/env typecheck`
- Expected result before the code change: The new consumer or schema assertion cannot reference `ALLOWED_ORIGINS`.
- First observed run: Confirmed failing prior to this schema change (`ALLOWED_ORIGINS` absent from
  `serverEnvSchema`).
- Passing rerun: Confirmed — `pnpm --filter @repo/env typecheck` passes;
  `packages/env/src/create-server-env.ts` picks `ALLOWED_ORIGINS` into `serverEnvSchema`.

### TEST-SERVER-002: Nest loads the repository-root environment

- Small task: Configure Nest to load the root `.env`.
- Source: User request and the working `just dev-reference` behavior.
- Test place: `apps/server` configuration bootstrap.
- Starting state: Direct Nest startup receives no root `.env` values.
- Exact input or fixture: Root `.env` with `PORT=3000` and `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`.
- Interaction steps: Initialize the Nest application through the server bootstrap configuration.
- Main behavior: Nest loads and validates the root environment before the app starts.
- Expected result: `ConfigService` exposes the configured port and origin list.
- Must change: `ConfigModule.forRoot` specifies the root `.env` path and shared validator.
- Must not happen: Startup depends on `just` or direct `process.env` reads in the app.
- Planned command: `pnpm --filter server build && pnpm --filter server typecheck`
- Expected result before the code change: The new `ConfigModule` integration is absent.
- First observed run: Confirmed failing prior to `ConfigModule.forRoot` being added to
  `apps/server/src/app.module.ts`.
- Passing rerun: Confirmed — `pnpm --filter server build` and `pnpm --filter server typecheck` both
  pass with `ConfigModule.forRoot({ envFilePath: '../../.env', isGlobal: true, validate: ... })`
  wired in `apps/server/src/app.module.ts`.

### TEST-SERVER-003: Real server allows multiple configured origins

- Small task: Configure real-server CORS from `ALLOWED_ORIGINS`.
- Source: User request and existing reference-server CORS behavior.
- Test place: Nest HTTP integration test or deterministic preflight check.
- Starting state: The real server has no CORS response header.
- Exact input or fixture: Allowed origins `http://localhost:3000,http://localhost:5173`; preflight origin `http://localhost:3000`.
- Interaction steps: Send an `OPTIONS` request with `Origin: http://localhost:3000` and `Access-Control-Request-Method: GET`.
- Main behavior: The configured origin is reflected in the CORS response.
- Expected result: Response includes `Access-Control-Allow-Origin: http://localhost:3000`.
- Must change: Real bootstrap enables CORS using the validated list.
- Must not happen: A disallowed origin is reflected.
- Planned command: `pnpm --filter server test:e2e`
- Expected result before the code change: The CORS assertion fails because real bootstrap does not enable CORS.
- First observed run: No CORS preflight assertion was ever added to
  `apps/server/test/app.e2e-spec.ts` (it still only covers `GET /health`) — this case's planned test
  was never implemented, separate from the CORS application code itself (which is wired in
  `apps/server/src/main.ts` via `parseAllowedOrigins`/`app.enableCors`).
- Passing rerun: BLOCKED — running `pnpm --filter server test:e2e` now fails for an unrelated,
  pre-existing infrastructure reason: `test/jest-e2e.json` runs under `ts-jest`/CommonJS and imports
  `../src/app.module`, which imports `@repo/env/server`. `@repo/env` builds ESM-only output
  (`formats: ["es"]`), and Jest's default `transformIgnorePatterns` skips transforming anything under
  `node_modules` (including the workspace-linked `@repo/env`), so the raw `import` statement in
  `packages/env/dist/server-env.js` reaches Jest's CommonJS loader untransformed:
  `SyntaxError: Cannot use import statement outside a module`. This blocks e2e testing for the real
  server entirely, not just this CORS case, and predates this checklist's changes (`@repo/env` has
  been ESM-only throughout). Not fixed here — needs a decision on approach (e.g. dual ESM/CJS build
  output for `@repo/env`, or a Jest ESM-transform override) before a CORS e2e test can even run.
  Flagged to the user; no test case marked passing.

### TEST-SERVER-004: Reference server keeps multiple-origin behavior

- Small task: Load and validate reference-server environment through Nest configuration.
- Source: Existing `REFERENCE_ALLOWED_ORIGINS` implementation and reported browser failure.
- Test place: Reference bootstrap build and preflight verification.
- Starting state: Reference CORS depends on external dotenv loading.
- Exact input or fixture: `REFERENCE_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`; preflight origin `http://localhost:3000`.
- Interaction steps: Start the reference server directly, then send the preflight request.
- Main behavior: The reference server loads the root environment and permits the configured origin.
- Expected result: Response includes `Access-Control-Allow-Origin: http://localhost:3000`.
- Must change: Reference bootstrap uses Nest configuration and its shared schema.
- Must not happen: Running the direct package script silently falls back to only `http://localhost:5173`.
- Planned command: `pnpm --filter server build:reference`
- Expected result before the code change: The new configuration path is absent.
- First observed run: Confirmed failing before `ConfigModule.forRoot` was added to
  `apps/server/reference/app.module.ts`.
- Passing rerun: Confirmed — `pnpm --filter server build:reference` passes and, after the
  `dist/reference/main.js` path fix (see "Discovered Issue: reference build emits to the wrong path"
  below), produces a runnable `dist/reference/main.js` that reads `REFERENCE_ALLOWED_ORIGINS` via
  `ReferenceAppModule`'s `ConfigModule.forRoot({ validate: validateReferenceServerEnv })`. No e2e
  preflight test was added (same test-coverage gap as TEST-SERVER-003); code path itself is verified
  by successful build + `pnpm --filter server typecheck`/`lint`.

## Discovered Issue: reference build emits to the wrong path

- [x] Fix `apps/server/reference/main.ts` cross-importing `../src/allowed-origins`, which broke
      `nest build --config nest-cli.reference.json`'s output location.
  - [x] Reproduce: `tsconfig.reference.build.json` only declares `"include": ["reference/**/*.ts"]`,
        but `reference/main.ts` imported `../src/allowed-origins` (added while wiring
        `ALLOWED_ORIGINS`/CORS). TypeScript's inferred `rootDir` then became the common ancestor of
        both `reference/` and `src/` (i.e. `apps/server/`), so with `outDir: "./dist/reference"` the
        compiler emitted to `dist/reference/reference/main.js` (and `dist/reference/src/...`) instead
        of the expected `dist/reference/main.js`. `run()` in the create-mono-stack integration test
        does not check output paths, only exit codes, so `nest build` "succeeding" masked this — the
        integration test's own `access(dist/reference/main.js)` assertion is what actually caught it
        (see `TEST-SCAFFOLD-003` in
        [2026-08-20-disable-next-generator-git-init.md](2026-08-20-disable-next-generator-git-init.md)).
        `apps/server/package.json`'s `start:reference` script (`node dist/reference/main`) was
        silently broken by this in any fresh build.
  - [x] Fix: added `apps/server/reference/allowed-origins.ts` (self-contained duplicate of
        `parseAllowedOrigins`, matching this repo's documented intent that `reference/` stays
        copy-paste-independent of `src/`, per `apps/server/AGENTS.md`), and changed
        `reference/main.ts` to import from `./allowed-origins` instead of `../src/allowed-origins`.
  - [x] Verified: clean `pnpm --filter server build:reference` now emits `dist/reference/main.js`
        (flat, correct path) with no `dist/reference/reference/` or `dist/reference/src/` nesting.
        `pnpm --filter server build`, `typecheck`, `lint`, and `test` (jest, 2 suites / 3 tests) all
        still pass.
  - [x] Confirmed the fix unblocks `create-mono-stack`'s integration test end-to-end
        (`pnpm --filter create-mono-stack test:integration` now passes, including the
        `assertReferenceBuilds` check that previously failed with `ENOENT: apps/server/dist/reference/main.js`).

## Discovered Issue: `turbo.json` misdeclared `ALLOWED_ORIGINS` on the wrong task

- [x] `turbo.json`'s `dev:reference` task's `env` array incorrectly listed `ALLOWED_ORIGINS`
      (the real server's origin var). `dev:reference` only ever runs the reference server/web dev
      processes, which read `REFERENCE_ALLOWED_ORIGINS`, not `ALLOWED_ORIGINS` — confirmed by reading
      `apps/server/reference/app.module.ts`'s `validateReferenceServerEnv` picks. Removed the
      misplaced entry; `dev:reference`'s env list is back to
      `["DATABASE_URL", "NODE_ENV", "REFERENCE_ALLOWED_ORIGINS", "REFERENCE_PORT", "WEB_PUBLIC_API_BASE_URL", "WEB_PUBLIC_APP_URL"]`.
      This directly fixed `core/create-mono-stack/test/copier-template.test.js`'s
      "builds workspace dependencies before starting development" failure (it was asserting the
      correct/intended array; `turbo.json` was wrong, not the test).

## Discovered Issue: stale `copier-template.test.js` fixtures

- [x] `core/create-mono-stack/test/copier-template.test.js` had two hardcoded `.env.example` string
      fixtures (the `templateAdapters` map entry and `TEST-ENV-001`'s `expected` literal) still
      showing the pre-`ALLOWED_ORIGINS` single-origin
      `REFERENCE_ALLOWED_ORIGINS=http://localhost:5173`, out of sync with the live `.env.example`
      (`REFERENCE_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`). Updated both fixture
      strings to match the live file. Verified `.env.example`'s actual content is correct per this
      checklist's own Acceptance Criteria before changing the test (test was stale, not the source).
  - [x] `pnpm --filter create-mono-stack test` — 230/230 pass (was 227/230 before these three fixes).
  - [x] `pnpm --filter create-mono-stack test:integration` — passes end-to-end (was failing on
        `assertReferenceBuilds`'s `dist/reference/main.js` check).
  - [x] `pnpm --filter create-mono-stack lint` — clean.

## Discovered Issue: `@repo/env/server` declaration emission breaks type-aware lint

- [x] Fix `packages/env` so `validateServerEnv`'s emitted type resolves under `NodeNext` in consumers.
  - [x] Reproduce: confirm `validateServerEnv`'s resolved type is `any` in `apps/server` via the
        TypeScript compiler API (root cause: `src/server-env.ts` re-exports
        `create-server-env` through the `@/` alias; `unplugin-dts` emits that as the extensionless
        specifier `from './create-server-env'` in `dist/src/server-env.d.ts`, which fails to resolve
        under the consumer's `NodeNext` module resolution and silently collapses to `any`).
  - [x] Change `packages/env/src/server-env.ts` to re-export/import `create-server-env` via a
        relative specifier with an explicit `.js` extension (matching the `@repo/entities` barrel
        convention), instead of the `@/` alias.
  - [x] Rebuild `@repo/env` and confirm `dist/src/server-env.d.ts` now references
        `./create-server-env.js`.
  - [x] Confirm `apps/server` lint no longer reports `@typescript-eslint/no-unsafe-return` /
        `@typescript-eslint/no-unsafe-call` on `app.module.ts`.
  - [x] Apply the identical relative-with-`.js`-extension fix to the other `@repo/env` subpath entry
        files that share the same alias re-export pattern (`src/web-env.ts`, `src/next-env.ts`,
        `src/expo-env.ts`, `src/react-native-env.ts`) and to the documented barrels
        (`env.ts`, `src/index.ts`, `src/env.ts`) so every emitted declaration file stays portable
        under `NodeNext` resolution, not only the one hop that happened to be caught by a lint run.
        `src/reference-server-env.ts` is not affected (no internal re-export hop) and needs no change.
  - [x] Rebuild `@repo/env` and confirm every affected `dist/src/*.d.ts` now uses `.js`-suffixed
        relative specifiers, then rerun `pnpm --filter @repo/env typecheck` and
        `pnpm --filter @repo/env lint`.

### TEST-SERVER-005: `validateServerEnv` resolves to a real function type in NodeNext consumers

- Small task: Fix `@repo/env`'s declaration emission so `apps/server` type-aware lint passes.
- Source: `pnpm --filter server lint` failure and TypeScript compiler API inspection.
- Test place: `apps/server` lint (`eslint`) and a compiler-API resolution check.
- Starting state: `dist/src/server-env.d.ts` re-exports `create-server-env` without a file extension.
- Exact input or fixture: `apps/server/src/app.module.ts`'s `validate: (config) => validateServerEnv(config)`.
- Interaction steps: Build `@repo/env`, then run `pnpm --filter server lint`.
- Main behavior: `validateServerEnv`'s resolved type is `(config: Record<string, unknown>) => Record<string, unknown>`, not `any`.
- Expected result: `pnpm --filter server lint` exits 0 with no `no-unsafe-return`/`no-unsafe-call` errors.
- Must change: `packages/env/src/server-env.ts` import/export specifiers for `create-server-env`.
- Must not happen: Any other `@repo/env` consumer's exported types regress to `any`.
- Planned command: `pnpm --filter @repo/env build && pnpm --filter server lint`
- Expected result before the code change: 2 errors (`no-unsafe-return`, `no-unsafe-call`) on `app.module.ts:14`.
- First observed run: Confirmed — `pnpm --filter server lint` reported exactly those 2 errors before this fix.
- Passing rerun: Confirmed — after rebuilding `@repo/env`, `checker.getTypeAtLocation` on the
  `validateServerEnv(config)` call in `app.module.ts` resolves to
  `(config: Record<string, unknown>) => Record<string, unknown>`; `pnpm --filter server lint` exits 0
  with no errors. Also reran `pnpm --filter @repo/env typecheck`, `pnpm --filter @repo/env lint`,
  `pnpm --filter @repo/db typecheck`, `pnpm --filter @repo/db lint`, `pnpm --filter server typecheck`,
  `pnpm --filter server build`, and `pnpm --filter server build:reference` — all pass clean.

## Discovered Issue: `apps/next` lint — `next`/`eslint-config-next` naming collision

- [x] Fixed. Root cause: this machine's local, gitignored `.npmrc` had `public-hoist-pattern[]=next`,
      and the workspace app is itself named `"next"` (`apps/next/package.json`, matching every other
      app's plain-name convention — `web`, `server`, `mobile`, `expo`). The hoist pattern's name-match
      is ambiguous between the real npm `next` package and the local workspace package also named
      `"next"`; the workspace symlink won at the root `node_modules/next`, shadowing the real package.
      Separately, `eslint-config-next@16.3.1` requires `next/dist/compiled/babel/eslint-parser` at
      runtime without declaring `next` as a `dependency` or `peerDependency` in its own
      `package.json` — it relies entirely on ambient hoisting to find it, which is what the
      naming collision broke.
  - [x] Fix: added a `pnpm.packageExtensions` patch to the root `package.json` declaring `next: "*"`
        as an explicit dependency of `eslint-config-next`. This makes pnpm resolve `next` directly
        into `eslint-config-next`'s own isolated virtual-store `node_modules`
        (`node_modules/.pnpm/eslint-config-next@.../node_modules/next` → the real `next@16.3.1`
        package), so Node's module resolution finds it before ever needing to walk up to the
        collision-prone root `node_modules`. Did not touch the local `.npmrc` — this fix is in a
        tracked file, so it helps every clone, not just this machine.
  - [x] Verified: `pnpm install` created a new `eslint-config-next@16.3.1_@babel+core@...` virtual-store
        variant with a correct `next` symlink; `apps/next/node_modules/eslint-config-next` now links
        to that variant. `pnpm --filter next lint` passes (0 errors, 1 pre-existing unrelated
        React-Compiler warning, same as `apps/web`'s). Full `just check` now exits 0.

## Open Items (not fixed — need a decision before proceeding)

- [ ] `pnpm --filter server test:e2e` fails on any test importing `src/app.module.ts` (and therefore
      `@repo/env/server`) with `SyntaxError: Cannot use import statement outside a module`.
      **Confirmed this is test-tooling-only, not a production risk**: directly running
      `node dist/main.js` (the real compiled output) boots Nest fully — routes mapped, app started,
      no ESM/CJS error at all. Node 24's native `require(esm)` support handles the ESM
      `@repo/env` import at real runtime; only Jest's own module system can't.
      Root cause: `@repo/env` builds ESM-only (`formats: ["es"]`), `apps/server`'s Jest runs
      CommonJS via `ts-jest`. Tried the standard fix (`transformIgnorePatterns: []` in
      `test/jest-e2e.json`, both via CLI flag and directly in the config file) — no effect, same
      exact error. The failure happens in Jest's `ModuleExecutor.compile` before any configured
      `transform` even runs, because `packages/env/package.json` declares `"type": "module"` and
      Jest refuses to feed raw ESM through a CJS-oriented transform pipeline without deeper ESM
      support enabled (`extensionsToTreatAsEsm` + `--experimental-vm-modules`, or a babel-based
      transform step apps/server doesn't currently have). Reverted the experimental config change
      (`git diff` on `test/jest-e2e.json` is clean). Needs a decision: add a dual ESM/CJS build to
      `@repo/env` (bigger, more "correct" fix, changes the package's public contract for every
      consumer) vs. enabling Jest's experimental ESM mode or adding babel-jest scoped to
      `apps/server`'s e2e config (smaller, more local, but adds toolchain complexity to an app that
      deliberately keeps Nest's default CJS/ts-jest setup). Given production is unaffected, this is
      lower urgency than it first appeared.

## Validation Plan

- [x] Run focused server tests and record failures before fixes.
- [x] Run `pnpm --filter server build`.
- [x] Run `pnpm --filter server build:reference`.
- [x] Run `pnpm --filter server typecheck`.
- [x] Run `pnpm --filter server lint`.
- [ ] Run `pnpm template:test`. (Superseded/covered by `pnpm --filter create-mono-stack test` +
      `test:integration`, both green; see "Discovered Issue: stale `copier-template.test.js`
      fixtures" above. Not separately re-run under this exact script name.)
- [ ] Run `pnpm format:check`. (Not yet run — see next step.)
