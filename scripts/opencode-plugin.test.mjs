import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

import {
  extractPatchPaths,
  getToolPaths
} from "./implementation-contract-gate.mjs";
import {
  withGitRepository,
  writeChecklist
} from "./test-helpers/implementation-contract-fixture.mjs";

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

test("TEST-OPENCODE-010 rejects an apply_patch without a path", () => {
  assert.throws(
    () =>
      getToolPaths("apply_patch", {
        patchText: "*** Begin Patch\n*** End Patch"
      }),
    /apply_patch did not contain a file path/
  );
});
