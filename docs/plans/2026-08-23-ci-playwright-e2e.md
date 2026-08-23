# CI Playwright E2E Validation

- Plan ID: PLAN-20260823-ci-playwright-e2e
- Status: `planned`
- Created: 2026-08-23
- Related checklist: [`docs/checklists/2026-08-22-create-playwright-app.md`](../checklists/2026-08-22-create-playwright-app.md)

## Problem

Playwright E2E tests start the web application and a browser, so running them for every commit
would make the local commit loop unnecessarily slow. The repository still needs an automated place
to run the existing user-flow regression suite.

## Planned Outcome

- Keep pre-commit focused on fast repository validation:
  - formatting
  - unit tests
  - linting
  - typechecking
  - builds
- Run Playwright E2E tests in CI through `pnpm e2e`.
- Do not add Playwright execution to pre-push hooks.
- Do not implement the CI workflow as part of this plan capture; implementation starts in a later task.

## Scope

- Add a CI job that installs dependencies, prepares the required browser, and runs `pnpm e2e`.
- Preserve the existing `apps/playwright` web-server configuration and accessible user-flow tests.
- Keep E2E failures visible as a separate CI status from local pre-commit validation.

## Out Of Scope

- Running Playwright from `.husky/pre-commit`.
- Running Playwright from a pre-push hook.
- Adding new product flows or changing existing E2E assertions.
- Adding screenshot or visual-regression testing.

## Success Criteria

- A CI job executes `pnpm e2e` against the existing Playwright suite.
- The CI job installs or uses the required Chromium browser deterministically.
- A failing E2E test fails CI without affecting the local pre-commit command design.
- The existing local pre-commit pipeline remains limited to formatting, unit tests, lint, typecheck,
  and build validation.

## Future Implementation Checklist

- [ ] Confirm the repository's CI provider and workflow conventions when CI is introduced.
- [ ] Add dependency installation and lockfile validation to the CI job.
- [ ] Install Playwright Chromium in the CI environment.
- [ ] Run `pnpm e2e` and publish its failure status.
- [ ] Validate the CI workflow with a successful run and a controlled failing-test run.
- [ ] Link the implementation checklist back to this plan.
