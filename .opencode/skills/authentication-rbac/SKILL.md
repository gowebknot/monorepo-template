---
name: authentication-rbac
description: "Use when designing, implementing, reviewing, or testing authentication, protected routes, sessions, roles, permissions, ownership rules, or authorization boundaries across server, web, and mobile applications."
---

# Authentication and RBAC

Use this skill for authentication or authorization work, including sessions, protected routes,
roles, permissions, ownership rules, access-denied UX, or security tests.

## Establish the boundary first

1. Read the nearest `AGENTS.md`, existing auth implementation, contracts, environment rules, and
   tests before editing.
2. Map the user journey and route-group-to-feature ownership before adding a route. Route modules
   compose the owning feature; they do not become the only owner of auth or authorization behavior.
3. Identify the identity source, session transport, protected resources, roles, permissions, and
   failure states. Record unsupported provider or platform behavior instead of inventing it.
4. Load the repository's test-first, security, backend, frontend, React, contract, API-flow, and
   E2E skills whenever their boundaries apply.

## Authentication flow

- Keep authentication state in the established auth provider/context or server session boundary.
- Model loading, authenticated, signed-out, invalid-session, expired-session, network-failure, and
  logout states explicitly.
- On a protected web route, redirect unauthenticated users to login with the current location as a
  validated in-app return value. Never accept arbitrary external redirect destinations.
- Re-throw intentional router redirects; treat session lookup failures as authentication failures
  and fail closed according to the app's documented recovery behavior.
- Pass hook/context-derived auth state into the router through its supported context mechanism; do
  not call React hooks from route loaders or other non-component code.
- Preserve the current repository provider scope. Do not add OAuth, email delivery, or provider
  environment variables unless the task explicitly expands that boundary.

## Authorization and RBAC

- Treat a route guard as a navigation/UI convenience, never as a data authorization boundary.
  Every private server function, controller, server action, API route, and data access operation
  must authorize the request independently before reading or mutating protected data.
- Keep authorization decisions close to the protected use case and before persistence or external
  side effects. Prefer a small policy function or service over duplicated component checks.
- Define roles and permissions centrally. Make role checks explicit (one role, any role, or all
  roles) and permission checks explicit (one, any, or all). Document inheritance and precedence.
- Check resource ownership and tenant scope in addition to roles and permissions. Never trust an
  identifier, role, or permission supplied by the client.
- Fail closed for missing, malformed, stale, or unverifiable identity and authorization data. Return
  stable safe errors without exposing secrets, tokens, policy internals, or private records.
- Give signed-in users lacking access a forbidden/unauthorized experience; use login redirects only
  for users without a valid session. Preserve a return location only when it is in-app and safe.
- Use component-level guards only to hide or explain unavailable actions. They must not replace the
  server check or act as a security mechanism.

## Platform adaptations

- TanStack Router: use `beforeLoad` for protected navigation and router context for auth state;
  throw redirects rather than imperatively navigating during route loading.
- NestJS/API: keep transport handlers thin, authenticate at the request boundary, delegate to an
  authorization-aware use case, and keep Better Auth/infrastructure construction out of controllers.
- Next.js: distinguish server and client components; enforce private data access on the server and
  use middleware/layout checks only as complementary navigation behavior.
- Expo Router and React Navigation: use layouts or navigation boundaries for UX gating, but repeat
  authorization in the API/server boundary. Do not assume browser cookie or chunking semantics.
- Shared entities, API clients, and query hooks must consume authoritative auth/authorization
  contracts rather than redefining user, role, permission, or error shapes locally.

## Testing requirements

Plan one exact case for each reachable branch: valid session, signed-out access, session-check
failure, login failure, logout, expired session, allowed role, wrong role, allowed permission,
missing permission, wrong owner/tenant, malformed identity, unsafe return URL, and server-side bypass
attempts where applicable.

- Use synthetic users, sessions, roles, permissions, tokens, and resource identifiers.
- Assert both the decision and the absence of protected reads, writes, or external effects after
  rejection.
- Mock identity providers, databases, email services, and network calls unless an explicitly
  authorized local integration owns them. Never log credentials, raw tokens, authorization headers,
  or private fixtures.
- Test user-visible behavior through accessible interactions in Playwright or Maestro. Keep unit
  and API tests at their owning boundaries with independent fixtures.
- Verify retry, logout, repeated request, cache invalidation, and fail-open/fail-closed behavior
  when those branches exist.

Read `references/authentication-rbac-checklist.md` for detailed planning and review prompts.
