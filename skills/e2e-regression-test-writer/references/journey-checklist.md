# Playwright Journey Checklist

Use this checklist after inspecting the implementation and before presenting a test file.

## 1. Reconstruct the Journey

Record the behavior from the implementation rather than guessing:

- **Entry points:** direct URL, navigation link, button, deep link, redirect, or authenticated entry.
- **Actions:** every click, input, keyboard action, navigation, and state-dependent wait.
- **Branches:** signed-in and signed-out states, roles, validation failures, empty data, permissions,
  retries, and dependency failures that the flow actually supports.
- **Success criteria:** visible confirmation, URL, updated list, persisted item, changed count, or
  other result a user can observe.
- **Failure modes:** invalid input, missing required values, unavailable data, unauthorized access,
  network failure, timeout, race condition, and recovery behavior where applicable.

If the behavior is unclear, inspect the implementation, route, API contract, fixtures, or existing
test before asserting it. Do not invent a user-visible result.

## 2. Inspect Existing Coverage First

Before creating a file:

1. Locate the project's Playwright config and its established test directory.
2. Read neighboring specs, fixtures, authentication helpers, and test-data setup.
3. Search for a matching `test.describe`, route, feature name, or user journey.
4. Extend or update the matching spec when coverage already exists.
5. Create a new spec only when the journey is not already covered, using the project's naming and
   placement convention.

Keep setup explicit and minimal. Use fixtures, API setup, or a test database to isolate each test;
never depend on another test’s mutations or execution order.

## 3. Design Separate User Stories

Give each test one clear user intent and a descriptive name, for example:

```ts
test("user can reset a password with a valid email and sees confirmation", async ({
  page
}) => {
  // One complete user intent.
});
```

Use `test.describe()` for one feature or journey and `test.beforeEach` only for shared setup that is
still explicit. Use `test.step()` for meaningful sub-actions so failures explain the user path.

Create separate tests when a branch could fail independently. Cover the following when relevant:

- Primary successful journey.
- Alternate valid input or interaction path.
- Required-field, malformed-input, and boundary validation.
- Empty, first-use, maximum-data, loading, retry, timeout, and dependency-error states.
- Signed-out, wrong-role, expired-session, wrong-owner, or other permission states.
- A regression case that reproduces the original bug scenario.

Do not combine unrelated branches into a single mega-test. Do not add speculative cases for behavior
the product does not expose.

## 4. Write Reliable Playwright Tests

Prefer locators in this order:

1. `getByRole` with an accessible name.
2. `getByLabel`, `getByPlaceholder`, or another semantic user-facing locator.
3. `getByText` when the text is stable and uniquely identifies the user-visible result.
4. `getByTestId` only when no semantic locator can represent the target; add the test ID to the
   component when necessary.

Avoid CSS selectors tied to classes or DOM structure, XPath, implementation-only state, and private
API calls as the primary proof of a user journey.

Rely on Playwright auto-waiting and web-first assertions such as `toBeVisible`, `toHaveText`,
`toHaveURL`, `toBeEnabled`, and `toBeDisabled`. Wait for a specific UI state or intentional network
response when needed. Never use `page.waitForTimeout()` or another arbitrary sleep.

Assert what the user observes and verify the meaningful effect where applicable: confirmation text,
redirect, updated content, changed status, persisted item, or prevented side effect after rejection.
Every test needs at least one assertion that would fail if the feature regressed.

## 5. Review Before Handoff

- Every major journey touched by the change has coverage or an explicit limitation.
- Test names read as user stories and failures are understandable in CI.
- Tests can run independently, in parallel, and in any order.
- Setup does not rely on leftover state, live third-party services, or uncontrolled requests.
- Selectors survive minor styling and markup changes.
- There are no arbitrary waits or timing assumptions.
- Success, validation, error, empty, and permission behavior is covered where applicable.
- Regression-specific behavior is covered when the change fixes a bug.
- Assertions verify user-visible behavior rather than implementation details.
- The file follows the project's existing directory, fixture, config, and naming conventions.
- The final report identifies missing fixtures, external dependencies, unstable flows, or manual-only
  visual checks instead of hiding them.

If the flow is still unstable or awaiting design approval, do not lock it into regression coverage;
report that limitation and wait for a stable behavior definition.
