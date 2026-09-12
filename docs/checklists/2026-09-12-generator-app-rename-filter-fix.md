# Parent: generator never ships hardcoded `--filter &lt;default-name&gt;` for a renamed app

Checklist ID: 2026-09-12-generator-app-rename-filter-fix
Related checklists: none prior (new bug class)

## Change Tier

Tier: large

## Context

See the approved plan (`/Users/mr_adventurous/.claude/plans/deeper-investigation-changed-the-warm-thunder.md`)
for full investigation detail. Summary: `create-mono-stack` lets a user rename any generated app away
from its feature's default name (`web`, `server`, `next`, `expo`, `mobile`), but two independent classes
of generated output still hardcode the un-renamed default and break or mislead once an app is renamed:
(1) per-app reference docs (`AGENTS.md`/`CLAUDE.md`/`README.md`) copied verbatim at generation time,
and (2) shared cross-app runtime scripts (`apps/playwright/playwright.config.ts`,
`apps/maestro/scripts/run-flows.mjs`, `scripts/pre-commit-checks.mjs`,
`scripts/swagger-documentation-check.mjs`) that assume the default name/path instead of resolving it.
These are independently shippable fixes with different mechanisms (generation-time text rewrite vs.
runtime dynamic resolution from `.mono-stack.json`), hence two child checklists rather than one flat
checklist.

## Child Checklists

- [x] [Generation-time rewrite of per-app docs](docs/checklists/2026-09-12-generator-app-rename-filter-fix-generation-rewrite.md)
- [x] [Runtime dynamic app-name resolution for shared scripts](docs/checklists/2026-09-12-generator-app-rename-filter-fix-runtime-lookup.md)

## Verification (whole change)

- [x] `pnpm --filter create-mono-stack test` — 287/287 passed, including the 5 new TEST-APPNAME cases
      and the unmodified TEST-MANAGED-001.
- [x] `node --test scripts/stack-app-lookup.test.mjs scripts/pre-commit-checks.test.mjs scripts/swagger-documentation-check.test.mjs`
      — 3/3, 3/3, 4/4 passed respectively.
- [x] `just check` — exit 0, all 21 turbo tasks successful (lint/typecheck/build), format-check,
      skills-check, skills-test, and the server test:unit/test:api:e2e suites all clean. The two `next`/
      `web` lint warnings in the log are pre-existing cached React Compiler warnings in unrelated files
      (`table-demo.tsx`), not caused by this change.
- Not performed: a full end-to-end `create-mono-stack` CLI regeneration with a renamed app (would
  invoke real Copier + `pnpm create vite`/`nest new` scaffolding and needs network access). Confidence
  instead comes from: the new unit tests exercising the exact rewrite/lookup logic in isolation, the
  existing `TEST-MANAGED-001` proving the pre-rewrite pipeline stage is unaffected, and
  `playwright.config.ts`'s `typecheck`/`lint`/`playwright test --list` all passing against this
  repo's own (unrenamed, manifest-less) baseline.
