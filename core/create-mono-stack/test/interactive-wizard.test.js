import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createElement } from "react";
import { render } from "ink-testing-library";

const sourceRoot = join(
  dirname(dirname(fileURLToPath(import.meta.url))),
  "src"
);

const {
  ProjectWizard,
  buildProjectArguments,
  parseSshAliases,
  promptForProjectArguments
} = await import(pathToFileURL(join(sourceRoot, "interactive-wizard.js")));
const { parseArguments } = await import(
  pathToFileURL(join(sourceRoot, "create-project.js"))
);
const { FEATURE_DEFINITIONS } = await import(
  pathToFileURL(join(sourceRoot, "feature-config.js"))
);

const downArrow = "\u001B[B";
const enter = "\r";
const escape = "\u001B";
const tab = "\t";

async function waitFor(check) {
  for (let attempt = 0; attempt < 2000; attempt += 1) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail("Ink did not render the expected state within ten seconds");
}

async function sendInput(app, input, expectedFrame) {
  app.stdin.write(input);
  if (expectedFrame) {
    await waitFor(() => expectedFrame.test(app.lastFrame() ?? ""));
  }
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (expectedFrame) {
    await waitFor(() => expectedFrame.test(app.lastFrame() ?? ""));
  }
}

// Ink hard-wraps long lines to the terminal width and redraws the box
// border on every wrapped line, so a description that spans a word-wrap
// boundary is split across frame lines by both a newline and a border
// character. Strip the border and collapse whitespace before matching so
// these assertions don't depend on layout.
function normalizeFrame(frame) {
  return (frame ?? "").replace(/[│╭╮╰╯─]/g, "").replace(/\s+/g, " ");
}

function flattenFrame(app) {
  return normalizeFrame(app.lastFrame());
}

function wrapped(regex) {
  return { test: (frame) => regex.test(normalizeFrame(frame)) };
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
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);
  assert.match(app.lastFrame(), /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  assert.match(app.lastFrame(), /Ready to create/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [
    [
      "--name=my-project",
      "--features=web-vite,api-nest",
      "--app-name=web-vite:web-app-1",
      "--app-name=api-nest:server-app-1",
      "--",
      "my-project"
    ]
  ]);
});

test("selects additional stack features through the multiselect screen", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, downArrow, wrapped(/NestJS API —/));
  await sendInput(app, downArrow, wrapped(/Next.js web app —/));
  await sendInput(app, " ", wrapped(/\[x\] Next\.js web app/));
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Next.js web app count/);
  await sendInput(app, enter, /Next.js web app name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [
    [
      "--name=my-project",
      "--features=web-vite,api-nest,web-next",
      "--app-name=web-vite:web-app-1",
      "--app-name=api-nest:server-app-1",
      "--app-name=web-next:next-app-1",
      "--",
      "my-project"
    ]
  ]);
});

test("asks only for names of selected apps", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, downArrow);
  await sendInput(app, " ");
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);

  assert.doesNotMatch(app.lastFrame(), /NestJS API name/);
});

test("navigates backward through selected app-name screens", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, tab, /❯ Back/);
  await sendInput(app, enter, /Vite web app name/);
  assert.match(app.lastFrame(), /Vite web app name/);
});

test("documents Tab focus for app-name Back navigation", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);

  assert.match(app.lastFrame(), /Tab focus Back/);
  assert.doesNotMatch(app.lastFrame(), /❯ Back/);
  await sendInput(app, tab, /❯ Back/);
});

test("navigates backward through selectable wizard screens", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, downArrow);
  await sendInput(app, downArrow, /Back/);
  await sendInput(app, enter, /Destination directory/);
  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  await sendInput(app, downArrow);
  await sendInput(app, downArrow, /Back/);
  await sendInput(app, enter, /Advanced options/);

  assert.deepEqual(completed, []);
});

