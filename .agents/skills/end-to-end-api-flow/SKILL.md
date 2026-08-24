---
name: end-to-end-api-flow
description: "Use when implementing, reviewing, debugging, or tracing API-backed behavior across shared contracts, backend endpoints, typed API clients, query hooks, and frontend consumers. Apply it when adding or changing API endpoints or contracts, wiring frontend-to-backend integrations, or diagnosing request, response, validation, authorization, caching, or error-handling issues. Do not use for frontend-only UI work or backend changes that do not cross an API boundary."
---

# End-to-End API Flow

Apply the API flow as a required dependency chain:

`entities -> API -> api-client -> query-client -> consumer`

1. Before editing, identify the feature, endpoint, consumer, and current implementation at every layer. Read the relevant package `AGENTS.md` files and use `references/layer-flow.md` for the repository mapping.
2. Start with `@monorepo-template/entities`. Define or update request, response, params, and error Zod schemas together with their inferred types. Export them through the package barrels; never recreate API shapes downstream.
3. Implement or update the backend API using the shared entity contracts and the target app's local validation conventions. Keep the API behavior, authorization, and error responses aligned with those contracts.
4. Add the typed operation to `@monorepo-template/api-client`. Reuse shared paths and services, import types from `@monorepo-template/entities`, return `response.data`, and keep transport concerns out of consumers.
5. Add or update the corresponding `@monorepo-template/query-client` hook. Build it on the API-client operation, keep query keys and cache invalidation there, and do not duplicate HTTP calls or service logic.
6. Update the frontend consumer to use the query-client hook. Do not use `fetch`, Axios, or the API client directly from a consumer, and do not define duplicate request or response types there.
7. Use the API client directly from a consumer only when TanStack Query cannot represent the behavior. First verify that an appropriate query, mutation, infinite query, or mutation lifecycle cannot model it; then document the exact limitation and rationale in the change summary.
8. Verify that no layer was skipped, package dependencies point only down the chain, public barrels expose the new operation, and the consumer uses the intended hook. Run focused checks for each changed package in dependency order, followed by the relevant application checks.

## Shared API Configuration

- Configure the generic API target once at the application provider boundary with the query client's `ApiClientConfigProvider` and an `options: ServiceOptions` prop.
- Let TanStack query hooks inherit the provider's `ServiceOptions`; consumers must not repeat the generic `baseURL` on every hook call.
- Pass inline `ServiceOptions` only when an operation intentionally targets a different API or needs a local transport override. Inline values take precedence over provider values, and inline headers merge over provider headers.
- Keep the provider and option-resolution logic in `@monorepo-template/query-client`; keep Axios setup and HTTP transport in `@monorepo-template/api-client`.

For review, debugging, or tracing work, walk the same chain in both directions: start at the observed consumer behavior, locate the first broken contract or boundary, and report the concrete layer and file that must change.
