---
name: maestro-mobile-e2e-test-writer
description: "Write Maestro mobile end-to-end regression tests for user-facing flows in generated Expo or React Native projects, including applicable failure paths and dedicated seeded test data."
---

# Maestro Mobile E2E Test Writer

Act as a QA proofreader in a generated Expo or React Native application after a stable user-facing
flow is implemented or changed. Write Maestro YAML flows that prove the journey a real mobile user
experiences. Do not apply this skill to this template repository's own source, portable skills, or
maintenance tasks.

## Automatic Triggers

Use this skill when:

- A generated mobile feature or flow is ready for regression coverage.
- A mobile bug fix changes user-visible behavior.
- The user explicitly requests Maestro, mobile E2E, device-flow, or regression tests.

Do not use it for template maintenance, unit or API-only work, cosmetic-only changes, unstable flows,
or screenshot-only regression.

## Workflow

1. Inspect the implementation, app guidance, navigation, platform differences, existing Maestro
   configuration, flow directory, runner package, fixtures, seed commands, and device prerequisites.
   Preserve the project's existing runner lifecycle, including service startup, readiness polling,
   platform selection, and child-process cleanup.
2. Find matching flows and extend them before creating duplicates. Reconstruct entry points, actions,
   state branches, visible success criteria, and failure modes from the implementation.
3. Inventory every reachable branch. Write one independently runnable flow per user intent and cover
   every applicable happy, alternate, validation, empty, loading, edge, permission, retry, timeout,
   dependency-error, conflict, recovery, and regression path. Record unsupported or environment-
   blocked branches explicitly instead of silently omitting them.
4. Seed deterministic synthetic records specifically for testing when pre-existing data is required.
   Keep seeds separate from development/demo data, repeatable and safe to rerun, and document their
   identifiers and reset/cleanup behavior. Generate unique values only for records the flow creates or
   mutates.
5. Use visible text and accessible semantics for labels, headings, and actions. Use `testID` or
   platform selectors only when no stable user-facing selector exists. Prefer Maestro's built-in
   polling and state assertions; never add arbitrary sleeps or coordinate taps.
6. Parameterize iOS and Android only where the app or deep link differs. Keep app launch, deep-link,
   login, seed, cleanup, and failure handling explicit and platform-safe.
   Run the package's existing platform commands when available, such as the combined, iOS-only, and
   Android-only scripts, rather than invoking an unrelated runner.
7. For a reference app with the established Todos implementation, retain independent navigation-smoke
   and Todos CRUD coverage. The CRUD flow should use the existing filter/create control IDs only where
   labels are unavailable: `todos-create-user-id`, `todos-create-title`, `todos-create-submit`, and
   `todos-filter-user-id`; use visible `Todos`, `Delete`, and item text for user-facing assertions.
8. Review the completed flows against `references/mobile-journey-checklist.md` and report covered
   branches, seeded data, device/tooling prerequisites, and blocked limitations.

Read `references/mobile-journey-checklist.md` before authoring flows. Use
`examples/todos-flow-evaluation.md` as a quality rubric when no runnable mobile project is available.
