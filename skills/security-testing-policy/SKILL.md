---
name: security-testing-policy
description: "Use when designing, implementing, reviewing, or troubleshooting security tests, authorization checks, input validation, secret handling, dependency boundaries, sandboxed integrations, or tests that could contact external systems. Keep security validation deterministic, scoped, and authorized; use synthetic fixtures and controlled mocks; verify rejection and isolation behavior; and never create uncontrolled offensive traffic or expose sensitive data."
---

# Security Testing Policy

Verify security boundaries without turning ordinary development or test runs into uncontrolled
security activity.

## Scope and Authorization

- Test only code, fixtures, services, and targets explicitly owned or authorized by the repository's
  task and environment.
- Prefer pure functions, unit tests, local integration harnesses, containers, and synthetic targets.
- Never send scanning, exploit, credential-stuffing, fuzzing, or other offensive traffic to third-party
  or ambiguous targets.
- Require explicit human authorization and an isolated environment before any test needs live network
  behavior beyond a local controlled dependency.

## Security Cases

When applicable, cover:

- Unauthenticated, unauthorized, wrong-role, and cross-tenant or cross-resource access.
- Input validation, injection resistance, path traversal, unsafe redirects, and malformed payloads.
- Secret redaction, credential lifecycle, accidental data exposure, and safe error messages.
- Replay, duplicate delivery, idempotency, race, timeout, retry, and rate-limit behavior.
- Dependency failures, boundary failures, serialization mistakes, and fail-open versus fail-closed
  decisions.

## Test Design

- Use synthetic credentials, identifiers, payloads, and external-service responses.
- Mock scanners, proxies, queues, identity providers, external APIs, and other security-sensitive
  dependencies unless a controlled integration test explicitly requires them.
- Assert both the security decision and the absence of unsafe side effects.
- Keep tests deterministic, repeatable, and isolated from production data and network state.
- Do not log secrets, raw tokens, private keys, authorization headers, or sensitive fixtures.

## Verification

- Confirm the test proves the intended boundary rather than only an implementation detail.
- Run focused tests and the owning package's required checks.
- Review test fixtures and mocks for accidental real endpoints or credentials.
- Document any environment, authorization, or manual approval required for a test.
- Use `testing-policy` for general test structure and `test-first-workflow` before implementation.
