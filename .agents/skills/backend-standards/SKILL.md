---
name: backend-standards
description: "Use when implementing, reviewing, refactoring, or debugging backend services, modules, controllers, persistence, request validation, response serialization, authorization, transactions, background jobs, or observability. Preserve clear boundaries between transport, application logic, domain rules, and data access, keep side effects explicit, and follow the backend framework, database, testing, and package conventions actually used by the repository."
---

# Backend Standards

Build backend behavior with explicit boundaries, validated inputs, predictable errors, and focused
side effects.

## Before Editing

1. Read the affected app or package `AGENTS.md`, package scripts, and existing neighboring modules.
2. Identify the transport entry point, application use case, domain rules, persistence boundary, and
   external systems involved.
3. Locate shared contracts, authorization rules, migrations, repositories, and existing tests before
   introducing a parallel implementation.

## Boundaries

- Keep controllers or route handlers focused on transport concerns: parsing, authentication context,
  delegation, and response mapping.
- Keep application services focused on use cases and orchestration.
- Keep domain rules independent from HTTP, database drivers, and framework decorators where practical.
- Keep repositories and data-access adapters focused on persistence operations.
- Keep external clients behind explicit adapters with timeout, retry, error, and observability policy.
- Do not place business rules in controllers, database models, or request DTOs merely for convenience.

## Reliability and Security

- Validate request parameters, query values, bodies, headers, and external responses at boundaries.
- Enforce authentication and authorization before protected work or data access.
- Use transactions for multi-step writes that must remain atomic.
- Make retries and background jobs idempotent when duplicate delivery is possible.
- Avoid logging secrets, tokens, credentials, raw sensitive payloads, or unbounded user input.
- Return stable structured errors and map internal failures without exposing implementation details.

## Verification

- Add focused unit tests for domain and application behavior.
- Add integration tests for persistence, middleware, authorization, serialization, and external adapters
  when those boundaries changed.
- Run the affected package's build, typecheck, lint, and test commands.
- Keep each file under 300 lines and each module focused on one cohesive responsibility.
