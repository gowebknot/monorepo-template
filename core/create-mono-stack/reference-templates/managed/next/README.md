# next

Next.js App Router reference app in the workspace. Shares contracts, API client, and query hooks with
the other apps through the `@monorepo-template/*` packages.

```sh
pnpm --filter next dev
```

Copy `.env.example` to `.env.local` and point `NEXT_PUBLIC_API_BASE_URL` at your API before loading
the todos demo at `/reference/todos`.
