import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import {
  extractPatchPaths,
  getToolPaths
} from "./implementation-contract-gate.mjs";
import {
  fakeClient,
  withGitRepository,
  writeChecklist
} from "./test-helpers/implementation-contract-fixture.mjs";

const lightAttestation = [
  "LIGHT-TIER-ATTESTATION",
  "1. Changes runtime behavior, control flow, or a conditional branch: no",
  "2. Adds or changes an API contract, schema, DTO, validator, or shared type: no",
  "3. Changes a route, navigation, form behavior, or user-facing validation: no",
  "4. Touches authentication, authorization, sessions, roles, permissions, or ownership: no",
  "5. Adds or changes an endpoint, background job, scheduled task, or data migration: no",
  "6. Adds or modifies an e2e/integration/behavior test or any file under apps/playwright or apps/maestro: no",
  "7. Needs more than one small cohesive edit, or is really a large multi-behavior change: no",
  "Acceptance criteria: raise the dev server port to 4100",
  "Validation: pnpm --filter server typecheck -> passes"
].join("\n");

const pluginModule = await import(
  new URL(
    "../.opencode/plugins/implementation-contract-gate.js",
    import.meta.url
  )
);

const validChecklist = `# Plan

## Implementation Contract

### Feature Boundaries

- Included product behavior: implementation contract gate
- Excluded behavior and non-goals: unrelated runtime behavior
- Shared, app-wide, and feature-owned boundaries: shared validator and OpenCode adapter

### Route-Group Ownership

| Route group | Entry routes | Owning feature | App-wide composition |
| ----------- | ------------ | -------------- | -------------------- |
| (tooling) | edit | contract gate | OpenCode |

### User Journey

1. Entry point: OpenCode implementation request
2. User actions: plan and edit
3. Visible success result: edit proceeds
4. Loading and empty states: checklist discovery
5. Failure and recovery states: rejection with a reason
6. Final navigation or exit: continue implementation

### Complete Test Matrix

| Test ID | User intent | Path | Exact expected result | Test place | Limitation |
| --------- | ----------- | ---- | --------------------- | ---------- | ---------- |
| TEST-OPENCODE-001 | Edit | valid happy path | Edit proceeds | plugin test | None |
| TEST-OPENCODE-002 | Edit | missing contract non-happy path | Edit is rejected | plugin test | None |

### Unresolved Conflicts

- Conflict: None found after checking repository guidance.
`;

const validChecklistWithRelated = validChecklist.replace(
  "## Implementation Contract",
  "Related checklists:\n- docs/checklists/previous.md\n\n## Implementation Contract"
);

async function invokeTool(directory, tool, args) {
  const hooks = await pluginModule.default({ directory });
  return hooks["tool.execute.before"](
    { callID: "call", sessionID: "session", tool },
    { args }
  );
}

test("TEST-OPENCODE-001 exports one plugin and returns its hooks", async () => {
  assert.deepEqual(Object.keys(pluginModule), ["default"]);
  const hooks = await pluginModule.default({ directory: process.cwd() });
  assert.equal(typeof hooks, "object");
  assert.equal(typeof hooks["tool.execute.before"], "function");
});

test("TEST-OPENCODE-002 allows a valid edit using output args", async () => {
  await withGitRepository(async (directory) => {
    await writeChecklist(directory, validChecklist);
    const hooks = await pluginModule.default({ directory });
    await hooks["tool.execute.before"](
      { callID: "read", sessionID: "session", tool: "read" },
      { args: { filePath: join(directory, "docs/checklists/plan.md") } }
    );
    await hooks["tool.execute.before"](
      { callID: "edit", sessionID: "session", tool: "edit" },
      { args: { filePath: "src/example.ts" } }
    );
  });
});

test("TEST-CHECKLIST-004 rejects an implementation edit before checklist reads", async () => {
  await withGitRepository(async (directory) => {
    await writeChecklist(directory, validChecklist);
    await assert.rejects(
      invokeTool(directory, "edit", { filePath: "src/example.ts" }),
      /Checklist gate:.*plan\.md/
    );
  });
});

test("TEST-CHECKLIST-005 allows an implementation edit after checklist reads", async () => {
  await withGitRepository(async (directory) => {
    await writeChecklist(directory, "# Previous checklist\n", "previous.md");
    await writeChecklist(directory, validChecklistWithRelated);
    const hooks = await pluginModule.default({ directory });
    await hooks["tool.execute.before"](
      { callID: "read", sessionID: "session", tool: "read" },
      { args: { filePath: "docs/checklists/plan.md" } }
    );
    await hooks["tool.execute.before"](
      { callID: "read", sessionID: "session", tool: "read" },
      { args: { filePath: "docs/checklists/previous.md" } }
    );
    await hooks["tool.execute.before"](
      { callID: "edit", sessionID: "session", tool: "edit" },
      { args: { filePath: "src/example.ts" } }
    );
  });
});

test("TEST-OPENCODE-003 rejects an invalid edit using output args", async () => {
  await withGitRepository(async (directory) => {
    await writeChecklist(directory, "# Plan\n");
    await assert.rejects(
      invokeTool(directory, "edit", { filePath: "src/example.ts" }),
      /Implementation contract is incomplete/
    );
  });
});

