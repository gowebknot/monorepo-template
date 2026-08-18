# Monorepo Template

pnpm workspace powered by Turborepo, Just, Husky, lint-staged, and Conventional Commits.

## Creating a project

This repository is also a [Copier](https://copier.readthedocs.io/) template. Copier keeps the
template version in the generated project and can apply later template changes without blindly
overwriting the entire project.

Use the `create-mono-stack` package to render the newest stable template version. Node.js 20+, Python
3.10+, Git, and SSH access to `gowebknot/monorepo-template` are required. When Python is unavailable,
setup asks before installing it through mise or the native platform package manager. Docker and global
Python packages are not used.

```sh
pnpm create mono-stack
```

Running without arguments in an interactive terminal opens an Ink-powered setup TUI. Type values and
press Enter to continue, use the arrow keys for choices, Space to toggle stack features, and press
Escape or Ctrl+C to cancel. The default stack includes the Vite web app and NestJS API. Optional
Next.js, Express, Expo, and bare React Native features can be selected during setup. For scripts or
direct configuration, pass the destination and options explicitly:

```sh
pnpm create mono-stack my-project --name "My Project"
cd my-project
pnpm install
git add .
git commit -m "chore: initialize project"
```

Feature selections can also be supplied non-interactively:

```sh
pnpm create mono-stack my-project \
  --features web-vite,api-express,mobile-expo
```

Setup initializes the repository on `main` but intentionally leaves the first commit to you.

If your SSH configuration uses a host alias for the template repository, pass it as a transport-only
override. Setup stores it in the generated repository's local Git configuration, while Copier still
records the generic source URL for other developers:

```sh
pnpm create mono-stack my-project \
  --name "My Project" \
  --git-host-alias github-webknot
```

For local launcher development, point it at this checkout explicitly:

```sh
node core/create-mono-stack/bin/create-mono-stack.js ../my-project \
  --name "My Project" \
  --template . \
  --vcs-ref HEAD
```

Copier selects the newest stable PEP 440-compatible Git tag by default. Publish immutable tags such
as `v1.0.0` and `v1.1.0` so generated projects can update predictably.

Setup installs the pinned Copier toolchain into the generated project's `.venv`, while `mise.toml`
declares the latest Python runtime. Native Vite source, configuration, scripts, dependency placement,
and dependency versions remain authoritative. React TypeScript variants receive an isolated web app
under `reference/`; only missing reference dependencies and `*:reference` scripts are added. Every
generated NestJS app receives the NestJS reference profile. Custom-path and unsupported native apps remain untouched during template
updates, and Copier does not recreate their canonical placeholder directories.

React Router v7, TanStack Router, RedwoodSDK, and Vike selections receive separate code-only
references under `reference/`. These references are integration examples: setup does not add or
replace configuration, dependencies, or scripts for them, and they are not independently runnable.

Vite's own interactive wizard still chooses the framework, variant, and linter. Setup observes Vite's
confirmed answers without changing them and records recognized choices in `.mono-stack.json`. If the
answers are unrecognized or disagree with the generated files, setup keeps the result as a native app
without applying the web reference profile. React Compiler, SWC, ESLint, and Oxlint choices are
preserved because the web reference never replaces the selected Vite configuration.

The project records its template source and version in `.copier-answers.yml`, and its selected stack in
`.mono-stack.json`, so no separate updater bootstrap is required. Create the initial Git commit before
applying a template update.

New projects include a committed `.env.example` with safe local defaults and create a matching ignored
`.env` automatically. Edit `.env` for local values; template updates preserve it.

Setup stores an alias passed with `--git-host-alias` automatically. Because the setting remains in
`.git/config` and is not committed, configure it once after cloning the project elsewhere or when
repairing an older project:

```sh
git config --local mono-stack.template-host-alias github-webknot
```

Omit that setting when generic GitHub SSH works. Run updates through the wrapper so Copier keeps the
generic source URL while Git uses the local alias when needed:

```sh
pnpm template:update
```

Review and resolve any reported conflicts before running the project checks. Keep the generated
project's working tree clean before updating so user changes are easy to distinguish from template
changes.

## Structure

- `apps/web`: example frontend-style app
- `apps/server`: example API-style app (NestJS)
- `core/create-mono-stack`: source-only npm launcher and Copier tests
- `packages/api-client`: shared Axios API client helpers
- `packages/config`: shared config
- `packages/env`: shared T3 env + Zod validation
- `packages/db`: shared Drizzle database connection helpers
- `packages/entities`: shared API contracts
- `packages/query-client`: shared TanStack Query hooks

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm package:create billing
```

Or with Just:

```sh
just install
just check
just package-create billing
```

## Creating packages

Create minimal Vite library packages with:

```sh
pnpm package:create <project-name>
```

The script creates `packages/<project-name>` under the stable `@repo` workspace scope. For example,
`pnpm package:create billing` creates `packages/billing` with package name `@repo/billing`.

It creates `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, and `src/index.ts`, then refuses to overwrite an existing package unless `--force` is passed.

Use absolute `@/...` imports in implementation files. Use relative exports in barrel files such as `src/index.ts` and nested `index.ts` files so emitted `.d.ts` files stay portable for consumers.

Validate a new package with:

```sh
pnpm --filter @repo/<project-name> build
pnpm --filter @repo/<project-name> typecheck
pnpm --filter @repo/<project-name> lint
```

## API contracts

`packages/entities` (`@repo/entities`) owns shared API contracts. Define each contract as a Zod schema plus inferred TypeScript type there, then import both schema and type from consumer projects. Frontend and backend packages should not hand-write API contract types locally.

Concrete reference contracts live under `packages/entities/example/` rather than exported `src/`
code. Create product contracts under `packages/entities/src/api-contracts` and export them from
`src/index.ts`.

Example export pattern:

```ts
import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok")
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
```

## Environment config

`packages/env` (`@repo/env`) owns workspace env validation. Put every env schema in the `globalEnv` Zod object, then derive app-specific envs with `globalEnv.pick(...).shape`.

Import parsed app envs from subpaths so each app validates only its own required variables:

```ts
import { webEnv } from "@repo/env/web";
import { serverEnv } from "@repo/env/server";
```

The package root exports `globalEnv`, picked validators (`webEnvSchema`, `webServerEnvSchema`, `webClientEnvSchema`, `serverEnvSchema`), and factory functions (`createWebEnv`, `createServerEnv`) for composition/testing without eagerly validating app-specific envs.

## Database

`packages/db` (`@repo/db`) owns shared Drizzle database connection helpers. Example tables live under
`packages/db/example/schema/`; exported `src/` code stays connection-only.

Database configuration is read through `@repo/env/server`, not directly from `process.env`.

## Portable agent skills

Repository skills live in `skills/<skill-name>/` and are synchronized into the
native discovery locations for Codex, Claude Code, and OpenCode. Each skill has
`SKILL.md` plus the required `scripts/`, `references/`, `assets/`, `templates/`,
and `examples/` directories.

Create a skill with:

```sh
pnpm skills:create my-skill --description "Explain when this skill should run."
```

If an agent creates or edits a skill directly under `.agents/skills/`,
`.claude/skills/`, or `.opencode/skills/`, reconcile it with:

```sh
pnpm skills:sync
```

The pre-commit hook checks the exact staged snapshot and rejects drift between
the canonical and native copies. It does not rewrite or stage files. Before
committing skill changes, run:

```sh
pnpm skills:sync
git add skills .agents/skills .claude/skills .opencode/skills .skills-sync.json
pnpm skills:check
```

Remove a skill from every location with `pnpm skills:remove <skill-name>`.

## License

Licensed under the [MIT License](LICENSE). Copyright (c) 2026 Webknot Technologies.
