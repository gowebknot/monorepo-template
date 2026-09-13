import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  collectRequired,
  evaluate,
  parseInvokedSkills,
  parseReadPaths
} from "./skill-gate.mjs";
import { readStackConfig } from "#scripts/stack-config.mjs";

const { extractChecklistReferences } = await import(
  new URL("./implementation-contract.mjs", import.meta.url)
);

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

// A generated project can rename any web-vite/web-next/mobile-expo/mobile-react-native/api-nest app
// away from its canonical default (scripts/stack-config.mjs only requires path === `apps/${name}`),
// and .claude/skill-triggers.json is correctly rewritten to reference the real path. This repository
// itself ships no .mono-stack.json (it is the template source, not a generated project), so falling
// back to the canonical default here reproduces today's behavior exactly.
function loadConfiguredApps(root, readManifestFile) {
  try {
    return readStackConfig(root, readManifestFile).apps;
  } catch {
    return [];
  }
}

function resolveAppPath(apps, feature, defaultPath) {
  return apps.find((app) => app.feature === feature)?.path ?? defaultPath;
}

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
      require: ["end-to-end-api-flow"]
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
    { when: ["**/*.tsx", "**/*.jsx"], require: ["react-19"] },
    { when: ["apps/playwright/**"], require: ["e2e-regression-test-writer"] },
    {
      when: ["apps/maestro/**"],
      require: ["maestro-mobile-e2e-test-writer"]
    }
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

