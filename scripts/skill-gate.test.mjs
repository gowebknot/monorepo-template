import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  collectRequired,
  evaluate,
  parseInvokedSkills
} from "./skill-gate.mjs";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const triggers = {
  always: ["test-first-workflow"],
  rules: [
    {
      when: ["**/*.test.*", "**/*.spec.*", "**/test/**", "**/tests/**"],
      require: ["testing-policy"]
    },
    {
      when: ["packages/entities/**", "**/*.dto.*", "**/*.schema.*"],
      require: ["contract-validation"]
    },
    {
      when: ["packages/api-client/**"],
      require: ["end-to-end-api-flow", "contract-validation"]
    },
    {
      when: ["packages/query-client/**"],
      require: ["end-to-end-api-flow"]
    },
    { when: ["apps/server/**"], require: ["backend-standards"] },
    {
      when: ["apps/web/**", "apps/next/**", "apps/expo/**", "apps/mobile/**"],
      require: ["frontend-standards"]
    },
    { when: ["**/*.tsx", "**/*.jsx"], require: ["react-19"] }
  ],
  exempt: [
    "docs/checklists/**",
    ".claude/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/.turbo/**"
  ]
};

function decide(overrides) {
  return evaluate({
    filePath: "scripts/skill-gate.mjs",
    permissionMode: "default",
    invokedSkills: [],
    triggers,
    env: {},
    ...overrides
  });
}

test("TEST-GATE-001 denies a source edit when no skill was invoked", () => {
  const result = decide({ invokedSkills: [] });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("test-first-workflow"));
});

