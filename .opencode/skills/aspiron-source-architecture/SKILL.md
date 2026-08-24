---
name: aspiron-source-architecture
description: "Guide Express or NestJS server and web/mobile source organization using Aspiron-style nested layers, shared entities, and shared UI packages."
---

# Aspiron Source Architecture

Use this skill when creating, moving, reviewing, or extending server, web, or mobile source files
that should follow Aspiron-style boundaries and nested conventions.

1. Read `references/source-layout.md` before choosing a new path.
2. Identify the feature or domain first, then place transport, use-case, domain, persistence, and UI
   code in its matching nested folder.
3. Apply the server rules to either Express routes/handlers or NestJS controllers/modules; do not
   introduce Rust-specific structure.
4. Keep shared API contracts and entities in `packages/entities`.
5. Keep shared UI primitives and form fields in `packages/ui`; app `components/` folders contain only
   app-specific composition.
6. Keep the rules generic, using Aspiron domains and features as concrete examples.
7. Preserve colocated tests, barrel exports, route nesting, and mock nesting described in the reference.
8. Run affected package build, typecheck, lint, and test checks before finishing.
