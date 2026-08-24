# API Client Provider Options

- Checklist ID: CHECKLIST-20260824-api-client-provider-options
- Created: 2026-08-24
- Type: Shared TanStack API configuration and portable skill guidance
- Related checklist: `docs/checklists/2026-08-23-api-chain-skill-gate.md`
- Source request: Configure the generic API base URL once through a provider accepting `ServiceOptions`, while allowing inline options to target a different API.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Add `ApiClientProvider` to `@repo/query-client` with an `options: ServiceOptions` prop.
- Resolve provider options and inline hook options across shared and example TanStack hooks.
- Update canonical apps and managed reference templates to configure the provider from validated environment values.
- Document provider defaults and inline overrides in the API flow skill and synchronize all portable skill roots.

## Acceptance Criteria

- TanStack API hooks inherit the provider's `ServiceOptions` when no inline options are supplied.
- Inline `ServiceOptions` override provider values for the individual operation.
- Provider and inline headers merge with inline values taking precedence.
- Hooks used without `ApiClientProvider` fail with a clear configuration error.
- Query keys distinguish requests with different resolved API options.
- Canonical and managed apps configure the provider once and do not repeat the generic base URL at each consumer.
- The API flow skill explains provider configuration and explicit inline overrides.

## Exact Test Cases

### TEST-API-CLIENT-001: Provider options inheritance

- **Small task:** Resolve provider-level `ServiceOptions` for a hook without inline options.
- **Source:** User request and `packages/api-client/src/client/axios-instance.ts` requirement that every client has a base URL.
- **Test place:** `packages/query-client/src/api-client-context.test.ts` pure option-resolution test.
- **Starting state:** Provider options are `{ baseURL: "https://primary.example.test" }`; inline options are absent.
- **Exact input or fixture:** The provider options object and `undefined` inline options.
- **Interaction steps:** Call the shared resolver with the provider and inline values.
- **Main behavior:** Provider options become the resolved service options.
- **Expected result:** The result contains `baseURL: "https://primary.example.test"`.
- **Must change:** Query-client context/resolution implementation.
- **Must not happen:** The resolver must not require every consumer to repeat `baseURL`.
- **Planned command:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts`.
- **Expected result before the code change:** The command is unavailable because the package has no test script or provider resolver test.
- **First observed run:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts` did not provide a focused test because the package had no test script or test file.
- **Passing rerun:** `pnpm --filter @repo/query-client test` passed the resolver test suite after implementation.

### TEST-API-CLIENT-002: Inline base URL override

- **Small task:** Allow one hook operation to target a different API base URL.
- **Source:** User requirement that inline base URLs remain available for non-generic APIs.
- **Test place:** `packages/query-client/src/api-client-context.test.ts` pure option-resolution test.
- **Starting state:** Provider options use `https://primary.example.test`; inline options use `https://alternate.example.test`.
- **Exact input or fixture:** Both `ServiceOptions` objects with different `baseURL` values.
- **Interaction steps:** Resolve options for the operation with the inline override.
- **Main behavior:** The inline base URL takes precedence.
- **Expected result:** The result contains only `baseURL: "https://alternate.example.test"` as the selected base URL.
- **Must change:** Query-client option resolution.
- **Must not happen:** The provider's base URL must not overwrite the explicit inline URL.
- **Planned command:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts`.
- **Expected result before the code change:** The command is unavailable because no resolver test exists.
- **First observed run:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts` did not provide a focused test because the package had no test script or test file.
- **Passing rerun:** `pnpm --filter @repo/query-client test` passed the inline override case.

### TEST-API-CLIENT-003: Header merge precedence

- **Small task:** Merge provider and inline headers for one operation.
- **Source:** Existing `ServiceOptions.headers` contract.
- **Test place:** `packages/query-client/src/api-client-context.test.ts` pure option-resolution test.
- **Starting state:** Provider headers are `{ Authorization: "primary", "X-App": "reference" }`; inline headers are `{ Authorization: "alternate" }`.
- **Exact input or fixture:** Provider and inline options with the headers above.
- **Interaction steps:** Resolve options for the operation with inline headers.
- **Main behavior:** Shared headers remain and conflicting inline values override provider values.
- **Expected result:** Headers are `{ Authorization: "alternate", "X-App": "reference" }`.
- **Must change:** Query-client option resolution.
- **Must not happen:** Unrelated provider headers must not be dropped.
- **Planned command:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts`.
- **Expected result before the code change:** The command is unavailable because no resolver test exists.
- **First observed run:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts` did not provide a focused test because the package had no test script or test file.
- **Passing rerun:** `pnpm --filter @repo/query-client test` passed the header merge case.