test("renders discovered Python choices in the advanced flow", async (t) => {
  const app = render(
    createElement(ProjectWizard, {
      onComplete: () => {},
      options: {
        python: [{ label: "pyenv-python (3.12.4)", value: "pyenv-python" }]
      }
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, downArrow, /Configure advanced options/);
  await sendInput(app, enter, /Git SSH host alias/);
  await sendInput(app, enter, /Python executable/);

  assert.match(app.lastFrame(), /pyenv-python \(3\.12\.4\)/);
});

test("TEST-WIZARD-001 shows the Stack features question description and the default-highlighted feature's description", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);

  const [webVite, apiNest] = FEATURE_DEFINITIONS;
  assert.match(
    flattenFrame(app),
    /Select which apps and frameworks to scaffold into the project\./
  );
  assert.match(flattenFrame(app), new RegExp(webVite.description));
  assert.doesNotMatch(flattenFrame(app), new RegExp(apiNest.description));
});

test("TEST-WIZARD-002 moves the shown feature description when the Stack features cursor moves", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);

  const [webVite, apiNest] = FEATURE_DEFINITIONS;
  await sendInput(app, downArrow, wrapped(new RegExp(apiNest.description)));
  assert.doesNotMatch(flattenFrame(app), new RegExp(webVite.description));
});

test("TEST-WIZARD-003 shows the Advanced options question description and the default-highlighted choice's description", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);

  assert.match(
    flattenFrame(app),
    /Optionally fine-tune how Git connects, which Python runs setup, and which template version is used/
  );
  assert.match(
    flattenFrame(app),
    /Use defaults — Skip SSH, Python, template, and revision configuration/
  );
  assert.doesNotMatch(
    flattenFrame(app),
    /Manually set the Git SSH host alias, Python executable, template source, and revision\./
  );
});

test("TEST-WIZARD-004 moves the shown option description when the Advanced options cursor moves", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);

  await sendInput(
    app,
    downArrow,
    wrapped(/Configure advanced options — Manually set the Git SSH host alias/)
  );
  assert.doesNotMatch(
    flattenFrame(app),
    /Skip SSH, Python, template, and revision configuration/
  );
});

test("TEST-WIZARD-005 shows the Ready to create question description and the default-highlighted choice's description", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, enter, /Ready to create/);

  assert.match(
    flattenFrame(app),
    /Review the choices above before the project files are generated\./
  );
  assert.match(
    flattenFrame(app),
    /Create project — Generate the project now using the answers above\./
  );
  assert.doesNotMatch(flattenFrame(app), /Exit without creating a project\./);
});

test("TEST-WIZARD-006 shows a question description on a TextQuestion screen", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, downArrow, /Custom destination/);
  await sendInput(
    app,
    enter,
    /Choose the directory where the new project will be created\./
  );
});

test("TEST-WIZARD-007 shows the question description and default-highlighted option's description on an advanced sub-step", async (t) => {
  const app = render(createElement(ProjectWizard, { onComplete: () => {} }));
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, downArrow, /Configure advanced options/);
  await sendInput(app, enter, /Git SSH host alias/);

  assert.match(
    flattenFrame(app),
    /If you use a custom nickname \(alias\) for github\.com in your ~\/\.ssh\/config/
  );
  assert.match(
    flattenFrame(app),
    /No alias \(default: none\) — Connect to GitHub normally, without a custom alias\./
  );
});

test("TEST-WIZARD-008 renders a discovered choice without an authored description as plain label text", async (t) => {
  const app = render(
    createElement(ProjectWizard, {
      onComplete: () => {},
      options: {
        python: [{ label: "pyenv-python (3.12.4)", value: "pyenv-python" }]
      }
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, downArrow, /Configure advanced options/);
  await sendInput(app, enter, /Git SSH host alias/);
  await sendInput(app, enter, /Python executable/);
  await sendInput(app, downArrow, /❯ pyenv-python \(3\.12\.4\)/);

  assert.match(flattenFrame(app), /pyenv-python \(3\.12\.4\)/);
  assert.doesNotMatch(flattenFrame(app), /pyenv-python \(3\.12\.4\) —/);
});

test("TEST-MULTI-007 asks how many, then names each instance, chaining across features", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, enter, /Project name/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, downArrow);
  await sendInput(app, downArrow);
  await sendInput(app, " ");
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, "2", /2/);
  await sendInput(app, enter, /Vite web app name \(1 of 2\)/);
  await sendInput(app, "dashboard", /dashboard/);
  await sendInput(app, enter, /Vite web app name \(2 of 2\)/);
  await sendInput(app, "admin-dashboard", /admin-dashboard/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Next.js web app count/);
  await sendInput(app, enter, /Next.js web app name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [
    [
      "--name=my-project",
      "--features=web-vite,api-nest,web-next",
      "--app-name=web-vite:dashboard",
      "--app-name=web-vite:admin-dashboard",
      "--app-name=api-nest:server-app-1",
      "--app-name=web-next:next-app-1",
      "--",
      "my-project"
    ]
  ]);
});

