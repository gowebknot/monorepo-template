---
name: domain-driven-app-structure
description: "Guide Express or NestJS server and web/mobile source organization using nested domain layers, shared entities, and shared UI packages."
---

# Domain-Driven App Structure

Use this skill when creating, moving, reviewing, or extending server, web, or mobile source files
that should follow domain boundaries and nested conventions.

1. Read `references/source-layout.md` before choosing a new path.
2. Classify shared UI primitives and app-wide composition before identifying a feature. Reusable
   controls, icons, and icon wrappers belong in `packages/ui`; app-wide composition belongs in the
   app's top-level `components/`; only feature-specific behavior and composition belong in
   `features/<feature>/components`.
3. Identify the feature or domain for feature-owned code, then place transport, use-case, domain,
   persistence, and UI code in its matching nested folder.
4. Use `@tanstack/react-form` for every form, filter, edit flow, field value, validation state, and
   submit interaction. Manual form management is forbidden: do not use local React state or ad hoc
   handlers to own form values. Read `examples/tanstack-form.md` before implementing form handling.
5. Apply the server rules to either Express routes/handlers or NestJS controllers/modules; do not
   introduce Rust-specific structure.
6. Keep shared API contracts and entities in `packages/entities`.
7. Keep shared UI primitives and form fields in `packages/ui`; do not duplicate them in app or
   feature component folders.
8. Keep the rules generic, using domain and feature examples only as vocabulary.
9. Preserve colocated tests, barrel exports, route nesting, and mock nesting described in the reference.
10. Run affected package build, typecheck, lint, and test checks before finishing.
