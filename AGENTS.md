# AGENTS.md

## Repo layout

```
apps/
  server/      # server — NestJS example API app (own CommonJS/Vitest toolchain, see apps/server/AGENTS.md)
core/
  create-mono-stack/ # source-only npm launcher and Copier test owner; excluded from generated projects
packages/
  config/      # @monorepo-template/config — shared app config, plain tsc, NodeNext
  db/          # @monorepo-template/db — Drizzle database connection helpers
  env/         # @monorepo-template/env — T3 env + Zod workspace env validation
  entities/    # @monorepo-template/entities — shared API Zod contracts + inferred types
  api-client/  # @monorepo-template/api-client — shared Axios API client helpers
skills/        # canonical source for portable agent skills (see below)
scripts/       # portable skills tooling and generated-project template update wrapper
```

Package manager: `pnpm@9.15.4`. Root `"type": "module"` — ESM throughout.

Install dependencies and development tools at the repository/workspace level only. Never install
packages globally. For non-Node tooling, use a repository-local environment such as `.venv` or an
ephemeral runner that does not persist a global installation.

## Key commands

```sh
pnpm build          # turbo build (topological, cached)
pnpm dev            # build upstream packages, then start persistent development tasks
pnpm dev:reference  # same, but for the reference apps under reference/
pnpm lint           # turbo package lint + root scripts (requires upstream build first)
pnpm package:create <name>  # scaffold packages/<name> as @monorepo-template/<name>
pnpm typecheck      # turbo typecheck (requires upstream build first)
pnpm format         # prettier --write . (root-level only, not per-package)
pnpm format:check   # CI-safe format check
pnpm e2e:web        # Playwright browser e2e tests
pnpm e2e:mobile     # Maestro mobile e2e flows (requires local devices and Maestro CLI)

just check          # lint + typecheck + format-check + skills-check + skills-test + template-test
just package-create <name>  # Just wrapper for pnpm package:create
```

The former root `pnpm e2e` command was renamed to `pnpm e2e:web`; use `pnpm e2e:mobile` for the
Maestro suite.

`pnpm dev` and `pnpm dev:reference` run through Turborepo's interactive terminal UI (`--ui tui`):
each app's dev server gets its own pane. Use the arrow keys (or a pane's shown number) to focus a
pane, then type directly into it — this is how to send interactive keypresses (e.g. React Native
Metro's `r`/`d`, the Expo CLI's `r`/`m`) to `apps/mobile` or `apps/expo` while every other dev
server keeps running. Running a single app's dev script by itself
(`pnpm --filter mobile dev:reference`, `pnpm --filter expo dev:reference`, etc.) in its own
terminal remains available too.

Run a single package:

```sh
pnpm --filter create-mono-stack test
pnpm --filter @monorepo-template/entities build
pnpm --filter @monorepo-template/config typecheck
```

## Generated Project Template Updates

Agents working in a generated project must preview template changes before applying them:

```sh
pnpm template:update --dry-run
```

Inspect the preview, resolve any reported conflicts or ambiguous changes, then apply the update:

```sh
pnpm template:update
```

Run the generated project's validation checks after the real update. Do not skip the preview step.

Release `create-mono-stack` only after explicit user authorization. Follow the package-local release
checklist and publish wrapper rather than calling the registry directly:

```sh
pnpm --filter create-mono-stack publish:package
```

The wrapper uses the ignored repository `.npmrc.auth` file, or `NPM_CONFIG_USERCONFIG` when set, and
forwards publish arguments to `pnpm publish` from `core/create-mono-stack`.

`just` with no args lists all recipes. `set dotenv-load := true` so `.env` is auto-loaded by Just.

## Creating packages

Use `pnpm package:create <project-name>` or `just package-create <project-name>` instead of hand-writing package setup. The scaffold creates `packages/<project-name>` with package name `@monorepo-template/<project-name>`.

