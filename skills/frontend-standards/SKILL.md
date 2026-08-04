---
name: frontend-standards
description: "Use when implementing, reviewing, refactoring, or debugging frontend routes, components, forms, tables, loading and error states, environment configuration, API calls, query state, accessibility, responsive behavior, or component-library usage. Follow the repository's React, router, styling, validation, query, and package conventions while keeping UI state, server state, URL state, and form state clearly separated."
---

# Frontend Standards

Build frontend behavior around clear state ownership, accessible interactions, shared contracts, and
predictable loading and error behavior.

## Before Editing

1. Read the app or package `AGENTS.md`, package scripts, route conventions, and existing neighboring
   components.
2. Identify whether each value belongs to server state, URL state, form state, local UI state, or a
   derived render value.
3. Locate existing design-system components, shared schemas, API services, query hooks, and test
   utilities before creating replacements.

## UI Boundaries

- Keep route composition, data loading, rendering, and reusable UI responsibilities distinct.
- Use shared API contracts and client/query boundaries instead of defining duplicate request types or
  direct transport calls in components.
- Keep server state in the repository's query or loader layer; do not mirror it into effects or local
  state without a clear reason.
- Keep form validation aligned with the authoritative contract and show useful field-level errors.
- Keep environment access behind the repository's environment module.
- Use existing component-library primitives and styling tokens before adding one-off equivalents.

## UX and Accessibility

- Handle loading, empty, success, validation, retry, and error states deliberately.
- Prefer semantic elements, accessible names, keyboard support, focus management, and meaningful
  status announcements.
- Preserve responsive behavior across supported viewport sizes and avoid hiding essential actions.
- Keep JSX readable; use `jsx-component-extraction` for complex render trees.
- Follow `react-19` for effects, actions, transitions, optimistic UI, and memoization decisions.

## Verification

- Test user-visible behavior through accessible interactions rather than implementation details.
- Run focused tests, typecheck, lint, formatting, and affected package checks.
- Verify API consumers use the intended query or client boundary and do not duplicate contracts.
- Keep each file under 300 lines and each component or module focused on one cohesive responsibility.
