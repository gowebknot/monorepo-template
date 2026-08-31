---
name: e2e-regression-test-writer
description: "Plan and write Playwright end-to-end coverage for user-facing generated application features, flows, and failure states. Engage only when a user-facing web flow's observable behavior changes (route, navigation, form behavior, validation, authorization, redirect, success or error state) or when editing any file under apps/playwright/**. Do not use for component-internal edits that change no flow behavior, behavior-neutral refactors, dependency or configuration changes, documentation, light-tier changes, unit tests, API-only or backend-only changes with no UI surface, unstable or mid-review flows, or visual/screenshot regression."
---

# E2E Regression Test Writer

Act as a QA design partner while a user-facing flow is planned and a QA proofreader after it is
implemented or changed. Inventory the journey and its independent failure branches before architecture
and implementation are finalized, then write Playwright tests that prove the real user experience, not
the internal implementation. Do not apply this skill to the template repository's own source,
scaffolding, portable skills, or maintenance tasks. The one exception is the template's own
`apps/playwright` reference suite: when you edit those example tests, apply this skill's authoring
rules to them.

## Automatic Triggers

This skill is path-gated: editing any file under `apps/playwright/**` requires invoking it. Outside
that path, engage only when a user-facing web flow's observable behavior actually changes — not for
component-internal edits, behavior-neutral refactors, dependency or configuration changes,
documentation, or light-tier changes. A change that a unit or integration test already covers does
not need this skill.

Use this skill in a generated application project when:

- A newly implemented feature or user-facing flow is ready for regression coverage, such as a form,
  page, wizard, checkout, authentication flow, or settings panel.
- A bug fix changes user-visible behavior and should lock in the corrected journey.
- An existing flow changes through a DOM refactor, validation rule, permission tier, redirect, or
  success state.
- The user explicitly requests E2E tests, Playwright tests, regression tests, or tests for a flow.

Do not use this skill for template-repository maintenance or source changes, component-internal
edits that change no route, navigation, form behavior, validation, permission, or success/error
state, CSS-only or copy-only changes, behavior-neutral refactors, dependency or configuration
changes, documentation, light-tier changes, backend-only or unit-testable work with no UI surface,
unstable flows still awaiting design or product review, or visual and screenshot-diff regression
testing.

## Workflow

1. Inspect the product request, roadmap, implementation if present, user-visible behavior, and project
   guidance before deciding the test boundary. During planning, produce the branch inventory even when
   the implementation does not exist yet.
2. Find the existing Playwright configuration, E2E directory, fixtures, authentication helpers, test
   data setup, and matching `test.describe` blocks. Extend or update existing coverage instead of
   creating a parallel duplicate.
3. Reconstruct the actual entry points, actions, branches, success criteria, and failure modes.
4. Inventory every reachable branch before writing tests. Design independently runnable tests around
   one user intent per test and cover every applicable happy, alternate, validation, empty, loading,
   edge, permission, retry, timeout, dependency-error, conflict, recovery, and regression path. If a
   branch cannot be executed or the product does not support it, record that limitation explicitly.
5. Seed deterministic records specifically for testing when a path needs pre-existing data. Keep test
   seeds isolated from development or demo data, repeatable and safe to rerun, and use generated
   per-run values only for records created or mutated by the test.
6. Write tests with accessible user-facing locators, Playwright auto-waiting, isolated data, and
   web-first assertions. Never add arbitrary time delays or assert private implementation details.
7. Review the completed tests against `references/journey-checklist.md`.
8. Summarize the covered journeys, edge cases, and any paths blocked by missing data, external
   dependencies, unstable behavior, or manual-only verification.

Read `references/journey-checklist.md` before authoring tests. Use
`examples/login-flow-evaluation.md` as a quality rubric when no runnable Playwright project is
available yet.
