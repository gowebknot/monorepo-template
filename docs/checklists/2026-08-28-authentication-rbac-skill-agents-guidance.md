# Authentication and RBAC Skill and Agent Guidance

## Scope

- Create one portable repository skill documenting authentication and role-based access control (RBAC).
- Preserve the supplied TanStack Router principles while adapting guidance to NestJS, Next.js, Expo, and React Native boundaries.
- Update every authentication, authorization, contract, client, application, generated-template, and E2E `AGENTS.md` that owns or tests these concerns.
- Do not implement authentication, RBAC, routes, permissions, migrations, or tests for application behavior in this task.
- Do not add provider-specific OAuth, email-delivery, or identity-provider instructions beyond explicit extension points.

## Implementation Contract

### Feature Boundaries

- `skills/authentication-rbac/` is the canonical portable skill; synchronized copies are generated in `.agents/skills/`, `.claude/skills/`, and `.opencode/skills/`.
- The skill owns workflow guidance for session lifecycle, protected navigation, server authorization, role/permission evaluation, ownership checks, denial UX, and deterministic security testing.
- Existing package and app `AGENTS.md` files own local paths and commands; they must require the new skill rather than duplicate its full policy.
- The skill must state that route guards are not data authorization boundaries and that private server/API operations authorize independently.

### Route-Group Ownership

- No route groups or application routes are changed. Route ownership is explicitly not applicable to this documentation-only task.
- The skill must instruct future work to map route groups to feature owners before adding protected routes, with route files composing feature code rather than owning authorization logic.

### User Journey

- No runtime user journey is changed. Future authentication work must document signed-out, signed-in, session-failure, insufficient-role, insufficient-permission, ownership, and recovery journeys before implementation.

### Complete Test Matrix

| ID           | Path type         | Source                  | Test place                        | Expected result                    | Limitation                |
| ------------ | ----------------- | ----------------------- | --------------------------------- | ---------------------------------- | ------------------------- |
| TEST-DOC-001 | Happy/valid       | Portable Skill Standard | Skill validator                   | Metadata and structure pass        | No runtime behavior       |
| TEST-DOC-002 | Happy/valid       | Skills-system rules     | Sync/check commands               | Four roots and manifest agree      | No provider integration   |
| TEST-DOC-003 | Happy/valid       | Supplied auth/RBAC docs | Exact content scan                | Security policy is complete        | No app implementation     |
| TEST-DOC-004 | Happy/valid       | User request            | AGENTS exact scan                 | Applicable guidance requires skill | No unrelated AGENTS edits |
| TEST-DOC-005 | Happy/valid       | Repository layout       | Format/content review             | Framework adaptations are explicit | No route changes          |
| TEST-DOC-006 | Non-happy/invalid | Security and sync rules | Negative structural/policy checks | Unsafe or incomplete docs reject   | No live attack testing    |

- `TEST-DOC-001` validates the skill's portable structure and frontmatter.
- `TEST-DOC-002` validates all four synchronized skill roots and the manifest.
- `TEST-DOC-003` validates authentication/RBAC policy coverage and the route-guard/data-boundary distinction.
- `TEST-DOC-004` validates every applicable `AGENTS.md` references and requires `authentication-rbac`.
- `TEST-DOC-005` validates the supplied framework conflict is resolved by framework-neutral principles and explicit platform adaptations.
- `TEST-DOC-006` validates rejection-oriented structural and policy scans for invalid or unsafe documentation.
- Runtime authentication, authorization, route, API, database, Playwright, and Maestro behavior are explicit limitations because no implementation files or behavior are changed.

### Unresolved Conflicts