### TEST-API-CLIENT-004: Missing provider rejection

- **Small task:** Reject hook usage without configured provider options.
- **Source:** `getClient` explicitly rejects missing `baseURL`.
- **Test place:** `packages/query-client/src/api-client-context.test.ts` resolver rejection test.
- **Starting state:** No provider options are available and no inline options are supplied.
- **Exact input or fixture:** `undefined` provider options and `undefined` inline options.
- **Interaction steps:** Resolve service options.
- **Main behavior:** Configuration failure is reported before Axios client creation.
- **Expected result:** An error explains that `ApiClientProvider` or inline `ServiceOptions.baseURL` is required.
- **Must change:** Query-client context/resolution implementation.
- **Must not happen:** The code must not create an Axios instance with an undefined base URL.
- **Planned command:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts`.
- **Expected result before the code change:** The command is unavailable because no resolver test exists.
- **First observed run:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts` did not provide a focused test because the package had no test script or test file.
- **Passing rerun:** `pnpm --filter @repo/query-client test` passed the missing-base-URL rejection case.

### TEST-API-CLIENT-005: Query-key option isolation

- **Small task:** Keep query caches separate for different resolved service options.
- **Source:** Existing query hooks include service options in query keys; provider resolution must preserve this behavior.
- **Test place:** `packages/query-client/src/api-client-context.test.ts` query-key/resolution test.
- **Starting state:** Two operations share a resource key but resolve to primary and alternate base URLs.
- **Exact input or fixture:** `https://primary.example.test` and `https://alternate.example.test`.
- **Interaction steps:** Build the query-key option values for both operations and compare them.
- **Main behavior:** Different API targets produce different query-key values.
- **Expected result:** The two query-key option values are not equal.
- **Must change:** Query hook option resolution and query-key construction where required.
- **Must not happen:** Data from one API target must not be reused for the other target.
- **Planned command:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts`.
- **Expected result before the code change:** The command is unavailable because no resolver test exists.
- **First observed run:** `pnpm --filter @repo/query-client test -- api-client-context.test.ts` did not provide a focused test because the package had no test script or test file.
- **Passing rerun:** `pnpm --filter @repo/query-client test` passed the distinct API-target case.

### TEST-API-CLIENT-006: Canonical provider wiring

- **Small task:** Configure the API provider once in web, Next, Expo, and mobile apps.
- **Source:** Existing app providers and validated app environment modules.
- **Test place:** Exact source scan across `apps/{web,next,expo,mobile}` provider and reference files.
- **Starting state:** Consumers construct repeated inline `apiOptions` values.
- **Exact input or fixture:** Each app's existing public API environment variable.
- **Interaction steps:** Scan provider files and consumers after the edit.
- **Main behavior:** Providers pass `options={{ baseURL: ... }}` and consumers omit repeated generic options.
- **Expected result:** All four canonical apps contain provider configuration; generic consumer-level `baseURL` declarations are absent.
- **Must change:** Canonical app providers and consumers.
- **Must not happen:** Apps must not read environment variables directly outside their existing env modules.
- **Planned command:** `rg -n "ApiClientProvider|apiOptions|baseURL:" apps/{web,next,expo,mobile}`.
- **Expected result before the code change:** The scan finds no `ApiClientProvider` wiring and finds repeated `apiOptions` declarations.
- **First observed run:** The source scan found no `ApiClientConfigProvider` wiring and repeated `apiOptions` declarations in all four canonical apps.
- **Passing rerun:** Web, Next, Expo, and mobile typechecks passed with provider-level configuration.

### TEST-API-CLIENT-007: Managed template parity

- **Small task:** Keep generated managed app templates aligned with canonical provider wiring.
- **Source:** Template maintenance convention and canonical app behavior.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js` and exact template source scan.
- **Starting state:** Managed templates repeat `apiOptions` base URLs in consumers.
- **Exact input or fixture:** Managed web, Next, Expo, and mobile providers and reference consumers.
- **Interaction steps:** Run template tests and scan managed files after the edit.
- **Main behavior:** Generated projects receive provider-level API configuration.
- **Expected result:** Template tests pass and each managed frontend configures `ApiClientProvider`.
- **Must change:** Managed template providers and consumers.
- **Must not happen:** Canonical-only changes must not leave generated projects with stale API setup.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Existing template tests pass, but source scan still finds stale inline API options.
- **First observed run:** `pnpm --filter create-mono-stack test` passed the existing 264 template tests before the template edits.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 264 tests after the managed template edits.

