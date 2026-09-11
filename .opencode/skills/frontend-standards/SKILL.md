---
name: frontend-standards
description: "Use when implementing, reviewing, refactoring, or debugging frontend routes, components, Atomic Design composition, forms, tables, loading and error states, environment configuration, API calls, query state, accessibility, responsive behavior, or component-library usage. Follow the repository's React, router, styling, validation, query, and package conventions while keeping UI state, server state, URL state, and form state clearly separated."
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

## Atomic Design

Apply Atomic Design when building, extending, or reviewing web and mobile interfaces. Use the five
levels to reason about reusable parts and the assembled experience together, not as a mandatory
linear build sequence. The methodology comes from
[Brad Frost's Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/); the placement and data
boundaries below adapt it to this repository.

| Level     | Responsibility                                                                               | Example                                                      |
| --------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Atoms     | Small functional UI primitives using shared tokens and accessible platform behavior.         | Button, input, icon, label.                                  |
| Molecules | A small combination of primitives serving one interaction or display purpose.                | Labeled search control or field with an error message.       |
| Organisms | A distinct interface section composed of smaller units.                                      | Site header, product results section, account details panel. |
| Templates | Page-level layout and content structure expressed through slots or explicit props.           | Search layout with header, filters, and results regions.     |
| Pages     | Concrete screens that populate the structure with real content and connect feature behavior. | Search results screen using route input and query results.   |

- Before implementation, identify the existing primitives, small composites, sections, layout, and
  page composition needed by the request. Reuse or extend their owners before adding new components.
- Compose only the levels that add a meaningful responsibility. An organism may use atoms directly;
  a simple page does not need a new template wrapper. Refine parts against actual page needs instead
  of building a speculative component catalog.
- Keep domain ownership as the path rule: reusable feature-independent primitives and controls belong
  in `packages/ui`; app-wide shells and navigation belong in app-level `components/`; feature-specific
  composites and sections belong in `features/<feature>/components`. Place templates with their app
  or feature owner and keep route entry files thin. Follow
  [Domain-Driven App Structure](../domain-driven-app-structure/SKILL.md) when choosing paths.
- Use atomic levels to describe responsibility, not to require `atoms/`, `molecules/`, `organisms/`,
  `templates/`, and `pages/` folders or suffixes. Do not move product-specific components into shared
  UI solely because they fit an atomic category. Respect platform-specific primitives and package
  exports; never force web-only components into native screens for reuse.
- Keep shared primitives and reusable visual composites independent of feature imports, routing,
  and API clients. Pass explicit props, slots, and callbacks. Keep data loading, mutations, and domain
  decisions in the existing feature hooks, loaders, and application boundaries; pages connect those
  results to UI. Templates own layout, not another copy of fetching or business rules. Keep local
  interaction state with its owner and preserve the repository's form and query-state rules.
- Preserve the shallow-code and one-substantial-component-per-file rules through
  [JSX Component Extraction](../jsx-component-extraction/SKILL.md). Atomic composition does not justify
  deeply nested JSX, duplicated atoms, large prop bags, or unnecessary wrapper components. Atomic
  levels do not imply separate lazy chunks; use the meaningful boundaries described below.
- Verify parts in the assembled page with representative content, including long labels and relevant
  loading, empty, error, and success states. Check responsive layout, accessible interactions, and
  shared variants in context; feed failures back into the owning component rather than patching each
  page with a duplicate. Use the existing focused tests and UI checks for the changed behavior.

## UI Boundaries

- Keep route composition, data loading, rendering, and reusable UI responsibilities distinct.
- Treat lazy loading and code splitting as the default for frontend imports. Require an explicit
  performance or platform reason before keeping non-critical code in the initial bundle.
- Prefer lazy boundaries at routes, large feature entry points, rarely visited sections, and optional
  UI such as modals, drawers, editors, charts, maps, data grids, and client-only integrations.
- Keep the lazy boundary at the largest meaningful cohesive unit; do not split every tiny leaf or
  ubiquitous primitive when the extra request and loading state cost more than the deferred work.
- Keep normal imports for React and other runtime foundations, app bootstrap, providers, router setup,
  critical shell UI, global styles and initialization side effects, type-only imports, and targets
  whose bundler cannot provide useful deferred chunks. “It is convenient” is not sufficient justification.
- Use statically analyzable dynamic imports, stable lazy component declarations, and meaningful
  `Suspense` fallbacks and error boundaries. Prefetch only on clear user intent when it improves the
  expected interaction rather than eagerly loading the same code.
- For web targets, verify route and feature chunks are actually deferred. For Expo or React Native,
  apply lazy loading only when the target bundler provides useful runtime deferral; do not assume
  browser-style chunks.
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
- Require a meaningful consumer-provided `data-testid` on every rendered `@monorepo-template/ui` component and
  preserve it through wrappers; do not generate or hardcode IDs inside shared components.

## Verification

- Test user-visible behavior through accessible interactions rather than implementation details.
- Run focused tests, typecheck, lint, formatting, and affected package checks.
- Verify API consumers use the intended query or client boundary and do not duplicate contracts.
- Keep each file under 300 lines and each component or module focused on one cohesive responsibility.
