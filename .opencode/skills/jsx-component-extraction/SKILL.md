---
name: jsx-component-extraction
description: "Use when writing, reviewing, or refactoring React JSX or TSX with deeply nested markup, repeated UI blocks, complex conditional branches, mapped content, nested forms, or logic-heavy render functions. Keep every file under 300 lines and each file focused on one cohesive responsibility. Extract meaningful subtrees into typed components while preserving behavior, accessibility, styling, state flow, component-library usage, and repository import boundaries."
---

# JSX Component Extraction

Keep React render trees readable and keep JSX focused on describing UI structure. Apply
[Code Quality](../code-quality/SKILL.md) for the shared module, duplication, and shallow-code policy.
Use the [Atomic Design guidance](../frontend-standards/SKILL.md#atomic-design) to choose meaningful
primitive, composite, section, layout, and page boundaries while preserving domain ownership.

## Extraction Rules

- Keep every source file under 300 lines. Split a file before it reaches that limit when the split
  produces clear, cohesive modules.
- Give each file one cohesive responsibility. Do not combine unrelated UI, data fetching, state
  management, validation, formatting, and orchestration responsibilities in one file.
- Inspect changed JSX or TSX for nested containers, repeated markup, mapped item content, nested
  cards or panels, forms, and complex conditional branches.
- Extract a meaningful subtree when nesting or local logic makes the parent difficult to scan.
- Default to one substantial component per file, even with one consumer. Put extracted rows, cards,
  panels, and forms in named files beside their owning feature. A single consumer is not a reason to
  accumulate substantial private components in the parent file.
- Keep component-specific props and tiny cohesive helpers local; separate independent hooks,
  transformations, and domain logic according to the shared code-quality policy.
- Define components at module scope, never inside another component's render function.
- Keep extracted components pure, typed, explicit about props, and focused on one responsibility.
- Do not extract tiny wrappers when the new boundary would reduce clarity.

## JSX Logic

- Prepare filtering, mapping inputs, branching decisions, formatting, derived labels, status values,
  and permission decisions before the returned JSX.
- Keep inline expressions to simple property access, direct event handlers, boolean toggles, and
  trivial interpolation.
- Do not use nested or chained ternaries. Use clear render-state branches or keyed component lookup
  as appropriate; keep hooks unconditional and before early returns.
- Keep mapped item JSX and conditional subpanels small by delegating meaningful UI to typed
  components. Avoid stacks of nested render callbacks and boolean branches. Do not hide complex JSX
  in local render helpers or anonymous functions just to shorten the returned expression.
- Preserve DOM nesting needed for semantics and layout. Extract components without adding wrapper
  elements, changing keys, or breaking state ownership merely to make the source look shallower.
- Preserve existing visual structure, behavior, accessibility attributes, styling, and library APIs.
- Follow repository import and barrel-file rules after extraction.

## Verification

- No changed source file exceeds 300 lines.
- Each changed file has one clear, cohesive responsibility.
- The render tree is shallow enough to understand locally, or a deeper structure has a clear reason.
- Extracted components have typed props and no accidental behavior changes.
- JSX does not contain non-trivial data transformation or business logic.
- Accessibility attributes, keyboard behavior, loading states, and error states remain intact.
- Rendered `@monorepo-template/ui` components have meaningful consumer-provided `data-testid` props, including
  extracted subcomponents; do not bypass the shared-component checker.
- Focused tests, type checks, lint, and formatting pass for the affected package.
