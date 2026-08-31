import assert from "node:assert/strict";
import test from "node:test";

import {
  withGitRepository,
  writeChecklist
} from "./test-helpers/implementation-contract-fixture.mjs";
import {
  detectChangeTier,
  formatValidationFailure,
  parseLightAttestation,
  validateActiveChecklist,
  validateImplementationContract
} from "./implementation-contract.mjs";

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

test("TEST-CONTRACT-006 validates an active contract in an isolated Git fixture", async () => {
  await withGitRepository(async (directory) => {
    await writeChecklist(directory, contract());
    const { validateBeforeEdit } =
      await import("#scripts/implementation-contract-gate.mjs");
    await validateBeforeEdit(directory, "scripts/implementation-contract.mjs");
  });
});

const lightAttestationLines = [
  "1. Changes runtime behavior, control flow, or a conditional branch: no",
  "2. Adds or changes an API contract, schema, DTO, validator, or shared type: no",
  "3. Changes a route, navigation, form behavior, or user-facing validation: no",
  "4. Touches authentication, authorization, sessions, roles, permissions, or ownership: no",
  "5. Adds or changes an endpoint, background job, scheduled task, or data migration: no",
  "6. Adds or modifies an e2e/integration/behavior test or any file under apps/playwright or apps/maestro: no",
  "7. Needs more than one small cohesive edit, or is really a large multi-behavior change: no"
];

function lightAttestation({
  lines = lightAttestationLines,
  acceptance,
  validation
} = {}) {
  return [
    "LIGHT-TIER-ATTESTATION",
    ...lines,
    `Acceptance criteria: ${acceptance ?? "raise the dev server port to 4100"}`,
    `Validation: ${validation ?? "pnpm --filter server typecheck -> passes"}`
  ].join("\n");
}

function changeTierChecklist(tier, extra = "") {
  return `# Plan\n\n## Change Tier\n\n- Tier: ${tier}\n${extra}\n`;
}

function largeParent(links) {
  const list = links.map((link) => `- [child](${link})`).join("\n");
  return `# Parent plan\n\n## Change Tier\n\n- Tier: large\n\n## Child Checklists\n\n${list}\n\n## Notes\n\nOne child at a time.\n`;
}

test("TEST-CONTRACT-007 dispatches a checklist with no tier heading to the standard validator", async () => {
  const result = await validateActiveChecklist("# Plan\n");
  assert.equal(result.tier, "standard");
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some((error) => error.includes("Implementation Contract"))
  );
});

test("TEST-CONTRACT-008 keeps the full contract requirement for tier standard", async () => {
  const complete = `${changeTierChecklist("standard")}\n${contract()}`;
  const result = await validateActiveChecklist(complete);
  assert.equal(result.tier, "standard");
  assert.equal(result.valid, true, result.errors.join("; "));
});

test("TEST-CONTRACT-009 rejects a large parent that links only one child", async () => {
  const result = await validateActiveChecklist(
    largeParent(["docs/checklists/child-a.md"])
  );
  assert.equal(result.tier, "large");
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some((error) =>
      error.includes("at least two child checklists")
    )
  );
});

test("TEST-CONTRACT-010 accepts a large parent whose two children each carry a contract", async () => {
  const fakeReader = async () => "child\n\n## Implementation Contract\n";
  const result = await validateActiveChecklist(
    largeParent(["docs/checklists/child-a.md", "docs/checklists/child-b.md"]),
    { cwd: "/repo", readFile: fakeReader }
  );
  assert.equal(result.tier, "large");
  assert.equal(result.valid, true, result.errors.join("; "));
});

test("TEST-CONTRACT-011 rejects a large parent whose linked child is missing", async () => {
  const fakeReader = async (path) => {
    if (path.endsWith("child-a.md"))
      return "child\n\n## Implementation Contract\n";
    throw new Error("ENOENT");
  };
  const result = await validateActiveChecklist(
    largeParent(["docs/checklists/child-a.md", "docs/checklists/child-b.md"]),
    { cwd: "/repo", readFile: fakeReader }
  );
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some(
      (error) =>
        error.includes("child-b.md") && error.includes("does not exist")
    )
  );
});

test("TEST-CONTRACT-012 rejects a checklist file that declares tier light", async () => {
  const result = await validateActiveChecklist(changeTierChecklist("light"));
  assert.equal(result.tier, "light");
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some((error) =>
      error.includes("must not create a checklist file")
    )
  );
});

test("TEST-CONTRACT-013 returns undefined when the transcript has no attestation", () => {
  assert.equal(parseLightAttestation(""), undefined);
  assert.equal(
    parseLightAttestation("some unrelated planning text"),
    undefined
  );
  assert.equal(parseLightAttestation(42), undefined);
});

test("TEST-CONTRACT-014 recognizes a complete light attestation", () => {
  assert.equal(parseLightAttestation(lightAttestation()), "light");
});

test("TEST-CONTRACT-015 rejects a light attestation with one answer yes", () => {
  const lines = [...lightAttestationLines];
  lines[2] = lines[2].replace(/: no$/, ": yes");
  assert.equal(parseLightAttestation(lightAttestation({ lines })), undefined);
});

test("TEST-CONTRACT-015b rejects a light attestation missing the validation line", () => {
  const text = lightAttestation().replace(/\nValidation: .*/, "");
  assert.equal(parseLightAttestation(text), undefined);
});

test("TEST-CONTRACT-016 keeps the last tier declaration when several appear", () => {
  const standardThenLight = `Change tier: standard\n\n${lightAttestation()}`;
  assert.equal(parseLightAttestation(standardThenLight), "light");
  const lightThenStandard = `${lightAttestation()}\n\nChange tier: standard`;
  assert.equal(parseLightAttestation(lightThenStandard), undefined);
});

test("TEST-CONTRACT-017 labels the failure message by tier", () => {
  assert.match(
    formatValidationFailure({
      tier: "large",
      errors: ["missing ## Child Checklists"]
    }),
    /^Large-tier checklist is incomplete/
  );
  assert.match(
    formatValidationFailure({
      tier: "standard",
      errors: ["missing ### User Journey"]
    }),
    /^Implementation contract is incomplete/
  );
  assert.match(
    formatValidationFailure({ errors: ["missing ### User Journey"] }),
    /^Implementation contract is incomplete/
  );
});

test("TEST-CONTRACT-018 does not treat the committed light template as an attestation", async () => {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const templatePath = fileURLToPath(
    new URL(
      "../skills/test-first-workflow/templates/light-change-record.md",
      import.meta.url
    )
  );
  const template = await readFile(templatePath, "utf8");
  assert.equal(parseLightAttestation(template), undefined);
});

test("TEST-CONTRACT-020 recognizes an attestation inside a JSON-encoded transcript line", () => {
  const jsonLine = JSON.stringify({
    type: "assistant",
    message: { content: [{ type: "text", text: lightAttestation() }] }
  });
  assert.equal(parseLightAttestation(jsonLine), "light");
  const withYes = JSON.stringify({
    text: lightAttestation({
      lines: lightAttestationLines.map((line, index) =>
        index === 5 ? line.replace(/: no$/, ": yes") : line
      )
    })
  });
  assert.equal(parseLightAttestation(withYes), undefined);
});

test("TEST-CONTRACT-019 detectChangeTier defaults to standard and reads the heading", () => {
  assert.equal(detectChangeTier("# Plan\n"), "standard");
  assert.equal(detectChangeTier(changeTierChecklist("light")), "light");
  assert.equal(detectChangeTier(changeTierChecklist("large")), "large");
});
