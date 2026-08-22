# AGENTS.md

## Purpose

`playwright-tests` owns browser-based regression tests for the generated web reference app.

## Rules

- Test user journeys through accessible, user-facing interactions.
- Keep each test independent and use Playwright auto-waiting and web-first assertions.
- Never add arbitrary waits, brittle CSS/XPath selectors, live third-party calls, or shared mutable test state.
- Extend an existing journey spec before creating duplicate coverage.
- Keep this package separate from application runtime code and API/unit tests.

## Validation

Run from the repository root:

```sh
pnpm --filter playwright-tests install:browsers
pnpm --filter playwright-tests test
pnpm --filter playwright-tests lint
```
