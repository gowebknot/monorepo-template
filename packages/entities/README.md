# @monorepo-template/entities

Shared API Zod contracts and inferred TypeScript types.

## Usage

Define each API contract as a Zod schema plus an inferred type, then export real project contracts from `src/api-contracts` through `src/index.ts`.

Template sample contracts live under `example/` and are not exported from the package root.

## Development

```sh
pnpm --filter @monorepo-template/entities build
pnpm --filter @monorepo-template/entities typecheck
pnpm --filter @monorepo-template/entities lint
```
