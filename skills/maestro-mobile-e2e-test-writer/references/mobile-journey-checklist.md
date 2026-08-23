# Maestro Mobile Journey Checklist

Use this checklist after inspecting the implementation and before presenting a flow.

## Journey and Existing Coverage

- Record the entry point: app launch, deep link, notification, or authenticated route.
- Record every tap, text input, keyboard action, scroll, back action, permission prompt, and state
  transition.
- Read app guidance, neighboring flows, test IDs, seed commands, fixtures, and platform configuration.
- Extend a matching flow before creating a duplicate. Keep one user intent per flow file.
- Preserve the existing runner's service startup, port-readiness polling, platform mapping, and
  guaranteed child-process teardown.
- For the repository's reference Todos implementation, retain separate navigation-smoke and Todos CRUD
  flows. Use `todos-create-user-id`, `todos-create-title`, `todos-create-submit`, and
  `todos-filter-user-id` only for unlabeled inputs; assert headings, buttons, and item results by visible
  text.

## Dedicated Test Data

- Seed stable synthetic records specifically for tests when a pre-existing state is required.
- Include fixtures for populated, empty, ownership, permission, duplicate, boundary, and dependency
  error states when the app exposes them.
- Keep seeds isolated from demo/development data and safe to rerun. Document identifiers, reset, and
  cleanup behavior.
- Use generated per-run values only for records created or mutated by the flow.
- Do not depend on data left by another flow or silently replace a missing seed with weaker assertions.

## Complete Applicable Coverage

Create separate flows when a branch can fail independently. Account for every reachable applicable:

- Successful and alternate valid journey.
- Required, malformed, boundary, duplicate, conflicting, and rejected input.
- First-use, empty, loading, maximum-data, retry, timeout, offline, and dependency-error state.
- Signed-out, wrong-role, expired-session, wrong-owner, or other permission state.
- Recovery and the original regression scenario.

Mark a branch as a limitation when the product does not expose it or the required device, fixture,
service, or platform cannot execute it. Do not invent behavior or call happy-path coverage complete
while reachable negative paths remain unaccounted for.

## Reliable Maestro Flows

- Prefer visible text and accessibility semantics for user-facing controls and results.
- Use `testID` only when no stable visible selector exists; avoid coordinates and brittle hierarchy.
- Use Maestro's polling assertions and meaningful state checks. Never use arbitrary sleeps.
- Make each flow independently runnable, isolate its data, and clean up records it creates.
- Verify the meaningful visible effect and the prevented side effect after rejection or failure.
- Run applicable iOS and Android variants and document platform-specific differences.

## Handoff Review

- Every reachable branch has a flow or an explicit limitation.
- Seed setup and generated mutation data are described and deterministic.
- Flows are independent, repeatable, and safe to run in any order.
- Device, Expo Go, app ID, deep-link, server, and CLI prerequisites are documented.
- The report names manual-only, unstable, external, or environment-blocked coverage.
- Existing package commands for both platforms were used or their environment blockers are recorded.
