---
name: contract-validation
description: "Use when defining, changing, reviewing, or debugging runtime-validated contracts across application boundaries, including schemas, request and response payloads, route parameters, query parameters, form data, API-client parsing, serialized errors, and inferred types. Keep one authoritative contract source, preserve consumer compatibility, and verify accepted, rejected, malformed, and boundary shapes before implementation is considered complete."
---

# Contract Validation

Keep data crossing a process, package, transport, persistence, or UI boundary explicit and validated.

## Ownership

- Locate the existing authoritative schema or contract before creating a new one.
- Define runtime validation and inferred static types together when the repository's schema library
  supports both.
- Keep shared request, response, error, enum, identifier, and parameter contracts in their owning
  shared package rather than duplicating them in consumers.
- Reuse primitive schemas and compose larger contracts instead of repeating validation rules.
- Keep transport adapters, UI forms, persistence models, and domain models distinct when their shapes
  have different responsibilities.

## Changes

1. Identify every producer and consumer of the contract.
2. Record compatibility impact for added, removed, renamed, optional, and narrowed fields.
3. Update the authoritative schema and its public exports.
4. Update adapters and consumers without recreating the contract locally.
5. Validate both successful and rejected inputs at the boundary.
6. Check malformed responses, unknown keys, nullability, defaults, enum values, and boundary lengths
   when they are relevant to the contract.

## API Boundaries

- Parse untrusted input at the boundary before business logic runs.
- Validate outbound payloads when communicating with an external or independently deployed service.
- Parse inbound responses before exposing them to callers.
- Preserve structured error information without leaking secrets or internal implementation details.
- Keep route, query, form, and response parsing behavior aligned with the shared contract.

## Verification

- Search for duplicate handwritten types or schemas after the change.
- Confirm public barrels and package exports expose the intended contract.
- Run focused schema tests, affected package checks, and the repository's required validation.
- Use `test-first-workflow` to define accepted and rejected cases before editing.
