# AGENTS.md

## Purpose

`core/` contains repository tooling packages that maintain or distribute the template itself. These
packages are part of the source workspace but are excluded from Copier-generated projects.

## Rules

- Keep consumer application and library code under `apps/` and `packages/`; keep template-only
  tooling under `core/`.
- Every package under `core/` must be excluded from Copier output and covered by generation tests.
- Core packages may use the root pnpm workspace, lint, and formatting configuration.
- Do not add runtime dependencies when Node built-ins provide the required behavior.
- Never invoke user-controlled values through a shell. Pass commands and arguments separately.
- Keep external-system tests deterministic and local unless an explicit integration test owns the
  dependency.

## Validation

Run from the repository root:

```sh
pnpm --filter create-mono-stack test
pnpm --filter create-mono-stack lint
pnpm template:test:integration
```
