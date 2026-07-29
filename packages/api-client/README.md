# @monorepo-template/api-client

Shared Axios-based API call package for workspace apps and packages.

## Install

This package declares `axios` as a peer dependency. API contract types should come from `@monorepo-template/entities`.

```sh
pnpm add axios
```

## Usage

```ts
import { createCrudService } from "@monorepo-template/api-client";
import type { User, UserCreate, UserUpdate } from "@monorepo-template/entities";

const userService = createCrudService<User, User[], UserCreate, UserUpdate>(
  "users"
);

const user = await userService.detail("me", {
  baseURL: "https://api.example.com"
});
```

## API

### `createCrudService(resourceName, schemas)`

Creates typed CRUD service helpers for a REST resource under `/api/v1/<resourceName>`.

Returned helpers make the API call and return `response.data`:

- `detail(id, options?)`
- `list(options?)`
- `create(data, options?)`
- `replace(id, data, options?)`
- `update(id, data, options?)`
- `remove(id, options?)`

### `createApiClient(config)`

Creates an Axios instance for custom service functions.

### `getClient(options)`

Creates an Axios instance from service options. `baseURL` is required.

### `createResourcePaths(resourceName)`

Creates collection/detail path helpers for a REST resource.

## Development

```sh
pnpm --filter @monorepo-template/api-client build
pnpm --filter @monorepo-template/api-client typecheck
pnpm --filter @monorepo-template/api-client lint
```
