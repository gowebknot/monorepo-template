---
name: code-quality
description: "Apply SOLID, DRY, cohesive module boundaries, and shallow control flow whenever writing, modifying, refactoring, generating, or reviewing code in this repository."
---

# Code Quality

Use this skill whenever writing, modifying, refactoring, generating, or reviewing code. These rules
apply across application, package, script, and test code, not only React or the examples below.

1. Preserve existing architecture and conventions before introducing new patterns.
2. Apply SOLID pragmatically: keep units focused, depend on stable abstractions only when they reduce coupling, and avoid broad interfaces or inheritance where simple composition is enough.
3. Apply DRY without over-abstracting: remove duplicated business logic, validation, and data-shaping code, but keep similar code separate when premature abstraction would obscure intent.
4. Keep code modular: expose small public APIs, isolate side effects, keep package boundaries clear, and avoid leaking private implementation details through exports.
5. Keep code scalable: design changes so new features can be added with localized edits, predictable naming, clear data flow, and minimal cross-module coupling.
6. Strictly prohibit relative imports in source files except barrel files such as `src/index.ts` and nested `index.ts` files. Every other source file, including tests and configuration code, must use project aliases or package-name imports; if resolution fails, fix the module configuration instead of adding a relative-import exception. The repository's staged relative-import check enforces this rule; it intentionally permits existing baseline violations so they can be migrated incrementally, but never add a new one.
7. Prefer the smallest correct implementation that satisfies the current requirement; do not add speculative frameworks, generic layers, or backward compatibility without a concrete need.
8. Prefer hash maps or lookup objects for finite keyed dispatch instead of `switch` statements or long `if/else` ladders; keep direct conditionals when they are clearer for compound predicates or control flow.
9. For CSS styling variants, create and use `cva` variants instead of local hash maps that select class names.
10. Validate code changes with the most focused available build, typecheck, lint, or test commands, and address failures before completing the task.

## Cohesive Modules and Ownership

- Before editing, identify each responsibility and its existing owner. Search for reusable business
  rules, validators, transformations, and components before adding another implementation.
- Give each file one cohesive responsibility and reason to change. Default to one substantial
  component per file, even with one consumer. Separate independent hooks, domain logic, data access,
  validation, and formatting from UI composition; place them beside the feature that owns them.
- Keep component-specific props and small private helpers with their owner when they serve only that
  responsibility. Put shared contracts with their authoritative schema or domain owner. Do not create
  catch-all `utils.ts` or `types.ts` files, or split every declaration into a file mechanically.
- Keep source files under 300 lines, but extract independent responsibilities before reaching that
  limit. A short file can still contain too many responsibilities; fewer files is not a quality goal.
- Keep orchestration separate from the operations it coordinates. Pass explicit inputs and narrow
  dependencies; avoid helpers that reach into unrelated mutable state or require large context bags.
- Apply all SOLID principles through the design: localize new variants behind cohesive functions or
  strategies, preserve caller-visible contracts when substituting implementations, expose only the
  operations a consumer needs, and isolate infrastructure behind suitable boundaries. Prefer
  composition; do not add interfaces or inheritance merely to label a design SOLID.
- Give duplicated business rules one authoritative implementation. Share code because it represents
  the same rule and should change together, not merely because two blocks look similar. Avoid generic
  helpers with growing flags or modes that couple unrelated behavior.

## Shallow Control Flow and Expressions

- Keep the main path readable from top to bottom. Use guard clauses and early returns for invalid,
  empty, and terminal states; avoid wrapping the main work in successive `if/else` blocks. Remove
  redundant `else` branches after an unconditional return or throw.
- Do not write nested ternary operators, including chained ternaries in an alternative branch. Use a
  single simple ternary for a two-way value choice; use a named function, explicit guards, or keyed
  lookup for more cases.
- Name complex boolean predicates and intermediate values. Avoid mixing several boolean operators,
  negations, optional accesses, fallbacks, assignments, and function calls in one dense expression.
  Preserve short-circuit behavior; do not precompute an expression that must only run conditionally.
- Keep loops and callbacks shallow. Use `continue` for rejected loop items, extract cohesive inner
  operations, and use indexed lookups when repeatedly scanning the same collection by key. Keep
  inherently nested traversal readable when the algorithm needs it; do not replace it with opaque
  chained array methods merely to reduce indentation.
- Split long transformation chains into named stages when the reader must mentally track several
  operations. Prefer a straightforward loop over a complicated `reduce` or nested `map`/`flatMap`
  callback. Keep simple transformations inline when they are immediately clear.
- Prefer readable `async`/`await` sequencing over nested promise callbacks when equivalent. Keep error
  handling and cleanup at the boundary that owns recovery or resource lifetime; extract independent
  operations instead of piling nested `try/catch` blocks into orchestration.
- Keep render trees shallow through meaningful component composition. Apply
  [JSX Component Extraction](../jsx-component-extraction/SKILL.md) for JSX-specific rules. Apply the
  same readability standard to nested configuration builders, object construction, and other DSLs.
- Review any third nested control-flow level as an extraction or simplification trigger. This is not
  permission to keep confusing code at lower depth. Retain necessary nesting only when its reason is
  clear in the review; do not flatten semantic DOM structure, inherent algorithms, or resource scopes
  solely to meet a depth target.
- Extract by responsibility, with meaningful names and explicit inputs/outputs. Do not merely move a
  deeply nested block into a vague helper or compress it into a one-liner. Preserve evaluation order,
  errors, loop exits, side effects, cleanup, transaction scope, and async sequencing during refactors.

## Keyed Dispatch

- Use a typed lookup object, record, or `Map` when one discrete key selects a value, component, or
  handler. Prefer this over repeated equality checks, `switch` statements, or `if/else` ladders.
- Store handler functions when choosing behavior; invoke only the selected handler. Do not execute
  every branch while constructing the map. Cover the supported keys and preserve explicit fallback
  or rejection behavior for unknown keys without unsafe casts or accidental inherited-key matches.
- Keep direct conditions for ranges, overlapping or ordered predicates, and genuine control flow.
  Do not force them into a hash map or build a generic dispatch framework for a simple decision.
- Preserve the CSS rule above: use `cva` for styling variants, not local class-name lookup maps.

## Completion Review

Before completing code changes, inspect the entire changed function, component, and file for mixed
responsibilities, duplicated rules, nesting, dense expressions, hidden side effects, and oversized
interfaces. Check adjacent code for existing owners and reusable implementations. Apply this review
even when tests pass and the file is short. Explain any necessary retained complexity and its concrete
reason; passing lint or loading this skill alone is not evidence of SOLID or DRY compliance.