test("TEST-OPENCODE-004 rejects an invalid write using output args", async () => {
  await withGitRepository(async (directory) => {
    await writeChecklist(directory, "# Plan\n");
    await assert.rejects(
      invokeTool(directory, "write", { filePath: "src/example.ts" }),
      /Implementation contract is incomplete/
    );
  });
});

test("TEST-OPENCODE-005 rejects an implementation edit without an active checklist", async () => {
  await withGitRepository(async (directory) => {
    await assert.rejects(
      invokeTool(directory, "edit", { filePath: "src/example.ts" }),
      /no active checklist/
    );
  });
});

test("TEST-OPENCODE-006 allows checklist edits without an active checklist", async () => {
  await withGitRepository(async (directory) => {
    await invokeTool(directory, "edit", {
      filePath: "docs/checklists/new-plan.md"
    });
  });
});

test("TEST-OPENCODE-007 rejects a single-file apply_patch without an active checklist", async () => {
  await withGitRepository(async (directory) => {
    await assert.rejects(
      invokeTool(directory, "apply_patch", {
        patchText:
          "*** Begin Patch\n*** Update File: src/example.ts\n*** End Patch"
      }),
      /no active checklist/
    );
  });
});

test("TEST-OPENCODE-008 rejects a mixed apply_patch containing an implementation path", async () => {
  await withGitRepository(async (directory) => {
    await assert.rejects(
      invokeTool(directory, "apply_patch", {
        patchText:
          "*** Begin Patch\n*** Add File: docs/checklists/new-plan.md\n*** Update File: src/example.ts\n*** End Patch"
      }),
      /no active checklist/
    );
  });
});

test("TEST-OPENCODE-009 extracts every documented apply_patch marker", () => {
  assert.deepEqual(
    extractPatchPaths(
      "*** Begin Patch\n*** Add File: src/added.ts\n*** Update File: src/updated.ts\n*** Delete File: src/deleted.ts\n*** Move to: src/moved.ts\n*** End Patch"
    ),
    ["src/added.ts", "src/updated.ts", "src/deleted.ts", "src/moved.ts"]
  );
});

test("TEST-OPENCODE-011 allows a light-attestation edit read from session messages", async () => {
  await withGitRepository(async (directory) => {
    const hooks = await pluginModule.default({
      directory,
      client: fakeClient(lightAttestation)
    });
    await hooks["tool.execute.before"](
      { callID: "edit", sessionID: "session", tool: "edit" },
      { args: { filePath: "src/example.ts" } }
    );
  });
});

test("TEST-OPENCODE-012 rejects a malformed light attestation from session messages", async () => {
  await withGitRepository(async (directory) => {
    const malformed = lightAttestation.replace(
      "or apps/maestro: no",
      "or apps/maestro: yes"
    );
    const hooks = await pluginModule.default({
      directory,
      client: fakeClient(malformed)
    });
    await assert.rejects(
      hooks["tool.execute.before"](
        { callID: "edit", sessionID: "session", tool: "edit" },
        { args: { filePath: "src/example.ts" } }
      ),
      /no active checklist/
    );
  });
});

test("TEST-OPENCODE-013 still requires a checklist when the session has no attestation", async () => {
  await withGitRepository(async (directory) => {
    const hooks = await pluginModule.default({
      directory,
      client: fakeClient([])
    });
    await assert.rejects(
      hooks["tool.execute.before"](
        { callID: "edit", sessionID: "session", tool: "edit" },
        { args: { filePath: "src/example.ts" } }
      ),
      /no active checklist/
    );
  });
});

test("TEST-OPENCODE-014 validateBeforeEdit accepts a light attestation argument", async () => {
  const { validateBeforeEdit } =
    await import("#scripts/implementation-contract-gate.mjs");
  await withGitRepository(async (directory) => {
    await validateBeforeEdit(directory, "src/example.ts", lightAttestation);
  });
});

test("TEST-OPENCODE-010 rejects an apply_patch without a path", () => {
  assert.throws(
    () =>
      getToolPaths("apply_patch", {
        patchText: "*** Begin Patch\n*** End Patch"
      }),
    /apply_patch did not contain a file path/
  );
});

test("TEST-OPENCODE-015 enforces Claude skill triggers for OpenCode edits", async () => {
  await withGitRepository(async (directory) => {
    await writeChecklist(directory, validChecklist);
    await mkdir(join(directory, ".claude"), { recursive: true });
    await writeFile(
      join(directory, ".claude", "skill-triggers.json"),
      JSON.stringify({
        always: ["test-first-workflow"],
        rules: [
          {
            when: ["apps/server/**"],
            require: ["backend-standards", "contract-validation"]
          }
        ],
        exempt: ["docs/checklists/**"]
      })
    );
    const hooks = await pluginModule.default({
      directory,
      client: fakeClient('{"skill":"test-first-workflow"}')
    });
    await hooks["tool.execute.before"](
      { callID: "read", sessionID: "session", tool: "read" },
      { args: { filePath: "docs/checklists/plan.md" } }
    );
    await assert.rejects(
      hooks["tool.execute.before"](
        { callID: "edit", sessionID: "session", tool: "edit" },
        { args: { filePath: "apps/server/src/example.controller.ts" } }
      ),
      /backend-standards.*contract-validation/
    );
  });
});
