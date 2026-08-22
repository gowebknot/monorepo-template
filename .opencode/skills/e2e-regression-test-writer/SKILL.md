---
name: e2e-regression-test-writer
description: 'Write Playwright end-to-end regression tests for user-facing features and flows in generated application projects when they are just implemented or modified. Use this whenever a generated app feature, UI flow, or bug fix changes user-visible behavior, even if the user does not explicitly ask for tests, as well as for explicit requests like "write e2e tests," "Playwright tests," or "regression tests" for a generated app. Do not use for template-repository maintenance, unit tests, API-only or backend-only changes with no UI surface, purely cosmetic changes, unstable or mid-review flows, or visual/screenshot regression.'
---

# E2E Regression Test Writer

Act as a QA proofreader in a generated application project after a user-facing flow is implemented or
changed. Write Playwright tests that prove the journey a real user experiences, not the internal
implementation. Do not apply this skill to the template repository's own source, scaffolding,
portable skills, or maintenance tasks.

## Automatic Triggers

Use this skill in a generated application project when:

- A newly implemented feature or user-facing flow is ready for regression coverage, such as a form,
  page, wizard, checkout, authentication flow, or settings panel.
- A bug fix changes user-visible behavior and should lock in the corrected journey.
- An existing flow changes through a DOM refactor, validation rule, permission tier, redirect, or
  success state.
- The user explicitly requests E2E tests, Playwright tests, regression tests, or tests for a flow.

Do not use this skill for template-repository maintenance or source changes, CSS-only or copy-only
changes, behavior-neutral refactors, dependency or configuration changes, backend-only or unit-testable
work with no UI surface, unstable flows still awaiting design or product review, or visual and
screenshot-diff regression testing.

## Workflow

1. Inspect the implementation, its user-visible behavior, and the project guidance before writing
   assertions.
2. Find the existing Playwright configuration, E2E directory, fixtures, authentication helpers, test
   data setup, and matching `test.describe` blocks. Extend or update existing coverage instead of
   creating a parallel duplicate.
3. Reconstruct the actual entry points, actions, branches, success criteria, and failure modes.
4. Design independently runnable tests around one user intent per test. Cover applicable happy,
   alternate, validation, empty, edge, permission, and regression-specific paths.
5. Write tests with accessible user-facing locators, Playwright auto-waiting, isolated data, and
   web-first assertions. Never add arbitrary time delays or assert private implementation details.
6. Review the completed tests against `references/journey-checklist.md`.
7. Summarize the covered journeys, edge cases, and any paths blocked by missing data, external
   dependencies, unstable behavior, or manual-only verification.

Read `references/journey-checklist.md` before authoring tests. Use
`examples/login-flow-evaluation.md` as a quality rubric when no runnable Playwright project is
available yet.