test("TEST-GATE-020 denies an API-client edit missing API-flow skill", () => {
  const result = decide({
    filePath: "packages/api-client/src/users.ts",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("end-to-end-api-flow"));
  assert.ok(!result.missing.includes("contract-validation"));
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

test("TEST-GATE-023 denies implementation edits without a valid contract", () => {
  const result = decide({
    filePath: "apps/web/src/routes/auth.tsx",
    invokedSkills: [
      "test-first-workflow",
      "frontend-standards",
      "react-19",
      "domain-driven-app-structure"
    ],
    implementationContract: {
      valid: false,
      errors: ["missing ### User Journey"]
    }
  });
  assert.equal(result.allow, false);
  assert.match(result.reason, /Implementation contract gate/);
  assert.match(result.reason, /User Journey/);
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

test("TEST-CHECKLIST-001 extracts declared checklist paths", () => {
  const markdown = [
    "Related checklists:",
    "- [Implementation contract](docs/checklists/contract.md)",
    "- docs/checklists/imports.md",
    "- [external](https://example.com/checklist.md)",
    "## Implementation Contract"
  ].join("\n");
  assert.deepEqual(extractChecklistReferences(markdown), [
    "docs/checklists/contract.md",
    "docs/checklists/imports.md"
  ]);
});

test("TEST-CHECKLIST-002 rejects implementation edits when checklist reads are missing", () => {
  const result = decide({
    filePath: "src/example.ts",
    invokedSkills: ["test-first-workflow"],
    implementationContract: {
      valid: true,
      activeChecklist: "docs/checklists/current.md",
      relatedChecklists: ["docs/checklists/previous.md"]
    },
    checklistReads: new Set()
  });
  assert.equal(result.allow, false);
  assert.match(result.reason, /current\.md/);
  assert.match(result.reason, /previous\.md/);
});

test("TEST-CHECKLIST-003 allows implementation edits after all checklist reads", () => {
  const result = decide({
    filePath: "src/example.ts",
    invokedSkills: ["test-first-workflow"],
    implementationContract: {
      valid: true,
      activeChecklist: "docs/checklists/current.md",
      relatedChecklists: ["docs/checklists/previous.md"]
    },
    checklistReads: new Set([
      "docs/checklists/current.md",
      "docs/checklists/previous.md"
    ])
  });
  assert.equal(result.allow, true);
});

test("parseReadPaths extracts checklist reads from the Claude transcript", () => {
  const transcript = [
    '{"type":"tool_use","name":"Read","input":{"filePath":"/repo/docs/checklists/current.md"}}',
    '{"type":"tool_use","name":"Read","input":{"filePath":"docs/checklists/previous.md"}}'
  ].join("\n");
  assert.deepEqual(
    [...parseReadPaths(transcript, "/repo")],
    ["docs/checklists/current.md", "docs/checklists/previous.md"]
  );
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

const renameableApps = [
  { feature: "web-vite", defaultPath: "apps/web", entryFile: "src/App.tsx" },
  {
    feature: "web-next",
    defaultPath: "apps/next",
    entryFile: "src/app/page.tsx"
  },
  { feature: "mobile-expo", defaultPath: "apps/expo", entryFile: "App.tsx" },
  {
    feature: "mobile-react-native",
    defaultPath: "apps/mobile",
    entryFile: "App.tsx"
  },
  {
    feature: "api-nest",
    defaultPath: "apps/server",
    entryFile: "src/example.controller.ts"
  }
];

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
  const configuredApps = loadConfiguredApps(repositoryRoot);
  const appPath = (feature, defaultPath) =>
    resolveAppPath(configuredApps, feature, defaultPath);

  assert.deepEqual(requiredFor("packages/api-client/src/users.ts").sort(), [
    "end-to-end-api-flow"
  ]);
  assert.deepEqual(requiredFor("packages/query-client/src/users.ts"), [
    "end-to-end-api-flow"
  ]);
  assert.ok(
    requiredFor(
      `${appPath("api-nest", "apps/server")}/src/example.controller.ts`
    ).includes("contract-validation")
  );
  for (const { feature, defaultPath, entryFile } of renameableApps.filter(
    (app) => app.feature !== "api-nest"
  )) {
    const filePath = `${appPath(feature, defaultPath)}/${entryFile}`;
    assert.ok(requiredFor(filePath).includes("frontend-standards"), filePath);
    assert.ok(
      requiredFor(filePath).includes("domain-driven-app-structure"),
      filePath
    );
  }

  assert.deepEqual(requiredFor("apps/playwright/tests/auth.spec.ts").sort(), [
    "e2e-regression-test-writer",
    "testing-policy"
  ]);
  assert.deepEqual(requiredFor("apps/maestro/flows/auth.yaml"), [
    "maestro-mobile-e2e-test-writer"
  ]);
});

test("TEST-GATE-031 resolves a renamed app's real path from .mono-stack.json", () => {
  const manifestJson = JSON.stringify({
    schemaVersion: 3,
    features: ["web-vite"],
    apps: [
      {
        feature: "web-vite",
        generator: "vite",
        name: "dashboard",
        path: "apps/dashboard",
        referenceProfile: null,
        selection: {
          framework: "React",
          linter: "ESLint",
          variant: "TypeScript"
        }
      }
    ]
  });
  const table = {
    always: [],
    rules: [
      {
        when: ["apps/dashboard/**"],
        require: ["frontend-standards", "domain-driven-app-structure"]
      }
    ]
  };

  const configuredApps = loadConfiguredApps(
    "/fake-project",
    () => manifestJson
  );
  const filePath = `${resolveAppPath(configuredApps, "web-vite", "apps/web")}/src/App.tsx`;

  assert.equal(filePath, "apps/dashboard/src/App.tsx");
  assert.ok(collectRequired(filePath, table).includes("frontend-standards"));
  assert.ok(
    collectRequired(filePath, table).includes("domain-driven-app-structure")
  );
});

test("TEST-GATE-032 falls back to the canonical default when a feature has no configured app", () => {
  const manifestJson = JSON.stringify({
    schemaVersion: 3,
    features: ["web-vite"],
    apps: [
      {
        feature: "web-vite",
        generator: "vite",
        name: "web",
        path: "apps/web",
        referenceProfile: null,
        selection: {
          framework: "React",
          linter: "ESLint",
          variant: "TypeScript"
        }
      }
    ]
  });

  const configuredApps = loadConfiguredApps(
    "/fake-project",
    () => manifestJson
  );
  const filePath = `${resolveAppPath(configuredApps, "mobile-expo", "apps/expo")}/App.tsx`;

  assert.equal(filePath, "apps/expo/App.tsx");
});

test("TEST-GATE-025 denies a Playwright spec edit missing the e2e skill", () => {
  const result = decide({
    filePath: "apps/playwright/tests/auth.spec.ts",
    invokedSkills: ["test-first-workflow", "testing-policy"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("e2e-regression-test-writer"));
  assert.ok(!result.missing.includes("maestro-mobile-e2e-test-writer"));
});

test("TEST-GATE-026 denies a Maestro flow edit missing the mobile e2e skill", () => {
  const result = decide({
    filePath: "apps/maestro/flows/auth.yaml",
    invokedSkills: ["test-first-workflow"]
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("maestro-mobile-e2e-test-writer"));
  assert.ok(!result.missing.includes("e2e-regression-test-writer"));
});

test("TEST-GATE-027 allows a light edit once test-first-workflow is invoked", () => {
  const result = decide({
    filePath: "scripts/dev-ports.mjs",
    invokedSkills: ["test-first-workflow"],
    changeTierLight: true
  });
  assert.equal(result.allow, true);
  assert.deepEqual(result.missing, []);
});

test("TEST-GATE-028 denies a light edit when no skill was invoked", () => {
  const result = decide({
    filePath: "scripts/dev-ports.mjs",
    invokedSkills: [],
    changeTierLight: true
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("test-first-workflow"));
});

test("TEST-GATE-029 a light edit bypasses an invalid contract object", () => {
  const result = decide({
    filePath: "scripts/dev-ports.mjs",
    invokedSkills: ["test-first-workflow"],
    changeTierLight: true,
    implementationContract: {
      valid: false,
      errors: ["missing ### User Journey"]
    }
  });
  assert.equal(result.allow, true);
});

test("TEST-GATE-030 a light edit on a Playwright path still needs the e2e skill", () => {
  const result = decide({
    filePath: "apps/playwright/tests/auth.spec.ts",
    invokedSkills: ["test-first-workflow", "testing-policy"],
    changeTierLight: true
  });
  assert.equal(result.allow, false);
  assert.ok(result.missing.includes("e2e-regression-test-writer"));
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
