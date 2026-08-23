# Commit Message Length And Description Guidance

## Checklist ID

`CHECKLIST-COMMIT-MESSAGE-LENGTH-2026-08-23`

## Scope

Increase commitlint's Conventional Commit subject limit to 120 characters and body line limit to 700
characters. Document the limits and require a detailed commit body in the root agent guidance and the
portable release skill.

## Acceptance Criteria

- [x] `commitlint.config.cjs` allows valid Conventional Commit headers through 120 characters.
- [x] `commitlint.config.cjs` allows commit body lines through 700 characters.
- [x] Headers over 120 characters remain rejected.
- [x] Body lines over 700 characters remain rejected.
- [x] `AGENTS.md` documents the subject and body limits and requires a detailed body.
- [x] `release-flow` documents the same commit-body convention.
- [x] All synchronized `release-flow` skill roots remain identical.

## Exact Test Cases

### TEST-COMMIT-001: Maximum valid subject length

- **Small task:** Increase the Conventional Commit subject limit.
- **Source:** User request to increase the default Conventional Commit limit.
- **Test place:** Commitlint CLI using a generated message fixture.
- **Starting state:** Conventional Commit defaults reject headers longer than 100 characters.
- **Exact input or fixture:** A valid `chore(scope):` header exactly 120 characters long.
- **Interaction steps:** Pass the message to commitlint after configuration is updated.
- **Main behavior:** The configured maximum subject length is accepted.
- **Expected result:** Commitlint exits successfully.
- **Must change:** The configured `header-max-length` rule.
- **Must not happen:** Type, scope, or subject format validation is disabled.
- **Planned command:** `printf '%s\n' '<120-character valid header>' | pnpm exec commitlint`
- **Expected result before the code change:** Commitlint rejects the 120-character header because the
  inherited default limit is shorter.
- **First observed run:** Commitlint rejected the 120-character header with `header-max-length`,
  reporting the inherited 100-character limit.
- **Passing rerun:** Commitlint accepted the valid 120-character header.

### TEST-COMMIT-002: Maximum valid body line length

- **Small task:** Increase the commit body line limit.
- **Source:** User request to allow a 700-character commit body line.
- **Test place:** Commitlint CLI using a generated message fixture.
- **Starting state:** Conventional Commit defaults reject sufficiently long body lines.
- **Exact input or fixture:** A valid subject followed by a body line exactly 700 characters long.
- **Interaction steps:** Pass the message to commitlint after configuration is updated.
- **Main behavior:** The configured maximum body line length is accepted.
- **Expected result:** Commitlint exits successfully.
- **Must change:** The configured `body-max-line-length` rule.
- **Must not happen:** The total body is incorrectly treated as a single mandatory 700-character field.
- **Planned command:** `printf '%s\n' '<valid subject>' '' '<700-character body line>' | pnpm exec commitlint`
- **Expected result before the code change:** Commitlint rejects the 700-character body line under the
  inherited default limit.
- **First observed run:** Commitlint rejected the 700-character body line with `body-max-line-length`,
  reporting the inherited 100-character limit.
- **Passing rerun:** Commitlint accepted the valid 700-character body line.

### TEST-COMMIT-003: Rejection boundaries

- **Small task:** Preserve rejection immediately above both configured limits.
- **Source:** Commitlint configuration and boundary validation policy.
- **Test place:** Commitlint CLI using generated message fixtures.
- **Starting state:** Configuration limits are 120 for headers and 700 for body lines.
- **Exact input or fixture:** A valid header of 121 characters and a valid message with a 701-character
  body line.
- **Interaction steps:** Run commitlint separately for each fixture.
- **Main behavior:** Invalid length boundaries are rejected.
- **Expected result:** Both commitlint invocations exit nonzero with the relevant length error.
- **Must change:** No additional rule relaxation beyond the requested limits.
- **Must not happen:** Overlong headers or body lines pass because of a disabled rule.
- **Planned command:** `pnpm exec commitlint` for each generated boundary fixture.
- **Expected result before the code change:** Both inputs are rejected, potentially with the inherited
  limit rather than the new boundary.
- **First observed run:** Pending boundary validation before the configuration change.
- **Passing rerun:** Commitlint rejected the 121-character header with `header-max-length` and the
  701-character body line with `body-max-line-length`.

### TEST-COMMIT-004: Guidance and skill synchronization

- **Small task:** Document the commit format and synchronize the portable skill.
- **Source:** User request and repository four-root skill synchronization rule.
- **Test place:** Exact text scan, `pnpm skills:check`, and `pnpm format:check`.
- **Starting state:** `AGENTS.md` and `release-flow` do not specify the requested limits or detailed body
  requirement.
- **Exact input or fixture:** Guidance mentions a 120-character subject, a 700-character body line,
  a blank line, what/why/impact/validation details, and synchronized skill copies.
- **Interaction steps:** Inspect the edited documents and run synchronization and formatting checks.
- **Main behavior:** Agents receive consistent commit-message instructions.
- **Expected result:** Text is present, all skill roots validate, and formatting passes.
- **Must change:** `AGENTS.md`, canonical `release-flow`, synchronized copies, and sync metadata.
- **Must not happen:** Package dependencies or unrelated skills change.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm format:check`
- **Expected result before the code change:** The new guidance and synchronized content are absent.
- **First observed run:** The initial skill/documentation state did not contain the new limits.
- **Passing rerun:** `pnpm skills:sync`, `pnpm skills:check`, and `pnpm format:check` passed; exact
  scans confirmed the 120/700 limits and detailed-body requirements.

## Validation Notes

- The first `pnpm format:check` run failed only because Prettier needed to wrap the new checklist
  content. Prettier was run on the checklist, and the check was rerun successfully.

## Implementation Plan

1. [x] Add explicit `header-max-length: 120` and `body-max-line-length: 700` rules to
       `commitlint.config.cjs` while retaining the conventional preset.
2. [x] Update `AGENTS.md` with the required commit subject/body format and limits.
3. [x] Update canonical `skills/release-flow/SKILL.md` with the same guidance.
4. [x] Run `pnpm skills:sync` and validate all four skill roots.
5. [x] Run focused commitlint boundary cases, `pnpm skills:test`, and `pnpm format:check`.

## Risks

- A 700-character body limit applies per line, not to the total body; the documentation must make that
  distinction explicit.
- Raising the header limit should not encourage vague subjects; the body remains mandatory for
  meaningful context.
