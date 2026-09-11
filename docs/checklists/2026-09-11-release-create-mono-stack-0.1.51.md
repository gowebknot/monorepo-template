# Release `create-mono-stack` 0.1.51

- Checklist ID: REL-CREATE-MONO-STACK-004
- Created: 2026-09-11
- Planning completed: 2026-09-11
- Type: Patch release
- Source request: "publish to npm" (interpreted, with explicit user confirmation, as releasing the
  full currently-uncommitted working tree, including work outside `core/create-mono-stack`).
- Related checklists:
  - [ORM-Only Database Guidance](2026-09-11-orm-only-database-guidance.md)
  - [Atomic Design UI Guidance](2026-09-11-atomic-design-ui-guidance.md)
  - [Shallow Code and Cohesive Modules](2026-09-11-shallow-code-and-cohesive-modules.md)
  - [Code Quality Dispatch and CVA Guidance](2026-08-24-code-quality-dispatch-and-cva-guidance.md)
  - [Release create-mono-stack 0.1.50](2026-09-03-release-create-mono-stack-0.1.50.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  `core/create-mono-stack/reference-templates/managed/server/**` (tsconfig `rootDir` fixes, the
  migration-based `database.module.ts`, `AGENTS.md`), `apps/server/**` (the same server fixes),
  `packages/db/**` (the `migrateExampleDb` helper, generated SQLite migrations, tests, README),
  root and package `AGENTS.md`, four skill roots (`skills/`, `.agents/skills/`, `.claude/skills/`,
  `.opencode/skills/`), `.skills-sync.json`, and this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact and ships a generated-project behavior
  change (reference server startup now migrates through Drizzle instead of executing handwritten SQL).

## Implementation Description

Release `create-mono-stack` 0.1.51. The npm-artifact-relevant change is scoped to
`core/create-mono-stack/reference-templates/managed/server`: the reference/demo NestJS server now
migrates its example SQLite database through a Drizzle `better-sqlite3` migrator
(`@monorepo-template/db/example`'s new `migrateExampleDb`) instead of executing handwritten
`CREATE TABLE` SQL through the driver, with three `tsconfig*.json` files given explicit `rootDir`
values to resolve a `TS2210` "project root is ambiguous" build error the new subpath import
(`#reference/*`) otherwise triggers. This is additive/corrective template behavior: generated
projects that use the managed server's reference database module pick it up on their next creation
or template update; there is no API-breaking change, and unmanaged legacy demo databases fail safely
without deleting data instead of silently succeeding.

The commit also carries repository-policy and skill-documentation changes that do not affect the
published npm artifact (verified: `core/create-mono-stack`'s `package.json` `files` field is
`bin`, `src`, `reference-templates`, `requirements`, `LICENSE`, `README.md` — no `skills/` or root
`AGENTS.md` path is included): an explicit ORM-only/no-raw-SQL persistence policy in
`backend-standards`, Atomic Design guidance in `frontend-standards`, and shallow-code/cohesive-module
strengthening across `code-quality`, `jsx-component-extraction`, and `code-review`. These were
originally planned as no-release, skill-only changes in their own checklists; the user explicitly
authorized bundling them into this release commit when asked, given they carry no npm-artifact impact.

## Implementation Contract

### Feature Boundaries

- Included: the `migrateExampleDb` reference-server migration replacement and its `tsconfig` fixes
  (npm-artifact-relevant), the unrelated skill/documentation changes (repository-policy-relevant
  only), package/fixture version markers, release record, release validation, pushed release commit
  and annotated tag, and wrapper-based npm publication.
- Excluded: new product implementation, direct npm publishing, credential changes, database
  migrations against any real/shared database, and modifying historical checklists.
- Ownership: `core/create-mono-stack` owns the published CLI and reference templates;
  `@monorepo-template/db` owns the migration helper consumed by the reference template;
  `apps/server` and the managed template's `reference/` owns the generated project's reference
  server; the package-local wrapper owns authenticated publication.

### Route-Group Ownership

| Route group          | Entry point                                       | Owner                     | Result                              |
| -------------------- | ------------------------------------------------- | ------------------------- | ----------------------------------- |
| Reference DB startup | `reference/database/database.module.ts`           | managed server template   | Migrates then seeds demo data       |
| Release artifact     | `npm pack --dry-run`                              | create-mono-stack package | Inspectable 0.1.51 tarball          |
| Release publish      | `pnpm --filter create-mono-stack publish:package` | package-local wrapper     | Public npm package after remote tag |

### User Journey

1. A maintainer starts from the committed migration-helper and skill-documentation changes and npm
   version 0.1.50.
2. The package version and template fixture move to 0.1.51 and all checks pass, including the
   `packages/db` and `apps/server` suites this release depends on.
3. The release commit is pushed, annotated as `v0.1.51`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.51.
5. Any validation, push, tag, or publish failure stops the release without bypassing checks.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-030 | Version marker        | valid              | Manifest and fixture both use 0.1.51; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-031 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-032 | Artifact inspection   | valid              | Dry-run tarball is 0.1.51 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-033 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.51 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

- Resolved: the user explicitly authorized including the unrelated skill/documentation checklists in
  this release commit when asked, overriding those checklists' own "no release is included" planning
  notes; those notes described the original plan, not this later, explicit decision.
- None found otherwise. The user explicitly authorized npm publication; package and repository
  instructions prescribe the commit, push, tag, then publish order.

## Acceptance Criteria

- [ ] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.51` / `v0.1.51`.
- [ ] Package suite, full repository gate, and dry-run artifact validation pass.
- [ ] The release commit and annotated `v0.1.51` tag are pushed to `origin` before publication.
- [ ] The package-local wrapper publishes `create-mono-stack@0.1.51`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-030 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.50; npm latest is 0.1.50.
- Exact input or fixture: `0.1.51` and `_commit: v0.1.51\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.51.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.50; no fixture expects v0.1.51.
- First observed run: 2026-09-11, updated both markers to 0.1.51 directly (following the 0.1.50
  release's established pattern) and ran the suite.
- Passing rerun: 2026-09-11, `pnpm --filter create-mono-stack test` passed: 278/278, both markers at
  0.1.51.

### TEST-RELEASE-031 release validation

- Small task: validate all shipped repository behavior before release.
- Source: root and package `AGENTS.md`, `release-flow`.
- Test place: `just check`, plus `packages/db` and `apps/server` package checks the release depends on.
- Starting state: versioned release candidate in a working tree with the ORM-only-database-guidance,
  atomic-design-ui-guidance, and shallow-code-and-cohesive-modules work applied.
- Exact input or fixture: repository HEAD with no bypass flags.
- Interaction steps: run `pnpm build`, `just check`, `pnpm --filter @monorepo-template/db test`,
  `pnpm --filter @monorepo-template/db lint`, `pnpm --filter server build`,
  `pnpm --filter server build:reference`, `pnpm --filter server typecheck`,
  `pnpm --filter server lint`, `pnpm --filter server test:unit`, `pnpm --filter server test:api:e2e`,
  and `node --test test/reference-database.test.mjs` from `apps/server`.
- Main behavior: all required build, lint, type, skills, template, and test checks pass.
- Expected result: exit 0 on every command.
- Must change: no source file beyond recorded validation state.
- Must not happen: a hook/check bypass or publication after a failed gate.
- Planned command: `just check`.
- Expected result before the code change: prior committed state (0.1.50) passes; candidate version
  and the migration-helper/skill changes are absent.
- First observed run: 2026-09-11, `pnpm --filter @monorepo-template/db lint` failed once during
  earlier implementation (`preserve-caught-error`), fixed before this release gate ran; see the ORM
  checklist for that history.
- Passing rerun: 2026-09-11, `just check` exited 0 (278 launcher tests, server unit/e2e, lint,
  typecheck, format-check, skills-check, skills-test, template-test); `packages/db` and `apps/server`
  package-scoped commands above all passed.

### TEST-RELEASE-032 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.51 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.51 tarball; no `.npmrc*`, package test directory, or node_modules.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.50.
- First observed run: 2026-09-11, dry run reported `create-mono-stack-0.1.51.tgz`, 299 files, 617.0 kB
  packed, 1.0 MB unpacked; contains the updated `reference-templates/managed/server` files, no
  `.npmrc*`, and no launcher `test/` directory (the one `test/` entry present is the managed server's
  own reference `app.e2e-spec.ts`, part of the shipped template, not launcher test infrastructure).
- Passing rerun: 2026-09-11, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-033 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.51` pushed to origin.
- Exact input or fixture: `v0.1.51`, expected release commit SHA, package `create-mono-stack@0.1.51`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.51.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.51 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.50.
- First observed run: pending.
- Passing rerun: pending.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-030; release gate to 031; artifact to 032; push/tag/publish
   to 033.
2. The release ordering and wrapper-only publish rule map to TEST-RELEASE-033; no-bypass rule maps
   to TEST-RELEASE-031.
3. Invalid form/API/auth/data boundary cases do not apply: this release accepts fixed version strings
   and has no runtime endpoint, interface, credentials, or authorization behavior change. The one
   database-migration behavior change (unmanaged legacy demo database) is already covered by
   TEST-MIGRATE-004 in the ORM-only-database-guidance checklist.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; it is not exercised
   intentionally because npm publications are irreversible.
5. Each case states exact versions, commands, expected results, and pending observed-result fields.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.51.
- [x] Set the CLI fixture to `_commit: v0.1.51`.
- [x] Record TEST-RELEASE-030 through 032 validation results in this checklist.
- [ ] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.51`.
- [ ] Publish with the package wrapper and record TEST-RELEASE-033 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` returned `0.1.50` on 2026-09-11.
- TEST-RELEASE-030: `pnpm --filter create-mono-stack test` passed at 0.1.51 (278/278).
- TEST-RELEASE-032: dry run produced `create-mono-stack-0.1.51.tgz`, 299 files, 617.0 kB packed,
  1.0 MB unpacked; excludes the package `test/` directory, `node_modules`, and `.npmrc*`.
- TEST-RELEASE-031: `just check` passed in full (278 launcher tests, server unit/e2e, lint,
  typecheck, format-check, skills-check with 20 portable skills, skills-test with 168 cases,
  template-test). `pnpm --filter @monorepo-template/db test` (9/9) and
  `pnpm --filter @monorepo-template/db lint` (clean) passed after the `preserve-caught-error` fix
  recorded in the ORM checklist. `apps/server` build, build:reference, typecheck, lint, test:unit
  (5/5), test:api:e2e (3/3), and `node --test test/reference-database.test.mjs` (1/1) all passed.