The scaffold creates Vite lib-mode package files (`package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `README.md`, `AGENTS.md`, `src/index.ts`) and refuses to overwrite an existing package unless `--force` is passed to the pnpm script.

Import convention: implementation, test, and configuration source files must use project aliases or package-name imports. Relative imports are prohibited except for exports in barrel files (`index.ts`, `index.tsx`, and equivalent nested index files) so emitted declarations do not leak private aliases. The staged relative-import check enforces this rule. Fix module resolution rather than adding a convenience exception.

## Turbo pipeline

- `build` depends on `^build` — upstream packages must build before downstream ones.
- `lint` and `typecheck` also depend on `^build` — cross-package type imports require upstream `dist/` to exist.
- No `test` task in Turbo. Skills tests run via `pnpm skills:test` (Node `node:test`).

## TypeScript quirks

The workspace uses **TypeScript 7**. Packages that generate declarations with `unplugin-dts` also
declare `@typescript/typescript6` so the TypeScript 6 compiler API remains available to that tooling.

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

Use the existing ORM for database operations; do not author raw SQL or bypass it through the driver.
Apply [backend-standards](skills/backend-standards/SKILL.md#orm-only-persistence), including for scripts,
seeders, and test setup. Its ORM-only policy distinguishes generated migrations from handwritten SQL.

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

Commit subjects may be up to 120 characters. Every intentional commit must include a blank line and
a detailed body. Body lines may be up to 700 characters, and the total body length is not limited.
Explain what changed, why it changed, relevant user-visible, compatibility, migration, security, or
operational impact, and the validation or tests performed. Keep the subject specific and concise even
when the wider limit is available; do not use secrets, unverifiable claims, or filler.

## Non-Negotiable Git Safety

- **NEVER use `--no-verify`, `--no-hooks`, `HUSKY=0`, skipped hooks, disabled checks, or any equivalent
  bypass.** Fix the underlying failure instead.
- **NEVER commit, amend, push, force-push, tag, publish, release, or deploy without explicit user
  permission for that specific action.** Permission to edit files or run validation is not permission
  to perform any Git or release operation.
- Before any explicitly authorized commit or release operation, inspect `git status`, `git diff`, and
  recent history, stage only intended files, and run the required validation checks.

## Pre-commit hooks

Every commit starts with two staged checks automatically (via Husky):

1. `lint-staged` — Prettier on staged `*.{js,jsx,ts,tsx,json,md,yml,yaml}`.
2. `skills:check --staged` — validates all skill roots are in sync. **Hard-rejects the commit if any root is out of sync.** No auto-fix; run `pnpm skills:sync` and re-stage.

The hook then runs staged shared-component validation, the workspace build, applicable server/core
unit tests, lint, and typecheck. Independent checks run in parallel where their build dependencies
allow it. Browser and device E2E suites remain explicit commands and are not pre-commit checks.

## Skills system

Four roots must always be byte-for-byte identical:
`skills/`, `.agents/skills/`, `.claude/skills/`, `.opencode/skills/`

The locked native `shadcn` skill is an exception to the portable metadata rules. It is synchronized
for discovery but may retain upstream provider-specific syntax because `skills-lock.json` excludes it
from portable-skill validation. Do not use that syntax in repository-authored portable skills.

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

Authentication, protected routes, sessions, roles, permissions, ownership, and authorization tests
must also invoke the portable `authentication-rbac` skill. It is the source of truth for separating
navigation guards from server-side data authorization.

Every agent task must begin with the `test-first-workflow` skill, regardless of whether the task
changes code, tests, documentation, configuration, packages, or skills. Define acceptance criteria
and executable tests or equivalent validation checks before editing, then run the checks after the
change.

Select a change tier before editing: `light`, `standard`, or `large`, per `test-first-workflow`. A
light-tier change — a single configuration value, port, dependency bump, wording tweak, or
documentation fix with no behavior, contract, route, authorization, endpoint, or end-to-end test
impact — creates no checklist file; emit the `LIGHT-TIER-ATTESTATION` block from
`skills/test-first-workflow/templates/light-change-record.md` in your response and commit message
body. Standard tier is unchanged and still requires the full Implementation Contract checklist.
Large tier splits into a parent checklist that links at least two standard-tier child checklists.
The `commit-msg` hook rejects a commit that changes non-exempt files with neither a checklist nor a
completed light attestation.

Every code-generation or code-editing task must also invoke the `code-quality` skill before editing.
Before implementation edits, read the active checklist and every path it declares under `Related checklists`; the implementation gate verifies these reads when supported by the agent adapter.

Invoke each applicable skill through the agent's skill mechanism at the moment you enter an
implementation phase. Entering implementation after a planning phase, after exiting plan mode, after
answering questions, or after any research phase requires invoking the applicable skills at that
point. Prior context, an approved plan, an earlier phase in the same session, or familiarity with the
steps is never an exemption. Do not approximate a skill's rules from memory; invoke the skill so its
current rules load, then follow them. In Claude Code this is enforced at edit time by the
`scripts/skill-gate.mjs` pre-tool hook (configured in `.claude/settings.json` from
`.claude/skill-triggers.json`); the same rule still binds every other agent, where it is not
mechanically enforced.

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
- `e2e-regression-test-writer` only when a user-facing web flow's observable behavior changes
  (route, navigation, form behavior, validation, authorization, redirect, success or error state),
  or when editing any file under `apps/playwright/**` (path-gated by `.claude/skill-triggers.json`).
  Never for component-internal edits, behavior-neutral refactors, dependency or configuration
  changes, documentation, or light-tier changes.
- `maestro-mobile-e2e-test-writer` only when a user-facing mobile flow's observable behavior
  changes, or when editing any file under `apps/maestro/**` (path-gated). Same exclusions.
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
