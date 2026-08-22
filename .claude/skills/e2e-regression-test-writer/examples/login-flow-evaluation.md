# Login Flow Evaluation Example

Use this example to evaluate the skill's output when a runnable Playwright project is unavailable.

## Sample Request

> The login page now supports email and password validation, displays an error for invalid
> credentials, redirects authenticated users to `/dashboard`, and fixed a bug where pressing Enter
> submitted the form twice. Write the Playwright regression tests.

## Required Output Checks

The generated plan or test files pass only when they:

- Identify the login page entry point and the redirect to `/dashboard`.
- Test valid credentials and visible authenticated success.
- Test missing or malformed fields with user-visible validation.
- Test invalid credentials with the correct visible error and no dashboard redirect.
- Reproduce the Enter-key double-submit regression and verify only one submission effect.
- Use the project's existing auth fixture and test-data setup if available.
- Search for and extend an existing login spec instead of creating a duplicate.
- Prefer roles, labels, and other accessible locators over CSS or XPath.
- Use web-first assertions and specific state or response waits instead of `page.waitForTimeout()`.
- Keep each user intent independently runnable and name tests as user stories.
- Report any missing auth fixture, API seed, or environment dependency instead of inventing one.

## Evaluation Boundary

This repository does not currently provide a Playwright app, config, fixtures, or E2E runner. Treat
this file as a rubric for a later app-specific evaluation, not as evidence that the generated tests
have executed successfully.
