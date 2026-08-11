import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { render } from "ink-testing-library";

import {
  ProjectWizard,
  buildProjectArguments,
  promptForProjectArguments
} from "../src/interactive-wizard.js";
import { parseArguments } from "../src/create-project.js";

const downArrow = "\u001B[B";
const enter = "\r";
const escape = "\u001B";

async function waitFor(check) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail("Ink did not render the expected state within one second");
}

async function sendInput(app, input, expectedFrame) {
  app.stdin.write(input);
  if (expectedFrame) {
    await waitFor(() => expectedFrame.test(app.lastFrame() ?? ""));
  }
  await new Promise((resolve) => setImmediate(resolve));
}

test("renders an Ink wizard and uses safe project defaults", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  assert.match(app.lastFrame(), /create-mono-stack/i);
  assert.match(app.lastFrame(), /Destination directory/);

  await sendInput(app, enter, /Project name/);
  assert.match(app.lastFrame(), /Project name/);
  await sendInput(app, enter, /Advanced options/);
  assert.match(app.lastFrame(), /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  assert.match(app.lastFrame(), /Ready to create/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [["--name=my-project", "--", "my-project"]]);
});

test("collects advanced options through keyboard-driven Ink controls", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, "apps/acme-platform", /apps\/acme-platform/);
  await sendInput(app, enter, /Project name/);
  await sendInput(app, "Acme Platform", /Acme Platform/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, downArrow, /\u276F Configure advanced options/);
  await sendInput(app, enter, /Git SSH host alias/);
  await sendInput(app, "github-webknot", /github-webknot/);
  await sendInput(app, enter, /Python executable/);
  await sendInput(app, "/opt/python3", /\/opt\/python3/);
  await sendInput(app, enter, /Template source/);
  await sendInput(app, "../template", /\.\.\/template/);
  await sendInput(app, enter, /Template revision/);
  await sendInput(app, "v1.2.3", /v1\.2\.3/);
  await sendInput(app, enter, /Ready to create/);
  assert.match(app.lastFrame(), /github-webknot/);
  assert.match(app.lastFrame(), /v1\.2\.3/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [
    [
      "--name=Acme Platform",
      "--git-host-alias=github-webknot",
      "--python=/opt/python3",
      "--template=../template",
      "--vcs-ref=v1.2.3",
      "--",
      "apps/acme-platform"
    ]
  ]);
});

test("cancels the wizard with Escape", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, escape);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [undefined]);
});

test("cancels the wizard with Ctrl+C", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, "\u0003");
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [undefined]);
});

test("cancels from the confirmation menu", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  await sendInput(app, downArrow, /\u276F Cancel/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [undefined]);
});

test("remains interactive in Ink screen-reader mode", async (t) => {
  const previousMode = process.env.INK_SCREEN_READER;
  process.env.INK_SCREEN_READER = "true";
  t.after(() => {
    if (previousMode === undefined) delete process.env.INK_SCREEN_READER;
    else process.env.INK_SCREEN_READER = previousMode;
  });
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [["--name=my-project", "--", "my-project"]]);
});

test("preserves leading hyphens in wizard values", () => {
  const args = buildProjectArguments({
    destination: "--help",
    gitHostAlias: "github-work",
    projectName: "-Acme Platform",
    python: "--python3",
    template: "--template",
    vcsRef: "--revision"
  });

  assert.deepEqual(parseArguments(args, "/workspace"), {
    destination: "/workspace/--help",
    gitHostAlias: "github-work",
    projectName: "-Acme Platform",
    python: "--python3",
    template: "/workspace/--template",
    vcsRef: "--revision"
  });
});

test("unmounts Ink before returning project arguments", async () => {
  const events = [];
  const expected = ["--name=my-project", "--", "my-project"];
  let completeWizard;
  let resolveExit;
  const exited = new Promise((resolve) => {
    resolveExit = resolve;
  });

  const result = promptForProjectArguments({
    input: { isTTY: true },
    output: { isTTY: true },
    renderApp(element, options) {
      completeWizard = element.props.onComplete;
      assert.equal(options.exitOnCtrlC, false);
      return {
        unmount() {
          events.push("unmount");
          resolveExit();
        },
        waitUntilExit() {
          events.push("wait");
          return exited;
        }
      };
    }
  });

  completeWizard(expected);

  assert.deepEqual(await result, expected);
  events.push("returned");
  assert.deepEqual(events, ["wait", "unmount", "returned"]);
});
