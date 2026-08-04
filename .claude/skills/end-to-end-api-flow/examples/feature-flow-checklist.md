# Feature Flow Checklist

Use this as the expected implementation record for an API-backed feature.

Feature: list todos for a user

1. Entities: define the list request params and todo response contracts under `packages/entities`, then export them from the public barrel.
2. API: implement or update the server route and service so its params, success response, and errors match those contracts.
3. API client: add a typed `todoApi.listByUser` operation under `packages/api-client` and return the response data.
4. Query client: add `useTodoListByUser` under `packages/query-client`, using the API operation and a query key containing the user ID.
5. Consumer: load todos through `useTodoListByUser`; do not import Axios, `fetch`, or `todoApi` in the route.
6. Validation: build and typecheck changed packages in dependency order, then lint the changed packages and consumer.

Direct API-client usage: none. TanStack Query can represent this read operation, so bypassing the query client would violate the flow.
