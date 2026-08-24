---
name: code-quality
description: "Apply SOLID, DRY, modular, and scalable design principles whenever writing, modifying, refactoring, or generating code in this repository."
---

# Code Quality

Use this skill whenever writing, modifying, refactoring, or generating code.

1. Preserve existing architecture and conventions before introducing new patterns.
2. Apply SOLID pragmatically: keep units focused, depend on stable abstractions only when they reduce coupling, and avoid broad interfaces or inheritance where simple composition is enough.
3. Apply DRY without over-abstracting: remove duplicated business logic, validation, and data-shaping code, but keep similar code separate when premature abstraction would obscure intent.
4. Keep code modular: expose small public APIs, isolate side effects, keep package boundaries clear, and avoid leaking private implementation details through exports.
5. Keep code scalable: design changes so new features can be added with localized edits, predictable naming, clear data flow, and minimal cross-module coupling.
6. Use relative imports only in barrel files such as `src/index.ts` and nested `index.ts` files; all other source files should use package aliases or package-name imports.
7. Prefer the smallest correct implementation that satisfies the current requirement; do not add speculative frameworks, generic layers, or backward compatibility without a concrete need.
8. Prefer hash maps or lookup objects for finite keyed dispatch instead of `switch` statements or long `if/else` ladders; keep direct conditionals when they are clearer for compound predicates or control flow.
9. For CSS styling variants, create and use `cva` variants instead of local hash maps that select class names.
10. Validate code changes with the most focused available build, typecheck, lint, or test commands, and address failures before completing the task.
