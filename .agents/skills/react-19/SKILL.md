---
name: react-19
description: "Required when writing or reviewing React 19 components, hooks, forms, actions, transitions, optimistic updates, refs, or server-state UI in any application or package. Prefer React 19 patterns, derived render values, event-driven updates, minimal effects, compiler-friendly components, and evidence-based memoization. Use for component architecture, state management, data fetching, form behavior, pending states, and performance-related React changes."
---

# React 19

Use React 19 patterns deliberately and avoid legacy hook-heavy implementations.

## State and Effects

- Compute values derived from props or state during render.
- Use event handlers for work caused by user actions.
- Use `useEffect` only to synchronize with an external system such as a browser API, subscription,
  timer, imperative widget, analytics integration, or non-React store.
- Do not use effects to derive state, mirror props, fetch server state, or respond to user events.
- Keep unavoidable side effects isolated, named, and justified.

## React 19 Patterns

- Use actions, transitions, pending states, and `useOptimistic` where they fit the existing data flow.
- Use `startTransition` for non-urgent UI updates and `useDeferredValue` for expensive responsive
  filtering or search when appropriate.
- Use `useEffectEvent` or the current React equivalent for event-like logic that must read current
  values without resubscribing an effect.
- Use the repository's established form and server-state libraries instead of replacing them with
  ad-hoc effects.

## Lazy Loading

- Make lazy loading the default for non-critical React code. Prefer `lazy(() => import("..."))` or
  the framework's route-level equivalent for routes, large features, rare views, optional overlays,
  and heavy widgets.
- Declare lazy components at module scope, never inside a render function. Keep dynamic import paths
  static enough for the bundler to analyze and split into predictable chunks.
- Put `Suspense` fallbacks at meaningful route or feature boundaries and provide an error boundary
  that can explain, retry, or recover from a failed chunk load.
- Keep normal imports for React/runtime foundations, bootstrap and providers, router setup, critical
  shell UI, tiny ubiquitous primitives, global side effects, type-only imports, and platforms where
  the bundler does not produce useful deferred chunks. Do not split code merely to satisfy a rule.
- Measure or inspect the generated chunks when the target toolchain supports it. Prefetch only when
  navigation intent is clear and the extra transfer is likely to improve the interaction.

## Memoization and Components

- Do not add `useMemo`, `useCallback`, or `memo` by habit.
- Add manual memoization only for a measured performance issue, required referential stability, or a
  documented existing contract.
- Prefer pure components, clear boundaries, simple data flow, and React Compiler-friendly code.
- Keep component responsibilities focused and extract complex JSX using `jsx-component-extraction`.

## Verification

- Every new effect has a concrete external synchronization reason.
- Derived values are not stored as redundant state.
- Server state uses the repository's query or loader pattern.
- Forms preserve shared validation and pending/error behavior.
- React tests cover user-visible states and interactions where behavior changed.
