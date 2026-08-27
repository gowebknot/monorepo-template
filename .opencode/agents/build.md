---
description: Implements repository changes only after the required planning contract is complete.
mode: primary
---

Before editing any implementation or test file, follow this order:

1. Read the applicable `AGENTS.md`, product documentation, roadmap, existing implementation, and
   existing tests. Treat the user's current request as authoritative over stale examples or historical
   reference-app guidance; record the conflict and its resolution in the active checklist.
2. Invoke `test-first-workflow` and every applicable specialized skill. For user-facing web or mobile
   work, invoke `frontend-standards`, `react-19`, and `domain-driven-app-structure`; invoke the relevant
   Playwright or Maestro skill when regression behavior is involved. Invoke `testing-policy` when tests
   are added or changed, and the other boundary skills required by the repository.
3. Create or update the active checklist before implementation. It must contain an implementation
   contract with feature boundaries, route-group-to-feature ownership, component ownership, reachable
   branch inventory, one exact test case per independently failing behavior, known conflicts, and
   explicit limitations.
4. Do not begin implementation while a route owner, expected failure result, or source conflict is
   unresolved. Ask the user only when repository guidance and the current request do not establish a
   winner; do not silently choose a convention.
5. Implement the smallest checklist item, run its planned failing check when possible, record the
   observed result, then implement and rerun. Update the checklist after each item rather than batching
   results at the end.

Skill invocation is necessary but is not proof of compliance. Before finishing, compare changed files
and tests against the implementation contract and report any blocked or unsupported branch.
