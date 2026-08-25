# @monorepo-template/auth

Shared workspace package for `auth`.

## Usage

Export public APIs from `src/index.ts`, then import them from the package root:

```ts
import { example } from "@monorepo-template/auth";
```

## Development

```sh
pnpm --filter @monorepo-template/auth build
pnpm --filter @monorepo-template/auth typecheck
pnpm --filter @monorepo-template/auth lint
```
