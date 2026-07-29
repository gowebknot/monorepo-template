# Monorepo Template

pnpm workspace powered by Turborepo, Just, Husky, lint-staged, and Conventional Commits.

## Structure

- `apps/web`: example frontend-style app
- `apps/server`: example API-style app (NestJS)
- `packages/ui`: shared UI helpers
- `packages/config`: shared config
- `packages/env`: shared T3 env + Zod validation
- `packages/db`: shared Drizzle database connection helpers

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

The script creates `packages/<project-name>` and names the package as `@<root package.json name>/<project-name>`. In this repo, `pnpm package:create billing` creates `packages/billing` with package name `@monorepo-template/billing`.

It creates `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, and `src/index.ts`, then refuses to overwrite an existing package unless `--force` is passed.

Use absolute `@/...` imports in implementation files. Use relative exports in barrel files such as `src/index.ts` and nested `index.ts` files so emitted `.d.ts` files stay portable for consumers.

Validate a new package with:

```sh
pnpm --filter @monorepo-template/<project-name> build
pnpm --filter @monorepo-template/<project-name> typecheck
pnpm --filter @monorepo-template/<project-name> lint
```

## API contracts

`packages/entities` (`@monorepo-template/entities`) owns shared API contracts. Define each contract as a Zod schema plus inferred TypeScript type there, then import both schema and type from consumer projects. Frontend and backend packages should not hand-write API contract types locally.

Because this repository is a template, concrete sample contracts live under `packages/entities/example/` rather than exported `src/` code. When adapting the template for a real project, move/create real contracts under `packages/entities/src/api-contracts` and export them from `src/index.ts`.

Example export pattern:

```ts
import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok")
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
```

## Environment config

`packages/env` (`@monorepo-template/env`) owns workspace env validation. Put every env schema in the `globalEnv` Zod object, then derive app-specific envs with `globalEnv.pick(...).shape`.

Import parsed app envs from subpaths so each app validates only its own required variables:

```ts
import { webEnv } from "@monorepo-template/env/web";
import { serverEnv } from "@monorepo-template/env/server";
```

The package root exports `globalEnv`, picked validators (`webEnvSchema`, `webServerEnvSchema`, `webClientEnvSchema`, `serverEnvSchema`), and factory functions (`createWebEnv`, `createServerEnv`) for composition/testing without eagerly validating app-specific envs.

## Database

`packages/db` (`@monorepo-template/db`) owns shared Drizzle database connection helpers. Because this repository is a template, example tables live under `packages/db/example/schema/`; exported `src/` code stays connection-only.

Database configuration is read through `@monorepo-template/env/server`, not directly from `process.env`.

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
