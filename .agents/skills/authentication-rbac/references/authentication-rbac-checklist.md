# Authentication/RBAC Review Checklist

Use this reference after reading the main skill. It is a planning and review aid, not a substitute
for the app's contracts or local `AGENTS.md` rules.

## Contract map

- Identity source and trust boundary are named.
- Session creation, storage, renewal, expiry, revocation, and logout behavior are documented.
- Roles, permissions, inheritance, tenant scope, and ownership rules have one authoritative source.
- Private operations identify their server-side authorization check and safe error shape.
- Client-visible user data excludes secrets, session tokens, password material, and internal policy data.

## Route and UI map

- Public, authenticated, and role/permission-protected route groups are listed.
- Each route group maps to a feature owner and an app-shell/layout owner.
- Signed-out users go to login with a safe in-app return location.
- Signed-in but unauthorized users receive forbidden/unauthorized UX without leaking resource data.
- Buttons and links are conditional UX only; server checks remain mandatory.

## Branch inventory

Record one test ID for every applicable branch:

- valid session and valid role/permission
- missing, expired, revoked, or malformed session
- auth lookup/network failure
- invalid credentials and logout
- wrong role and missing permission
- wrong owner, tenant, or resource scope
- malformed or conflicting role/permission data
- unsafe return URL
- repeated request, retry, and cache invalidation
- rejected request performs no protected read, write, or external effect

If a branch does not apply, record why in the active checklist rather than silently omitting it.

## Secure implementation review

- Authorization happens before protected data access and side effects.
- Client-provided roles, permissions, ownership, and tenant identifiers are not trusted.
- Missing or unverifiable policy data fails closed.
- Error responses are stable and do not reveal secrets, tokens, private records, or policy internals.
- Tests use local deterministic mocks and synthetic fixtures only.