### TEST-API-CLIENT-008: Portable skill guidance

- **Small task:** Document provider defaults and inline overrides in the API flow skill.
- **Source:** User request and portable skill synchronization rules.
- **Test place:** `pnpm skills:sync`, `pnpm skills:check`, and exact text scan of the four skill roots.
- **Starting state:** API flow skill does not explain provider-level `ServiceOptions` inheritance.
- **Exact input or fixture:** `skills/end-to-end-api-flow/SKILL.md` and `references/layer-flow.md`.
- **Interaction steps:** Update the canonical skill, synchronize roots, validate hashes, and scan all copies.
- **Main behavior:** Guidance is present and byte-for-byte synchronized.
- **Expected result:** Skill checks pass and all four copies mention provider defaults plus inline base URL overrides.
- **Must change:** Canonical skill documentation and synchronized copies.
- **Must not happen:** Provider-specific frontmatter or divergent skill copies must not be introduced.
- **Planned command:** `pnpm skills:sync && pnpm skills:check`.
- **Expected result before the code change:** The existing skill check passes, but the requested guidance is absent.
- **First observed run:** `pnpm skills:check` passed before the guidance update, while the requested provider guidance was absent.
- **Passing rerun:** `pnpm skills:sync && pnpm skills:check` synchronized and validated all 19 portable skills.

## Task-to-Test Map

- Provider context and option resolver: `TEST-API-CLIENT-001`, `TEST-API-CLIENT-002`, `TEST-API-CLIENT-003`, `TEST-API-CLIENT-004`.
- Query hook integration and cache isolation: `TEST-API-CLIENT-005`.
- Canonical consumer migration: `TEST-API-CLIENT-006`.
- Generated template migration: `TEST-API-CLIENT-007`.
- Skill documentation and synchronization: `TEST-API-CLIENT-008`.

## Implementation Plan

- [ ] Add a pure `ServiceOptions` resolver and `ApiClientProvider` context to `packages/query-client/src/`.
  - [ ] Accept `options: ServiceOptions` on the provider.
  - [ ] Merge provider and inline options, with inline values taking precedence and headers merged.
  - [ ] Reject missing effective `baseURL` with an actionable error.
- [ ] Integrate resolved options into generic and example TanStack hooks.
  - [ ] Preserve resolved options in query keys.
  - [ ] Pass resolved options to every API-client operation used by queries and mutations.
- [ ] Wire provider-level options into canonical app providers and remove repeated generic options from consumers.
- [ ] Apply identical provider wiring to managed reference templates.
- [ ] Update API flow skill guidance and synchronize all skill roots.
- [ ] Run focused tests and affected package, application, skill, formatting, and template checks.

## Validation Notes

- Initial observations: `getClient` requires explicit `baseURL`; query hooks currently pass options through from every consumer; no query-client tests exist.
- First observed run: The focused test command was unavailable before implementation; the first package build after adding JSX also required installing the declared `@types/react`, and formatting reported the lockfile after dependency installation.
- Passing rerun: `pnpm --filter @repo/query-client test` passed 5 resolver tests; query-client and API-client builds, query-client lint/typecheck, all four app typechecks, `pnpm skills:test` (104 tests), `pnpm --filter create-mono-stack test` (264 tests), `pnpm format:check`, `pnpm skills:check`, `git diff --check`, and `just check` passed. The final source scan found only provider-level base URL declarations.

## Non-Goals

- Do not create a global mutable Axios instance.
- Do not move environment access into `@repo/api-client` or `@repo/query-client`.
- Do not change API contracts, endpoints, or backend behavior.

## Risks

- Provider context must remain usable by web, Next, Expo, and React Native builds with the package's existing React peer dependency.
- Query keys must continue separating different API targets after options are resolved from context.
