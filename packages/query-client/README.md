# @monorepo-template/query-client

Shared workspace package for `query-client`.

## Usage

Export public APIs from `src/index.ts`, then import them from the package root:

```ts
import { example } from "@monorepo-template/query-client";
```

## Development

```sh
pnpm --filter @monorepo-template/query-client build
pnpm --filter @monorepo-template/query-client typecheck
pnpm --filter @monorepo-template/query-client lint
```
