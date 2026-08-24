# Source Layout

This reference adapts the Aspiron repository structure for a server implemented with Express or
NestJS and React web/mobile clients. The names below are examples. Use the project's real domains and
features while preserving the boundaries and nesting.

## Shared Ownership

```text
packages/
├── entities/
│   └── src/
│       ├── api-contracts/
│       │   ├── auth/
│       │   ├── content/
│       │   └── assessment/
│       ├── shared-types/
│       └── index.ts
├── ui/
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   └── forms/
│       ├── lib/
│       └── index.ts
├── api-client/
│   └── src/
│       ├── client/
│       ├── services/
│       │   ├── auth/
│       │   ├── content/
│       │   └── assessment/
│       ├── generated-types/
│       └── index.ts
└── tanstack-client/
    └── src/
        ├── hooks/
        │   ├── auth/
        │   ├── content/
        │   └── assessment/
        ├── providers/
        ├── types/
        └── index.ts
```

- Put shared request/response contracts, inferred types, and shared domain types in `packages/entities`.
- Put reusable UI primitives, form controls, icons, and icon wrappers in `packages/ui`.
- Do not create `components/ui` or `components/forms` inside web or mobile apps.
- Keep transport clients in `packages/api-client` and query hooks in `packages/tanstack-client`.

Component placement follows ownership, not visual similarity:

- Put a reusable component with no product-feature behavior, such as an icon, button, input, or
  avatar, in `packages/ui`.
- Put app-wide composition, such as an app shell, navigation, sidebar, or branded icon set that is
  not intended for package reuse, in the app's top-level `components/` folder.
- Put a component in `features/<feature>/components` only when its behavior or composition belongs
  to that feature. Do not put global icons or generic UI primitives there.
- When a feature-specific component wraps a shared primitive, keep the primitive in `packages/ui`
  and the feature wrapper in the feature folder.

## Server Structure

```text
apps/server/src/
├── main.ts
├── http/
│   ├── handlers/
│   │   ├── auth.handler.ts
│   │   ├── content.handler.ts
│   │   └── assessment.handler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── content.routes.ts
│   │   └── assessment.routes.ts
│   ├── payloads/
│   │   ├── auth.payload.ts
│   │   ├── content.payload.ts
│   │   └── assessment.payload.ts
│   ├── responses/
│   │   ├── auth.response.ts
│   │   ├── content.response.ts
│   │   └── assessment.response.ts
│   └── middleware/
│       ├── client-type.middleware.ts
│       └── request-context.middleware.ts
├── application/
│   ├── auth/
│   │   ├── login.ts
│   │   ├── refresh-token.ts
│   │   ├── get-current-user.ts
│   │   ├── ports.ts
│   │   └── index.ts
│   ├── content/
│   │   ├── get-subjects.ts
│   │   ├── get-chapters.ts
│   │   ├── get-topics.ts
│   │   ├── ports.ts
│   │   └── index.ts
│   └── assessment/
│       ├── create-quiz.ts
│       ├── submit-attempt.ts
│       ├── get-results.ts
│       ├── ports.ts
│       └── index.ts
├── domain/
│   ├── auth/
│   │   ├── entities.ts
│   │   ├── value-objects.ts
│   │   ├── errors.ts
│   │   └── index.ts
│   ├── content/
│   │   ├── entities.ts
│   │   ├── value-objects.ts
│   │   ├── errors.ts
│   │   ├── rules.ts
│   │   └── index.ts
│   └── assessment/
│       ├── entities.ts
│       ├── value-objects.ts
│       ├── errors.ts
│       ├── scoring.ts
│       └── index.ts
├── infra/
│   ├── auth/
│   │   ├── jwt.service.ts
│   │   └── password-hasher.ts
│   ├── db/
│   │   ├── connection.ts
│   │   └── repositories/
│   │       ├── auth.repository.ts
│   │       ├── content.repository.ts
│   │       └── assessment.repository.ts
│   └── external/
│       └── storage.client.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── request-id.middleware.ts
├── seeds/
│   ├── seed.ts
│   └── fixtures/
├── constants/
│   └── index.ts
└── index.ts
```

### Server Responsibilities

- `http/routes` registers Express routes and middleware. In NestJS, the equivalent transport boundary
  is feature modules and controllers; keep them thin and map to the same application use cases.
- `http/handlers` parses transport input, obtains request context, calls application use cases, and
  maps results to responses. NestJS controllers perform this equivalent work.
- `http/payloads` validates or adapts incoming HTTP shapes. Authoritative shared contracts remain in
  `packages/entities`; NestJS DTOs are transport adapters, not duplicate domain models.
- `http/responses` maps application results to stable HTTP response shapes.
- `application/<domain>` owns use-case orchestration and ports, not Express, NestJS, or database details.
- `domain/<domain>` owns domain rules, errors, value objects, and local domain behavior.
- `infra/db/repositories` implements application ports and owns database queries.
- Root `middleware` handles cross-cutting concerns such as authentication, errors, and request IDs.
- `seeds` is explicit and separate from startup and migrations.
- Do not add `entries/entities`; shared entities belong to `packages/entities`. Keep an enum in the
  server only when it is private persistence or infrastructure detail.

## Web Structure

```text
apps/web/src/
├── routes/
│   ├── auth/
│   │   └── login.tsx
│   └── private/
│       ├── dashboard/
│       │   └── index.tsx
│       └── content/
│           └── topics/
│               └── $topicId.tsx
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── login-form.test.tsx
│   │   ├── hooks/
│   │   ├── server-functions/
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── dashboard-page.tsx
│   │   │   └── dashboard-page.test.tsx
│   │   ├── hooks/
│   │   └── index.ts
│   └── content/
│       ├── components/
│       ├── hooks/
│       ├── schema.ts
│       └── index.ts
├── components/
│   ├── app-layout.tsx
│   ├── app-navbar.tsx
│   └── app-sidebar.tsx
├── adapters/
├── hooks/
├── providers/
│   └── __tests__/
├── lib/
├── types/
└── mock/
    ├── factories/
    ├── handlers/
    └── __tests__/
```

`apps/web/src/components/` contains app-wide composition only. Shared UI, forms, icons, and icon
wrappers come from `packages/ui`; feature-specific composition belongs under `features/<feature>`.

## Mobile Structure

```text
apps/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── explore.tsx
│   │   └── _layout.tsx
│   └── _layout.tsx
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── schema.ts
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── content/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.ts
│   ├── components/
│   ├── adapters/
│   ├── hooks/
│   ├── providers/
│   ├── lib/
│   └── types/
└── e2e/
```

- Keep router files focused on route composition and loading.
- Keep feature components, schemas, and feature hooks inside `features/<feature>`.
- Keep app-level components limited to app-wide composition such as layouts, navigation, shells, and
  app-specific branding.
- Use platform-specific code only where web and native behavior genuinely differ.
- Import shared UI and forms from `packages/ui`.

## Aspiron Examples

Use these as concrete vocabulary when the product is Aspiron-like, not as a mandatory checklist for
every project.

- Server domains: `auth`, `users`, `content`, `assessment`, `learning`, `community`, `live-session`,
  `notification`, `insights`, and `rbac`.
- Web/mobile features: `auth`, `dashboard`, `content-dashboard`, `topics-page`, `topic-detail`,
  `practice-tests`, `recall-insights`, `notes-manager`, `live-classes`, `create-question`, and
  `create-test`.

For a new domain or feature, copy the same nested shape, create barrel exports where the project uses
them, colocate focused tests, and add the corresponding API client/query boundary instead of placing
transport or persistence logic in UI components.