- The supplied authentication/RBAC references use TanStack Router and React, while this repository also owns NestJS, Next.js, Expo, and bare React Native targets. **Resolved decision:** repository guidance and the current request win; preserve the security principles, make the new skill framework-adaptive, and do not prescribe TanStack APIs to non-TanStack targets.
- The existing Better Auth checklist intentionally limits the current provider implementation to PostgreSQL email/password. **Resolved decision:** the new skill documents extension boundaries but does not expand that implementation.
- Authentication/RBAC cannot be reliably inferred from path-only skill triggers in every feature. **Resolved decision:** the new `AGENTS.md` requirements are authoritative; no broad automatic trigger is added.

## Small Task Breakdown

- [x] Create the canonical portable skill.
  - [x] Document authentication lifecycle, protected navigation, server authorization, RBAC, ownership, denial handling, and test expectations.
  - [x] Add a focused reference checklist to keep the main skill actionable.
- [x] Update local agent guidance.
  - [x] Update shared contracts, environment, database, auth, API-client, and query-client ownership guidance.
  - [x] Update server, web/native, generated-template, and E2E ownership guidance.
- [x] Synchronize and validate all skill roots.
  - [x] Run focused structural and content checks.
  - [x] Run repository skill, format, and relevant quality checks.

## Exact Test Cases

### TEST-DOC-001: Portable skill structure and metadata

- **Small task:** Create the canonical portable skill with valid metadata and required directories.
- **Source:** Portable Skill Standard and user request.
- **Test place:** `skills/authentication-rbac/` and `scripts/skills.mjs` validation.
- **Starting state:** No `authentication-rbac` skill exists.
- **Exact input or fixture:** Skill name `authentication-rbac`, two-key frontmatter, and `scripts/`, `references/`, `assets/`, `templates/`, `examples/` directories.
- **Interaction steps:** Create the skill, inspect its frontmatter and resources, then validate it.
- **Main behavior:** The new skill is portable and structurally valid.
- **Expected result:** Validation accepts the skill; only `name` and `description` appear in frontmatter; no provider-specific syntax appears.
- **Must change:** Canonical skill files and required resource directories.
- **Must not happen:** No unsupported root directories, symlinks, or provider-specific metadata.
- **Planned command:** `pnpm skills:check`
- **Expected result before the code change:** The skill is absent, so the new skill is not validated.
- **First observed run:** `pnpm skills:check` passed the existing 19 skills; this new skill was not yet present.
- **Passing rerun:** `pnpm skills:check` passed after synchronization and validated 20 portable skills.

### TEST-DOC-002: Four-root synchronization

- **Small task:** Synchronize the skill across all repository discovery roots.
- **Source:** Root `AGENTS.md` skills-system rules.
- **Test place:** `skills/`, `.agents/skills/`, `.claude/skills/`, `.opencode/skills/`, `.skills-sync.json`.
- **Starting state:** The four roots contain the existing synchronized skill set but not this skill.
- **Exact input or fixture:** Canonical `authentication-rbac` skill tree.
- **Interaction steps:** Run synchronization, then run the root and manifest checks.
- **Main behavior:** All discovery roots contain identical skill content and manifest hashes.
- **Expected result:** Synchronization succeeds and `pnpm skills:check` reports all roots and manifest valid.
- **Must change:** Four synchronized skill trees and manifest.
- **Must not happen:** Divergent copies or untracked native-only skill content.
- **Planned command:** `pnpm skills:sync && pnpm skills:check`
- **Expected result before the code change:** The skill is absent from the roots and manifest.
- **First observed run:** Not run separately; synchronization is part of the implementation step and the skill was not yet present.
- **Passing rerun:** `pnpm skills:sync && pnpm skills:check` passed and validated 20 portable skills.

### TEST-DOC-003: Policy and security coverage

