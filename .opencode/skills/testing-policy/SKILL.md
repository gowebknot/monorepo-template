---
name: testing-policy
description: "Required when adding, editing, reviewing, or troubleshooting tests in any package or application. Define focused success and rejection coverage, follow the repository's actual test runner, framework, fixtures, and harnesses, isolate external systems with deterministic mocks, and verify validation, errors, state transitions, authorization, parsing, and integration boundaries without unsafe or uncontrolled side effects."
---

# Testing Policy

Write tests that prove behavior and remain deterministic, focused, and maintainable.

## Test Scope

- Add tests close to the owning package, application, or module using its established naming and
  placement conventions.
- Cover both successful and rejected behavior.
- Add validation, boundary, empty-state, duplicate, timeout, dependency-failure, authorization, and
  state-transition cases when they apply to the behavior under test.
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
- Report environment-dependent or untestable behavior instead of replacing it with a misleading test.
