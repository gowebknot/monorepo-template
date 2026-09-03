import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAppTriggerRules,
  syncSkillTriggers
} from "../src/skill-triggers.js";

const skillGateUrl = new URL(
  "../../../scripts/skill-gate.mjs",
  import.meta.url
);
const { collectRequired } = await import(skillGateUrl);

const baseTriggers = {
  always: ["test-first-workflow"],
  rules: [
    { when: ["**/*.test.*"], require: ["testing-policy"] },
    { when: ["packages/entities/**"], require: ["contract-validation"] },
    { when: ["apps/web/**"], require: ["frontend-standards"] },
    { when: ["apps/server/**"], require: ["backend-standards"] },
    { when: ["**/*.tsx"], require: ["react-19"] }
  ],
  exempt: [".claude/**"]
};

test("TEST-TRIGGER-001 builds rules for custom frontend and backend apps", () => {
  const apps = [
    { feature: "web-vite", path: "apps/admin-react" },
    { feature: "web-vite", path: "apps/student-react" },
    { feature: "mobile-expo", path: "apps/student-expo" },
    { feature: "api-nest", path: "apps/api" }
  ];
  const rules = buildAppTriggerRules(apps);

  assert.deepEqual(rules, [
    {
      when: ["apps/admin-react/**"],
      require: ["frontend-standards", "domain-driven-app-structure"]
    },
    {
      when: ["apps/student-react/**"],
      require: ["frontend-standards", "domain-driven-app-structure"]
    },
    {
      when: ["apps/student-expo/**"],
      require: ["frontend-standards", "domain-driven-app-structure"]
    },
    {
      when: ["apps/api/**"],
      require: [
        "backend-standards",
        "contract-validation",
        "domain-driven-app-structure"
      ]
    }
  ]);
});

test("TEST-TRIGGER-002 updates app rules and preserves generic rules", async () => {
  let output;
  await syncSkillTriggers(
    "/project",
    [
      { feature: "web-vite", path: "apps/admin-react" },
      { feature: "mobile-expo", path: "apps/student-expo" }
    ],
    {
      read: async () => JSON.stringify(baseTriggers),
      write: async (_path, contents) => {
        output = JSON.parse(contents);
      }
    }
  );

  assert.deepEqual(output.rules, [
    { when: ["**/*.test.*"], require: ["testing-policy"] },
    { when: ["packages/entities/**"], require: ["contract-validation"] },
    { when: ["**/*.tsx"], require: ["react-19"] },
    {
      when: ["apps/admin-react/**"],
      require: ["frontend-standards", "domain-driven-app-structure"]
    },
    {
      when: ["apps/student-expo/**"],
      require: ["frontend-standards", "domain-driven-app-structure"]
    }
  ]);

  const customFrontendRules = {
    ...output,
    rules: output.rules.filter((rule) =>
      rule.require.includes("frontend-standards")
    )
  };
  assert.ok(
    collectRequired(
      "apps/admin-react/src/App.tsx",
      customFrontendRules
    ).includes("frontend-standards")
  );
  assert.ok(
    collectRequired(
      "apps/student-expo/app/index.tsx",
      customFrontendRules
    ).includes("frontend-standards")
  );
  assert.ok(
    collectRequired(
      "apps/student-expo/app/index.tsx",
      customFrontendRules
    ).includes("domain-driven-app-structure")
  );
});
