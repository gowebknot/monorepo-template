import assert from "node:assert/strict";
import test from "node:test";

import { validateBeforeEdit } from "../.opencode/plugins/implementation-contract-gate.js";
import { validateImplementationContract } from "./implementation-contract.mjs";

function contract({
  matrix,
  conflicts = "- Conflict: None found after checking the request and repository guidance."
} = {}) {
  return `# Feature Plan

## Implementation Contract

### Feature Boundaries

- Included product behavior: authentication
- Excluded behavior and non-goals: account recovery
- Shared, app-wide, and feature-owned boundaries: shared API client, auth feature

### Route-Group Ownership

| Route group | Entry routes | Owning feature | App-wide composition |
| ----------- | ------------ | -------------- | -------------------- |
| (auth) | /sign-in | features/auth | app shell |

### User Journey

1. Entry point: sign-in route
2. User actions: enter credentials and submit
3. Visible success result: dashboard
4. Loading and empty states: submit pending
5. Failure and recovery states: error message and retry
6. Final navigation or exit: dashboard or remain on sign-in

### Complete Test Matrix

| Test ID | User intent | Path | Exact expected result | Test place | Limitation |
| ------- | ----------- | ---- | --------------------- | ---------- | ---------- |
${matrix ?? "| TEST-AUTH-001 | Sign in | valid credentials happy path | Dashboard is shown | E2E | None |\n| TEST-AUTH-002 | Sign in | invalid credentials non-happy path | Error remains visible and no redirect | E2E | None |"}

### Unresolved Conflicts

${conflicts}
`;
}

test("TEST-CONTRACT-001 rejects a missing implementation contract", () => {
  const result = validateImplementationContract(
    "# Plan\n\n## Exact Test Cases\n"
  );
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some((error) => error.includes("Implementation Contract"))
  );
});

test("TEST-CONTRACT-002 rejects missing route ownership and user journey", () => {
  const result = validateImplementationContract(
    contract()
      .replace("### Route-Group Ownership", "### Route Ownership Removed")
      .replace("### User Journey", "### Journey Removed")
  );
  assert.ok(
    result.errors.some((error) => error.includes("Route-Group Ownership"))
  );
  assert.ok(result.errors.some((error) => error.includes("User Journey")));
});

test("TEST-CONTRACT-003 rejects happy-path-only coverage", () => {
  const result = validateImplementationContract(
    contract({
      matrix:
        "| TEST-AUTH-001 | Sign in | valid credentials happy path | Dashboard is shown | E2E | None |"
    })
  );
  assert.ok(result.errors.some((error) => error.includes("non-happy")));
});

test("TEST-CONTRACT-004 rejects incomplete rows and blocking conflicts", () => {
  const result = validateImplementationContract(
    contract({
      matrix:
        "| TEST-AUTH-002 | Sign in | invalid credentials non-happy path |  | E2E | None |",
      conflicts:
        "- Conflict: roadmap and existing code disagree.\n- Status: blocked"
    })
  );
  assert.ok(result.errors.some((error) => error.includes("row")));
  assert.ok(
    result.errors.some((error) => error.includes("blocking conflicts"))
  );
});

test("TEST-CONTRACT-005 accepts complete coverage with explicit limitations", () => {
  const result = validateImplementationContract(
    {
      toString: () =>
        contract({
          matrix:
            "| TEST-AUTH-001 | Sign in | valid credentials happy path | Dashboard is shown | E2E | None |\n| TEST-AUTH-002 | Sign in | invalid credentials non-happy path | Error remains visible | E2E | None |\n| TEST-AUTH-003 | Sign in | device offline retry | Retry is available | Maestro | Device unavailable in CI |"
        })
    }.toString()
  );
  assert.equal(result.valid, true, result.errors.join("; "));
});

test("TEST-CONTRACT-006 allows the OpenCode hook with the active contract", async () => {
  await validateBeforeEdit(
    process.cwd(),
    "scripts/implementation-contract.mjs"
  );
});
