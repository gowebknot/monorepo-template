# TanStack Form Zod Example

- Checklist ID: CHECKLIST-20260824-tanstack-form-zod-example
- Created: 2026-08-24
- Type: Documentation correction
- Related checklist: [TanStack Form Policy](./2026-08-24-tanstack-form-policy.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Acceptance Criteria

- [x] The TanStack Form example imports the authoritative Zod schema.
- [x] The example wires that schema into form validation.
- [x] The example continues to use the inferred input type for default values.

## Exact Test Case

### TEST-FORM-006: Example uses Zod validation

- **Small task:** Add runtime schema validation to the documented TanStack Form example.
- **Source:** User request and `packages/entities/example` contract ownership rules.
- **Test place:** Exact source scan of `skills/domain-driven-app-structure/examples/tanstack-form.md`.
- **Starting state:** The example imports only `CreateTodoInput` and has no form validator.
- **Exact input or fixture:** `createTodoInputSchema` from `@repo/entities/example` and a TanStack Form validator entry.
- **Interaction steps:** Search the example for the schema import, `validators`, and the existing type import.
- **Main behavior:** The documented form validates through the shared Zod contract.
- **Expected result:** The example references `createTodoInputSchema` in both the import and form configuration while retaining `CreateTodoInput`.
- **Must change:** Only the example documentation.
- **Must not happen:** Do not create a duplicate local schema or remove the shared inferred type.
- **Planned command:** `rg -n "createTodoInputSchema|validators|CreateTodoInput" skills/domain-driven-app-structure/examples/tanstack-form.md`
- **Expected result before the code change:** No `createTodoInputSchema` or `validators` match exists.
- **First observed run:** The scan found only the existing `CreateTodoInput` type import and no schema or validator.
- **Passing rerun:** The scan found `createTodoInputSchema`, `validators`, and `CreateTodoInput` in all four synchronized skill roots.

## Implementation Steps

- [x] Import `createTodoInputSchema` beside `CreateTodoInput`.
- [x] Add the schema to the form's validation configuration.
- [x] Run the focused scan and formatting check.

## Validation Notes

- `pnpm skills:sync` synchronized all 19 portable skills.
- `pnpm skills:check` validated all 19 portable skills.
- The exact reference scan passed across `skills/`, `.agents/skills/`, `.claude/skills/`, and `.opencode/skills/`.
- Prettier and `git diff --check` passed.
