# AGENTS.md

## Repo layout

```
apps/
  server/      # server — NestJS example API app (own CommonJS/Jest toolchain, see apps/server/AGENTS.md)
packages/
  config/      # @repo/config — shared app config, plain tsc, NodeNext
  db/          # @monorepo-template/db — Drizzle database connection helpers
  env/         # @monorepo-template/env — T3 env + Zod workspace env validation
  entities/    # @monorepo-template/entities — shared API Zod contracts + inferred types
  api-client/  # @monorepo-template/api-client — shared Axios API client helpers
skills/        # canonical source for portable agent skills (see below)
scripts/       # skills.mjs CLI + skills.test.mjs (Node built-in test runner)
```

Package manager: `pnpm@9.15.4`. Root `"type": "module"` — ESM throughout.

## Key commands

```sh
pnpm build          # turbo build (topological, cached)
pnpm dev            # turbo dev --parallel (persistent, never cached)
pnpm lint           # turbo lint (requires upstream build first)
pnpm package:create <name>  # scaffold packages/<name> as @monorepo-template/<name>
pnpm typecheck      # turbo typecheck (requires upstream build first)
pnpm format         # prettier --write . (root-level only, not per-package)
pnpm format:check   # CI-safe format check

just check          # lint + typecheck + format-check + skills-check + skills-test
just package-create <name>  # Just wrapper for pnpm package:create
```

Run a single package:

```sh
pnpm --filter @monorepo-template/entities build
pnpm --filter @repo/config typecheck
```

`just` with no args lists all recipes. `set dotenv-load := true` so `.env` is auto-loaded by Just.

## Creating packages

Use `pnpm package:create <project-name>` or `just package-create <project-name>` instead of hand-writing package setup. The scaffold reads root `package.json` and creates `packages/<project-name>` with package name `@<root-name>/<project-name>` (for this repo: `@monorepo-template/<project-name>`).