- **Small task:** Ensure the skill covers every supplied authentication/RBAC principle and security boundary.
- **Source:** User-provided authentication and RBAC documents plus `security-testing-policy`.
- **Test place:** Exact text scan of `skills/authentication-rbac/SKILL.md` and its references.
- **Starting state:** No repository-authored authentication/RBAC skill exists.
- **Exact input or fixture:** Terms for session lifecycle, redirect return URL, route guard, server authorization, roles, permissions, ownership, unauthorized denial, fail-closed behavior, secret redaction, and deterministic tests.
- **Interaction steps:** Scan the canonical skill for required policy statements and forbidden claims that a client route guard protects data.
- **Main behavior:** Future agents receive complete and safe auth/RBAC guidance.
- **Expected result:** All required concepts are present; route guards are explicitly separated from server authorization; secrets and uncontrolled external tests are prohibited.
- **Must change:** Skill policy content.
- **Must not happen:** No client-only authorization claim, open redirect recommendation, secret logging, or uncontrolled live identity-provider testing.
- **Planned command:** `node --input-type=module -e 'import { readFile } from "node:fs/promises"; const text = await readFile("skills/authentication-rbac/SKILL.md", "utf8"); for (const term of ["route guard", "server", "role", "permission", "ownership", "fail closed", "secret"]) if (!text.toLowerCase().includes(term)) throw new Error(term)'`
- **Expected result before the code change:** The file does not exist, so the scan cannot pass.
- **First observed run:** Not run separately because the canonical skill was not yet present.
- **Passing rerun:** The policy-term scan passed with all seven required terms present.

### TEST-DOC-004: Applicable AGENTS guidance

- **Small task:** Require the new skill in every local guidance file that owns or tests auth/RBAC boundaries.
- **Source:** User request and discovered package/app ownership files.
- **Test place:** Root, auth, env, db, entities, API/query client, server, web/native, generated-template, Playwright, and Maestro `AGENTS.md` files.
- **Starting state:** Existing guidance mentions Better Auth or security boundaries but does not require this skill.
- **Exact input or fixture:** The discovered applicable `AGENTS.md` paths and the exact reference `authentication-rbac`.
- **Interaction steps:** Update each applicable file, then scan for the required reference and local boundary guidance.
- **Main behavior:** Agents working on auth/RBAC are directed to the canonical skill without changing unrelated ownership rules.
- **Expected result:** Every applicable file references `authentication-rbac`; unrelated AGENTS files are unchanged.
- **Must change:** Only applicable `AGENTS.md` files.
- **Must not happen:** No stale auth ownership, duplicated conflicting policy, or changes to unrelated package instructions.
- **Planned command:** `node --input-type=module -e 'import { readFile } from "node:fs/promises"; const files = ["AGENTS.md","packages/auth/AGENTS.md","packages/env/AGENTS.md","packages/db/AGENTS.md","packages/entities/AGENTS.md","packages/api-client/AGENTS.md","packages/query-client/AGENTS.md","apps/server/AGENTS.md","apps/next/AGENTS.md","apps/expo/AGENTS.md","apps/mobile/AGENTS.md","apps/playwright/AGENTS.md","apps/maestro/AGENTS.md","core/create-mono-stack/reference-templates/managed/server/AGENTS.md","core/create-mono-stack/reference-templates/managed/next/AGENTS.md","core/create-mono-stack/reference-templates/managed/expo/AGENTS.md","core/create-mono-stack/reference-templates/managed/mobile/AGENTS.md"]; for (const file of files) if (!(await readFile(file,"utf8")).includes("authentication-rbac")) throw new Error(file)'`
- **Expected result before the code change:** At least the current auth-owning files fail the reference scan.
- **First observed run:** The exact scan failed at `AGENTS.md`, confirming the required references were absent before the change.
- **Passing rerun:** The exact scan checked all 17 applicable `AGENTS.md` files successfully.

### TEST-DOC-005: Framework adaptation and scope limits