test("TEST-GATE-002 denies an apps/server edit missing backend-standards", () => {
  const result = decide({
    filePath: "apps/server/src/app.controller.ts",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("backend-standards"));
  assert.ok(!result.missing.includes("test-first-workflow"));
});

test("TEST-GATE-003 allows an apps/server edit with all required skills", () => {
  const result = decide({
    filePath: "apps/server/src/app.controller.ts",
    invokedSkills: ["test-first-workflow", "backend-standards"]
  });
  assert.equal(result.allow, true);
  assert.deepEqual(result.missing, []);
});

test("TEST-GATE-004 denies an apps/web .tsx edit missing react-19 (rule union)", () => {
  const result = decide({
    filePath: "apps/web/src/components/Card.tsx",
    invokedSkills: ["test-first-workflow", "frontend-standards"]
  });
  assert.equal(result.allow, false);
  assert.deepEqual(result.missing, ["react-19"]);
});

test("TEST-GATE-005 allows an apps/web .tsx edit with all required skills", () => {
  const result = decide({
    filePath: "apps/web/src/components/Card.tsx",
    invokedSkills: ["test-first-workflow", "frontend-standards", "react-19"]
  });
  assert.equal(result.allow, true);
  assert.deepEqual(result.missing, []);
});

test("TEST-GATE-006 denies a test-file edit missing testing-policy", () => {
  const result = decide({
    filePath: "packages/db/src/foo.test.ts",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("testing-policy"));
});

test("TEST-GATE-007 denies a packages/entities edit missing contract-validation", () => {
  const result = decide({
    filePath: "packages/entities/src/user.ts",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("contract-validation"));
});

test("TEST-GATE-020 denies an API-client edit missing boundary skills", () => {
  const result = decide({
    filePath: "packages/api-client/src/users.ts",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("end-to-end-api-flow"));
  assert.ok(result.missing.includes("contract-validation"));
});

test("TEST-GATE-021 denies a query-client edit missing API-flow skill", () => {
  const result = decide({
    filePath: "packages/query-client/src/users.ts",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("end-to-end-api-flow"));
  assert.ok(!result.missing.includes("frontend-standards"));
});

test("TEST-GATE-022 covers canonical frontend paths", () => {
  for (const filePath of [
    "apps/web/src/App.tsx",
    "apps/next/src/app/page.tsx",
    "apps/expo/App.tsx",
    "apps/mobile/App.tsx"
  ]) {
    const result = decide({
      filePath,
      invokedSkills: ["test-first-workflow", "react-19"]
    });
    assert.equal(result.allow, false, filePath);
    assert.deepEqual(result.missing, ["frontend-standards"], filePath);
  }
});

test("TEST-GATE-008 allows any edit in plan mode", () => {
  const result = decide({
    filePath: "apps/server/src/x.ts",
    permissionMode: "plan",
    invokedSkills: []
  });
  assert.equal(result.allow, true);
});

test("TEST-GATE-009 allows edits to docs/checklists (exempt)", () => {
  const result = decide({
    filePath: "docs/checklists/2026-08-15-x.md",
    invokedSkills: []
  });
  assert.equal(result.allow, true);
});

test("TEST-GATE-010 allows any edit when SKILL_GATE_DISABLE is set", () => {
  const result = decide({
    filePath: "apps/server/src/x.ts",
    invokedSkills: [],
    env: { SKILL_GATE_DISABLE: "1" }
  });
  assert.equal(result.allow, true);
});

test("TEST-GATE-011 allows edits under .claude (exempt)", () => {
  const result = decide({
    filePath: ".claude/skill-triggers.json",
    invokedSkills: []
  });
  assert.equal(result.allow, true);
});

test("TEST-GATE-012 allows when there is no file path to gate", () => {
  const result = decide({ filePath: undefined, invokedSkills: [] });
  assert.equal(result.allow, true);
});

test("TEST-GATE-013 allows a plain source edit once test-first-workflow is invoked", () => {
  const result = decide({
    filePath: "scripts/update-template.mjs",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, true);
  assert.deepEqual(result.missing, []);
});

test("TEST-GATE-014 parseInvokedSkills collects every Skill call", () => {
  const text = [
    '{"type":"tool_use","id":"a","name":"Skill","input":{"skill":"test-first-workflow"}}',
    '{"type":"tool_use","id":"b","name":"Skill","input":{"skill":"testing-policy"}}'
  ].join("\n");
  const invoked = parseInvokedSkills(text);
  assert.ok(invoked.has("test-first-workflow"));
  assert.ok(invoked.has("testing-policy"));
  assert.equal(invoked.size, 2);
});

test("TEST-GATE-015 parseInvokedSkills is empty without any Skill call", () => {
  const text =
    '{"type":"tool_use","name":"Write","input":{"file_path":"a.ts"}}';
  assert.equal(parseInvokedSkills(text).size, 0);
});

test("TEST-GATE-016 parseInvokedSkills tolerates blank and non-JSON lines", () => {
  const text = [
    "",
    "not json at all",
    '{"type":"tool_use","name":"Skill","input":{"skill":"test-first-workflow"}}'
  ].join("\n");
  let invoked;
  assert.doesNotThrow(() => {
    invoked = parseInvokedSkills(text);
  });
  assert.deepEqual([...invoked], ["test-first-workflow"]);
});

test("TEST-GATE-017 skill-triggers.json only names real skills", async () => {
  const raw = await readFile(
    join(repositoryRoot, ".claude/skill-triggers.json"),
    "utf8"
  );
  const table = JSON.parse(raw);
  const skillDirs = new Set(
    (await readdir(join(repositoryRoot, "skills"), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );
  const named = [
    ...(table.always ?? []),
    ...(table.rules ?? []).flatMap((rule) => rule.require ?? [])
  ];
  assert.ok(named.length > 0);
  for (const name of named) {
    assert.ok(skillDirs.has(name), `skill "${name}" has no skills/ directory`);
  }
});

test("TEST-GATE-024 canonical trigger table covers the API chain", async () => {
  const raw = await readFile(
    join(repositoryRoot, ".claude/skill-triggers.json"),
    "utf8"
  );
  const table = JSON.parse(raw);
  const requiredFor = (filePath) =>
    collectRequired(filePath, table).filter(
      (skill) => skill !== "test-first-workflow"
    );

  assert.deepEqual(
    requiredFor("packages/api-client/src/users.ts").sort(),
    ["contract-validation", "end-to-end-api-flow"].sort()
  );
  assert.deepEqual(requiredFor("packages/query-client/src/users.ts"), [
    "end-to-end-api-flow"
  ]);
  for (const filePath of [
    "apps/web/src/App.tsx",
    "apps/next/src/app/page.tsx",
    "apps/expo/App.tsx",
    "apps/mobile/App.tsx"
  ]) {
    assert.ok(requiredFor(filePath).includes("frontend-standards"), filePath);
  }
});

test("TEST-GATE-018 settings.json registers the PreToolUse gate", async () => {
  const raw = await readFile(
    join(repositoryRoot, ".claude/settings.json"),
    "utf8"
  );
  const settings = JSON.parse(raw);
  const preToolUse = settings.hooks?.PreToolUse ?? [];
  const gate = preToolUse.find((entry) =>
    (entry.hooks ?? []).some((hook) =>
      /skill-gate\.mjs/.test(hook.command ?? "")
    )
  );
  assert.ok(gate, "no PreToolUse hook references skill-gate.mjs");
  for (const tool of ["Edit", "Write", "MultiEdit"]) {
    assert.match(gate.matcher, new RegExp(tool));
  }
});

test("TEST-GATE-019 deny reason names missing skills and rejects the context excuse", () => {
  const result = decide({
    filePath: "apps/server/src/app.controller.ts",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.match(result.reason, /backend-standards/);
  assert.match(result.reason, /not an exemption/i);
});

test("collectRequired unions the always list with matching rules", () => {
  const required = collectRequired(
    "apps/web/src/components/Card.tsx",
    triggers
  );
  assert.ok(required.includes("test-first-workflow"));
  assert.ok(required.includes("frontend-standards"));
  assert.ok(required.includes("react-19"));
});