The scaffold creates Vite lib-mode package files (`package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `README.md`, `AGENTS.md`, `src/index.ts`) and refuses to overwrite an existing package unless `--force` is passed to the pnpm script.

Package source convention: use absolute `@/...` imports in implementation files, but use relative exports in barrel files (`src/index.ts`, nested `index.ts`) so emitted declarations do not leak the private `@/` alias.

## Turbo pipeline

- `build` depends on `^build` — upstream packages must build before downstream ones.
- `lint` and `typecheck` also depend on `^build` — cross-package type imports require upstream `dist/` to exist.
- No `test` task in Turbo. Skills tests run via `pnpm skills:test` (Node `node:test`).

## TypeScript quirks

`packages/entities` (`@monorepo-template/entities`) and `packages/env` (`@monorepo-template/env`) use **TypeScript 6** (`~6.0.2`), not the root `^5.7.2`.

- Their `tsconfig.json` files do **not** extend `tsconfig.base.json`; they are fully standalone.
- `erasableSyntaxOnly: true` (TS6-only) — bans enums, decorators, and namespaces. Do not add them.
- `noEmit: true` — `tsc` in `entities` is type-check only. Vite does the actual emit.
- Build script is `tsc && vite build` — both must pass.

`packages/config` extends `tsconfig.base.json` (NodeNext, ES2022 target).

## Environment config

All env validation and environment variable access belongs in `packages/env`, exported by `@monorepo-template/env`. Read `packages/env/AGENTS.md` before changing env code.

`globalEnv` is a single Zod object in `src/global-env.ts`; app envs derive and export their validators with `globalEnv.pick(...).shape`. Split client/server validators for app envs when T3 env needs separate `client` and `server` shapes. Apps must import envs or validators from `@monorepo-template/env/web`, `@monorepo-template/env/server`, or package-root exports instead of defining validation locally.

Do not read `process.env` directly outside `packages/env` internals. Add missing variables to `globalEnv`, derive the app-specific env, then import from `@monorepo-template/env/*`.

The env package Vite root entry is package-root `env.ts`, not `src/index.ts`.
Its Vite `envDir` points to the workspace root (`../..`) so `.env` is loaded from the repo root.

Use current Zod imports, methods, and functions only; do not add deprecated pre-Zod-4 patterns or compatibility implementations.

## Database

`packages/db` (`@monorepo-template/db`) owns shared Drizzle connection helpers. Read `packages/db/AGENTS.md` before changing database code.

This is a template repo: keep example schema tables under `packages/db/example/schema/`; exported `packages/db/src/` code should stay connection-only unless adapting the template into a real project.

Database configuration must come from `@monorepo-template/env/server`, not direct `process.env` reads.

## `packages/entities` build

Vite lib mode, ESM only (`formats: ["es"]`), output at `dist/index.js`.
`unplugin-dts/vite` generates `.d.ts` files during the Vite build — no separate `tsc --declaration` step.
Path alias `@/*` → `./src/*`, mirrored in both `vite.config.ts` and `tsconfig.json`.
`zod` is a peer dependency and dev dependency; consumers must provide their own compatible `zod` install.

## API contracts

All shared API contracts belong in `packages/entities`, exported by `@monorepo-template/entities`. Define Zod schemas and inferred types together there; frontend/backend consumers must import them instead of writing matching contract types locally.

Read `packages/entities/AGENTS.md` before changing API contracts.

Use current Zod imports, methods, and functions only; do not add deprecated pre-Zod-4 patterns or compatibility implementations.

This is a template repo: keep sample contracts under `packages/entities/example/`; only put real project contracts in `packages/entities/src/`.

Barrel files stay relative (`export * from "./feature"`), while implementation files may use absolute `@/...` imports.

## Commit rules

Conventional Commits enforced by commitlint (`commit-msg` hook):

```
<type>(<scope>): <subject>
```

Valid types: `feat fix docs style refactor perf test build ci chore revert`

## Non-Negotiable Git Safety

- **NEVER use `--no-verify`, `--no-hooks`, `HUSKY=0`, skipped hooks, disabled checks, or any equivalent
  bypass.** Fix the underlying failure instead.
- **NEVER commit, amend, push, force-push, tag, publish, release, or deploy without explicit user
  permission for that specific action.** Permission to edit files or run validation is not permission
  to perform any Git or release operation.
- Before any explicitly authorized commit or release operation, inspect `git status`, `git diff`, and
  recent history, stage only intended files, and run the required validation checks.

## Pre-commit hooks

Every commit runs two checks automatically (via Husky):

1. `lint-staged` — Prettier on staged `*.{js,jsx,ts,tsx,json,md,yml,yaml}`.
2. `skills:check --staged` — validates all skill roots are in sync. **Hard-rejects the commit if any root is out of sync.** No auto-fix; run `pnpm skills:sync` and re-stage.

## Skills system

Four roots must always be byte-for-byte identical:
`skills/`, `.agents/skills/`, `.claude/skills/`, `.opencode/skills/`

After creating or editing a skill:

```sh
pnpm skills:sync
git add skills .agents/skills .claude/skills .opencode/skills .skills-sync.json
```

Other commands:

```sh
pnpm skills:create <name> --description "..."   # scaffold a new skill
pnpm skills:check                               # validate all roots
pnpm skills:remove <name>                       # remove from all roots
pnpm skills:test                                # run skills unit tests
```

Each skill lives in `skills/<name>/SKILL.md` with exactly two frontmatter keys (`name`, `description`). No provider-specific syntax (no `` !`...` ``, no `${CLAUDE_*}`).

## Mandatory Agent Workflow

Every agent task must begin with the `test-first-workflow` skill, regardless of whether the task
changes code, tests, documentation, configuration, packages, or skills. Define acceptance criteria
and executable tests or equivalent validation checks before editing, then run the checks after the
change.

Load the additional skills when their task boundaries apply:

- `checklist-tracking` when changing Markdown checklists, plans, status tables, or tracked test cases.
- `testing-policy` whenever adding, editing, reviewing, or troubleshooting tests.
- `security-testing-policy` whenever security boundaries, authorization, secret handling, input
  hardening, sandboxed integrations, or externally connected tests are involved.
- `contract-validation` whenever defining or changing schemas, DTOs, request/response payloads, route
  parameters, query parameters, forms, API parsing, or shared inferred types.
- `backend-standards` whenever changing backend modules, controllers, services, persistence,
  transactions, authorization, background jobs, or backend observability.
- `frontend-standards` whenever changing frontend routes, components, forms, tables, UI states,
  environment use, accessibility, styling, or responsive behavior.
- `react-19` whenever writing or reviewing React code, hooks, forms, state, effects, or components.
- `jsx-component-extraction` when JSX or TSX nesting, render logic, or component extraction is
  involved.
- `end-to-end-api-flow` when API behavior crosses contracts, backend endpoints, API clients,
  query-client hooks, and consuming clients.
- `observability` whenever changing logs, metrics, traces, audit events, correlation IDs, lifecycle
  status, retries, or error metadata.
- `code-review` whenever reviewing a patch, pull request, refactor, migration, dependency change,
  configuration change, or release preparation.
- `release-flow` whenever preparing versions, changelogs, release notes, migrations, deprecations,
  package publication, or deployment handoffs.

The mandatory test-first workflow does not permit skipping validation because a change is described
as documentation-only, configuration-only, or metadata-only. Use an appropriate parser, formatter,
sync check, test, build, typecheck, or exact reference scan for non-executable changes.

## Style

Prettier config: double quotes, semicolons, **no trailing commas**.

## No CI

No `.github/workflows/` exists. Use `just check` as the local pre-PR gate.