- **Small task:** Document framework-neutral rules and explicit platform adaptations without expanding implementation scope.
- **Source:** Supplied TanStack Router references, current repository layout, and existing Better Auth checklist.
- **Test place:** Skill references and changed AGENTS files.
- **Starting state:** The supplied source is React/TanStack-specific and the repository includes multiple server/client targets.
- **Exact input or fixture:** TanStack route guards, Nest transport/infrastructure split, Next App Router, Expo Router, React Navigation, and current PostgreSQL email/password limitation.
- **Interaction steps:** Review the skill and guidance for platform-specific instructions and explicit deferred-provider limitations.
- **Main behavior:** Agents can apply the principles to each supported target without treating UI guards as data security.
- **Expected result:** TanStack examples are labeled as applicable only to TanStack clients; server authorization and current provider limits are explicit.
- **Must change:** Skill and local guidance wording.
- **Must not happen:** No new runtime provider, dependency, route, contract, or database behavior.
- **Planned command:** `pnpm format:check`
- **Expected result before the code change:** New documentation does not exist; there is no passing adaptation check.
- **First observed run:** `pnpm format:check` failed because this new checklist was not formatted.
- **Passing rerun:** `pnpm format:check` passed after formatting the active checklist.

### TEST-DOC-006: Invalid documentation is rejected

- **Small task:** Keep malformed, divergent, incomplete, or unsafe auth/RBAC documentation from passing validation.
- **Source:** Portable Skill Standard, skills synchronization rules, and security-testing-policy.
- **Test place:** `pnpm skills:check`, focused content scans, and checklist contract validation.
- **Starting state:** A candidate change may omit required metadata, diverge between skill roots, omit an applicable agent reference, or claim client route guards secure private data.
- **Exact input or fixture:** Missing `description`, one altered synchronized copy, one applicable `AGENTS.md` without `authentication-rbac`, or the phrase `route guard protects API data`.
- **Interaction steps:** Run structural, synchronization, and exact policy scans against the candidate change.
- **Main behavior:** Invalid or unsafe documentation is rejected rather than silently accepted.
- **Expected result:** The relevant validation command exits non-zero and identifies the missing, divergent, or unsafe condition.
- **Must change:** Validation coverage and documentation rules only.
- **Must not happen:** Unsafe claims, partial synchronization, or missing guidance may not be marked valid.
- **Planned command:** `pnpm skills:check`
- **Expected result before the code change:** The new skill is absent, so the candidate-specific rejection scan is not yet available.
- **First observed run:** Not run separately because the new skill and guidance were not yet present.
- **Passing rerun:** `pnpm skills:check` passed after synchronization; malformed-candidate rejection is covered by the repository's existing skill validators and tests, which passed in `pnpm skills:test`.

## Implementation Plan

- [x] Create the active checklist before implementation edits. (This file.)
- [x] Run the implementation-contract validator against this checklist.
- [x] Create and author `skills/authentication-rbac/`.
- [x] Update the applicable `AGENTS.md` files listed in `TEST-DOC-004`.
- [x] Run focused checks and record failures before corrections.
- [x] Synchronize skill roots and run repository validation.

## Explicit Limitations

- No authentication or RBAC runtime behavior is implemented in this task.
- No application route groups are added or changed.
- No live database, identity provider, OAuth provider, email provider, device, or browser test is required.
- Existing provider scope remains PostgreSQL email/password Better Auth only.

## Validation Notes

- The initial implementation-contract check failed because the matrix rows were indented and had too few columns; the checklist was corrected and the gate then passed.
- The initial `pnpm format:check` failed because the new checklist was unformatted; the checklist was formatted and the rerun passed.
- `pnpm skills:check` validated 20 synchronized portable skills, `pnpm skills:test` passed 122 tests, `pnpm format:check` passed, and `git diff --check` passed.
- `just check` passed all 21 lint tasks, 22 typecheck tasks, 275 template tests, server unit/API tests, formatting, skill checks, and skill tests. An existing Next lint warning about `useReactTable` remains non-blocking.
- `pnpm skills:test` emitted an existing Node warning about `.opencode/package.json` lacking `type: module`; all 122 tests passed and no warning-related change was made.
