import assert from "node:assert/strict";
import test from "node:test";

import {
  createViteWizardObserver,
  observeViteWizardTranscript
} from "../src/vite-wizard-observer.js";

const completedViteTranscript = [
  "\u001b[36m◇\u001b[39m  Select a framework:",
  "│  React",
  "\u001b[36m◇\u001b[39m  Select a variant:",
  "│  TypeScript"
].join("\n");

test("TEST-VITE-OBSERVE-001 reads confirmed framework and variant labels", () => {
  assert.deepEqual(observeViteWizardTranscript(completedViteTranscript), {
    framework: "React",
    variant: "TypeScript"
  });
});

test("TEST-VITE-OBSERVE-002 reads a linter across terminal chunks", () => {
  const observer = createViteWizardObserver();
  observer.write(`${completedViteTranscript}\n◇  Which linter`);
  observer.write(" to use?\n│  ESLint\n");

  assert.deepEqual(observer.finish(), {
    framework: "React",
    linter: "ESLint",
    variant: "TypeScript"
  });
});

test("TEST-VITE-OBSERVE-003 returns null for unknown output", () => {
  assert.equal(observeViteWizardTranscript("Vite is ready\n"), null);
});
