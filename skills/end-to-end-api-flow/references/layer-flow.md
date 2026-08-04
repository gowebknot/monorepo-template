# API Flow Layer Map

Use this map when implementing or reviewing an API-backed feature.

## 1. Shared Entities

Location: `packages/entities/src/api-contracts/<feature>/`

- Define request, response, params, and error schemas with Zod.
- Export inferred TypeScript types beside the schemas.
- Re-export the feature from its nested barrel, `src/api-contracts/index.ts`, and `src/index.ts`.
- Keep API shapes in this package so backend, API clients, query hooks, and consumers share one source of truth.

Do not define matching DTO, request, response, or error types in downstream packages.

## 2. Backend API

Location: commonly `apps/server/src/` or `apps/server/reference/`

- Implement routes, controllers, services, authorization, and persistence behavior using the shared contracts.
- Follow the target app's local validation conventions. Do not add a second validation architecture just to satisfy this flow.
- Confirm success and error behavior matches the entity contracts before adding client wrappers.

## 3. API Client

Location: `packages/api-client/src/`

- Add typed path and service helpers for the endpoint.
- Import API types from `@monorepo-template/entities`.
- Return `response.data` and leave response validation to the established application boundary.
- Pass runtime configuration into the client; do not read `process.env` here.

The API client owns HTTP transport. It must not contain React or TanStack Query behavior.

## 4. Query Client

Location: `packages/query-client/src/`

- Add hooks that call the API-client service.
- Define stable query keys and mutation cache behavior here.
- Keep loading, error, retry, invalidation, optimistic-update, and refetch policy in the query layer when applicable.

The query client must not construct API URLs or duplicate API-client service logic.

## 5. Consumer

Location: a frontend app or another package consuming the feature

- Import the public query hook and pass runtime options and feature inputs to it.
- Use shared entity types for local form or view typing when needed.
- Keep HTTP transport and cache management out of the consumer.

Direct API-client usage is an exception for behavior TanStack Query cannot model, such as a genuinely non-query transport interaction. Record why a hook is not viable; convenience or an incomplete query-client implementation is not sufficient justification.

## Dependency Direction

```text
consumer -> query-client -> api-client -> entities
backend API ---------------------------> entities
```

No package may depend upward in this chain, and no consumer may bypass a layer for convenience.