test("parses concrete SSH aliases from SSH config", () => {
  assert.deepEqual(
    parseSshAliases(
      `Host *\n  ForwardAgent no\nHost github-webknot work\n  HostName github.com\n`
    ),
    ["github-webknot", "work"]
  );
});

test("collects advanced options through keyboard-driven Ink controls", async (t) => {
  const completed = [];
  const app = render(
    createElement(ProjectWizard, {
      onComplete: (args) => completed.push(args)
    })
  );
  t.after(() => app.unmount());

  await sendInput(app, downArrow, /Custom destination/);
  await sendInput(app, enter);
  await sendInput(app, "apps/acme-platform", /apps\/acme-platform/);
  await sendInput(app, enter, /Project name/);
  await sendInput(app, downArrow, /Custom project name/);
  await sendInput(app, enter, /Project name/);
  await sendInput(app, "Acme Platform", /Acme Platform/);
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, "dashboard", /dashboard/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, "api", /api/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, downArrow, /\u276F Configure advanced options/);
  await sendInput(app, enter, /Git SSH host alias/);
  await sendInput(app, downArrow, /Custom alias/);
  await sendInput(app, enter, /Git SSH host alias/);
  await sendInput(app, "github-webknot", /github-webknot/);
  await sendInput(app, enter, /Python executable/);
  await sendInput(app, downArrow, /Custom executable/);
  await sendInput(app, enter, /Python executable/);
  await sendInput(app, "/opt/python3", /\/opt\/python3/);
  await sendInput(app, enter, /Template source/);
  await sendInput(app, downArrow, /Custom template source/);
  await sendInput(app, enter, /Template source/);
  await sendInput(app, "../template", /\.\.\/template/);
  await sendInput(app, enter, /Template revision/);
  await sendInput(app, downArrow, /Custom revision/);
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
      "--features=web-vite,api-nest",
      "--app-name=web-vite:dashboard",
      "--app-name=api-nest:api",
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
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
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
  await sendInput(app, enter, /Stack features/);
  await sendInput(app, enter, /Vite web app count/);
  await sendInput(app, enter, /Vite web app name/);
  await sendInput(app, enter, /NestJS API count/);
  await sendInput(app, enter, /NestJS API name/);
  await sendInput(app, enter, /Advanced options/);
  await sendInput(app, enter, /Ready to create/);
  await sendInput(app, enter);
  await waitFor(() => completed.length === 1);

  assert.deepEqual(completed, [
    [
      "--name=my-project",
      "--features=web-vite,api-nest",
      "--app-name=web-vite:web-app-1",
      "--app-name=api-nest:server-app-1",
      "--",
      "my-project"
    ]
  ]);
});

test("preserves leading hyphens in wizard values", () => {
  const args = buildProjectArguments({
    destination: "--help",
    gitHostAlias: "github-work",
    projectName: "-Acme Platform",
    features: ["web-vite", "api-nest"],
    featureNames: { "web-vite": ["web"], "api-nest": ["server"] },
    python: "--python3",
    template: "--template",
    vcsRef: "--revision"
  });

  assert.deepEqual(parseArguments(args, "/workspace"), {
    destination: "/workspace/--help",
    gitHostAlias: "github-work",
    projectName: "-Acme Platform",
    features: ["web-vite", "api-nest"],
    appNames: { "web-vite": ["web"], "api-nest": ["server"] },
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
    discoverOptions: async () => ({ python: [] }),
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

  await new Promise((resolve) => setImmediate(resolve));
  completeWizard(expected);

  assert.deepEqual(await result, expected);
  events.push("returned");
  assert.deepEqual(events, ["wait", "unmount", "returned"]);
});
