---
name: release-flow
description: "Use when preparing a release, version change, changelog, release notes, migration, deprecation, package publication, or deployment handoff. Determine the complete code, contract, dependency, environment, database, security, and operational impact; preserve semantic versioning and repository release conventions; document user-visible effects and required actions; and verify the release artifact before publishing or handing it to deployment."
---

# Release Flow

Prepare releases as verified, explainable changes rather than as version-only edits.

## Impact Review

1. Inspect the commits, diff, package manifests, generated artifacts, and current release metadata.
2. Identify public API, contract, database, migration, configuration, environment, dependency,
   security, observability, and operational changes.
3. Determine whether the change is breaking, additive, corrective, or internal.
4. Check required migration order, rollout sequencing, feature flags, backfills, compatibility windows,
   deprecations, and rollback constraints.

## Versioning and Notes

- Follow the repository's versioning policy and package ownership boundaries.
- Use semantic versioning only when the project treats the artifact as a semantic-versioned package.
- Write release notes for users and operators, not just implementation details.
- Include behavior changes, breaking changes, fixes, security notes, migrations, configuration changes,
  dependency requirements, known limitations, and required follow-up actions.
- Do not include secrets, private URLs, customer data, or unverifiable claims.

## Commit Messages

- Use a valid Conventional Commit subject in the form `<type>(<scope>): <subject>` with an allowed
  repository type. Subjects may be up to 120 characters, but keep them specific and concise.
- Add a blank line followed by a detailed body to every intentional commit. Body lines may be up to
  700 characters; this is a per-line limit, not a total body limit.
- Explain what changed and why, then include relevant user-visible, compatibility, migration, security,
  operational, or release impact and the validation or tests performed.
- Keep the body factual and useful. Do not include secrets, unverifiable claims, or filler.

## Verification

- Run the repository's required build, typecheck, lint, test, format, package, and artifact checks.
- Confirm generated files and package exports are current.
- Verify migrations are reversible or document the irreversible step and recovery plan.
- Verify changelog and release notes match the actual diff.
- Confirm the release can be reproduced from the intended commit and clean working tree.
- **Never use `--no-verify`, `--no-hooks`, `HUSKY=0`, skipped hooks, or disabled checks.** Fix the
  underlying failure instead.
- **Never commit, amend, push, force-push, tag, publish, release, or deploy without explicit user
  permission for that specific action.** Permission to prepare a release does not authorize execution.
