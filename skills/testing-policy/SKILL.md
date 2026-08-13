---
name: testing-policy
description: "Required when adding, editing, reviewing, or troubleshooting tests in any package or application. Define focused success and rejection coverage, follow the repository's actual test runner, framework, fixtures, and harnesses, isolate external systems with deterministic mocks, and verify validation, errors, state transitions, authorization, parsing, and integration boundaries without unsafe or uncontrolled side effects."
---

# Testing Policy

Write tests that prove behavior and remain deterministic, focused, and maintainable.

## Detailed Case Planning

- Use plain English for task names, case names, inputs, steps, expected results, effects, reasons, and
  questions. If a technical term is unavoidable, explain it in simple words the first time it appears.
- One case covers one exact situation. If two inputs, rules, branches, states, or expected results can
  pass or fail separately, give them separate case IDs.
- A broad note such as "test validation," "test errors," or "cover edge cases" is not a complete test
  plan. List the exact values, action, and expected checks for every situation.
- List every interaction step needed to reach the result while naming the one main behavior being
  checked. Do not split one behavior merely because it needs several steps.
- Link every case to one smallest task item and to the request, schema, validator, existing test, or
  other source that defines the expected behavior.
- Use these fields for every case: `Small task:`, `Source:`, `Test place:`, `Starting state:`,
  `Exact input or fixture:`, `Interaction steps:`, `Main behavior:`, `Expected result:`,
  `Must change:`, `Must not happen:`, `Planned command:`, `Expected result before the code change:`,
  `First observed run:`, and `Passing rerun:`.
- Similar situations may use one table-based test, but every row must keep its own test ID, exact
  input, and expected result.
- Test values together when one value changes another value's result, when check order matters, or
  when several errors must be returned together. Do not test every possible mix of unrelated values.
- If the expected behavior is not defined, search the repository. If the answer remains unknown, ask
  the user and block the affected work instead of guessing.
- If trusted sources disagree, check which source wins under repository guidance. If no rule answers
  that question, record the conflict, ask the user, and block the affected cases and implementation.
- During planning, record the Planned command and Expected result before the code change. Record the
  First observed run and Passing rerun only after each command actually runs.
- Do not invent test results before running the command.

## Exact Test Case Rules

Every case must contain these fields: `Small task:`, `Source:`, `Test place:`, `Starting state:`,
`Exact input or fixture:`, `Interaction steps:`, `Main behavior:`, `Expected result:`, `Must change:`,
`Must not happen:`, `Planned command:`, `Expected result before the code change:`,
`First observed run:`, and `Passing rerun:`.

During planning, fill in `Planned command:` and `Expected result before the code change:`. Fill in
`First observed run:` only after its command has run. Fill in `Passing rerun:` only after its command
has run. Do not invent test results before running the command.

If trusted sources disagree, check which source wins under repository guidance. If no rule answers
that question, record the conflict, ask the user, and block the affected cases and implementation.

If no trusted source defines the expected behavior, search the repository. If the answer is still
unknown, record the open question, ask the user, and block the affected work until it is resolved.

## Test Scope

- Add tests close to the owning package, application, or module using its established naming and
  placement conventions.
- Cover both successful and rejected behavior.
- List each separate validation rule, exact limit, empty state, duplicate, timeout, dependency
  failure, permission decision, and state change when it applies. Do not hide them inside one broad
  case.
- Test public contracts at their boundary and pure logic directly.
- Do not duplicate production schemas, constants, workflow rules, or fixtures when reusable exports
  already exist.

## Isolation

- Use the actual test runner and framework configured by the owning package.
- Isolate databases, network services, clocks, randomness, filesystem state, and external APIs with
  deterministic fixtures or mocks when the test does not explicitly require integration coverage.
- For integration tests, use the repository's real application harness and assert the public boundary
  rather than reaching into private implementation details.
- Never send uncontrolled requests to external systems or depend on live third-party services in
  ordinary tests.

## Frontend and API Tests

- Test API request and response parsing, including malformed or rejected payloads.
- Test frontend loading, empty, success, validation, retry, and error states when UI behavior depends
  on server state.
- Prefer accessible user-facing assertions and real interaction utilities over implementation details.
- Test query cache, invalidation, and mutation behavior through the owning query-client boundary.

## Backend Tests

- Unit-test pure functions and isolated providers without unnecessary application bootstrapping.
- Use the configured application test harness for HTTP, middleware, validation, authorization, and
  serialization integration tests.
- Keep fixtures typed, deterministic, and limited to the entities or aggregate required by the case.

## Verification

- Run the focused test first, then the affected package test command and required type/lint checks.
- Do not skip, disable, weaken, or delete meaningful assertions to make a test pass.
- Record durable cases as `TEST-<AREA>-<NUMBER>` when checklist tracking is required.
- Record the First observed run and Passing rerun against the matching case IDs rather than relying
  only on a whole-suite result.
- Report environment-dependent or untestable behavior instead of replacing it with a misleading test.
