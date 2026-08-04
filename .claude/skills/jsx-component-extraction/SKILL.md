---
name: jsx-component-extraction
description: "Use when writing, reviewing, or refactoring React JSX or TSX with deeply nested markup, repeated UI blocks, complex conditional branches, mapped content, nested forms, or logic-heavy render functions. Keep every file under 300 lines and each file focused on one cohesive responsibility. Extract meaningful subtrees into typed components while preserving behavior, accessibility, styling, state flow, component-library usage, and repository import boundaries."
---

# JSX Component Extraction

Keep React render trees readable and keep JSX focused on describing UI structure.

## Extraction Rules

- Keep every source file under 300 lines. Split a file before it reaches that limit when the split
  produces clear, cohesive modules.
- Give each file one cohesive responsibility. Do not combine unrelated UI, data fetching, state
  management, validation, formatting, and orchestration responsibilities in one file.
- Inspect changed JSX or TSX for nested containers, repeated markup, mapped item content, nested
  cards or panels, forms, and complex conditional branches.
- Extract a meaningful subtree when nesting or local logic makes the parent difficult to scan.
- Prefer a same-file private component when the extracted block has one consumer.
- Use a separate file only when the component is reused, independently substantial, or matches the
  repository's component organization.
- Keep extracted components pure, typed, explicit about props, and focused on one responsibility.
- Do not extract tiny wrappers when the new boundary would reduce clarity.

## JSX Logic

- Prepare filtering, mapping inputs, branching decisions, formatting, derived labels, status values,
  and permission decisions before the returned JSX.
- Keep inline expressions to simple property access, direct event handlers, boolean toggles, and
  trivial interpolation.
- Preserve existing visual structure, behavior, accessibility attributes, styling, and library APIs.
- Follow repository import and barrel-file rules after extraction.

## Verification

- No changed source file exceeds 300 lines.
- Each changed file has one clear, cohesive responsibility.
- The render tree is shallow enough to understand locally, or a deeper structure has a clear reason.
- Extracted components have typed props and no accidental behavior changes.
- JSX does not contain non-trivial data transformation or business logic.
- Accessibility attributes, keyboard behavior, loading states, and error states remain intact.
- Focused tests, type checks, lint, and formatting pass for the affected package.
