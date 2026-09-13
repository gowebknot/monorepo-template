import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  renderFileContents,
  renderPackageScope
} from "#scripts/render-package-scope.mjs";
import { checkRoot } from "#scripts/skills.mjs";
import { hashTree } from "#scripts/skills-hash.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoots = [
  "skills",
  ".agents/skills",
  ".claude/skills",
  ".opencode/skills"
];

test("TEST-RENDERSCOPE-001 rewrites the scoped-package pattern", () => {
  assert.equal(
    renderFileContents('import x from "@monorepo-template/env";', "acme"),
    'import x from "@acme/env";'
  );
});

test("TEST-RENDERSCOPE-002 rewrites a bare workspace-dependency JSON key", () => {
  const rendered = renderFileContents(
    '{\n  "devDependencies": {\n    "monorepo-template": "workspace:*"\n  }\n}',
    "acme"
  );
  assert.match(rendered, /"acme":\s*"workspace:\*"/);
  assert.doesNotMatch(rendered, /"monorepo-template"/);
});

test("TEST-RENDERSCOPE-003 rewrites a bare import specifier", () => {
  assert.equal(
    renderFileContents(
      'import { isPortAvailable } from "monorepo-template/scripts/dev-ports.mjs";',
      "acme"
    ),
    'import { isPortAvailable } from "acme/scripts/dev-ports.mjs";'
  );
});

test("TEST-RENDERSCOPE-004 leaves an unrelated prose mention untouched", () => {
  const input = "SSH access to `gowebknot/monorepo-template` are required.";
  assert.equal(renderFileContents(input, "acme"), input);
});

test("TEST-RENDERSCOPE-005 is a no-op when the project is literally named monorepo-template", () => {
  const input = '"monorepo-template": "workspace:*"';
  assert.equal(renderFileContents(input, "monorepo-template"), input);
});

test("TEST-RENDERSCOPE-006 walks a real directory tree and rewrites both patterns", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "render-package-scope-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ name: "acme", private: true })
  );
  await mkdir(join(root, "apps/maestro/scripts"), { recursive: true });
  await writeFile(
    join(root, "apps/maestro/package.json"),
    JSON.stringify({
      name: "maestro-tests",
      devDependencies: { "monorepo-template": "workspace:*" }
    })
  );
  await writeFile(
    join(root, "apps/maestro/scripts/run-flows.mjs"),
    'import { isPortAvailable } from "monorepo-template/scripts/dev-ports.mjs";\n'
  );
  await mkdir(join(root, "node_modules/should-be-ignored"), {
    recursive: true
  });
  await writeFile(
    join(root, "node_modules/should-be-ignored/file.js"),
    '"monorepo-template"'
  );

  const scope = await renderPackageScope(root);
  assert.equal(scope, "acme");

  const maestroPackageJson = await readFile(
    join(root, "apps/maestro/package.json"),
    "utf8"
  );
  assert.match(maestroPackageJson, /"acme":\s*"workspace:\*"/);

  const runFlows = await readFile(
    join(root, "apps/maestro/scripts/run-flows.mjs"),
    "utf8"
  );
  assert.match(runFlows, /"acme\/scripts\/dev-ports\.mjs"/);

  const ignored = await readFile(
    join(root, "node_modules/should-be-ignored/file.js"),
    "utf8"
  );
  assert.equal(ignored, '"monorepo-template"');
});

test("TEST-RENDERSCOPE-007 recomputes .skills-sync.json after rendering so checkRoot still passes", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "render-package-scope-skills-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  const skillName = "create-minimal-package";
  for (const skillRoot of skillRoots) {
    await cp(
      join(repositoryRoot, skillRoot, skillName),
      join(root, skillRoot, skillName),
      { recursive: true }
    );
  }
  await writeFile(join(root, "package.json"), JSON.stringify({ name: "acme" }));

  const originalHash = await hashTree(join(root, "skills", skillName));
  await writeFile(
    join(root, ".skills-sync.json"),
    `${JSON.stringify(
      { version: 1, skills: { [skillName]: { hash: originalHash } } },
      null,
      2
    )}\n`
  );

  await renderPackageScope(root);

  const rendered = await readFile(
    join(root, "skills", skillName, "SKILL.md"),
    "utf8"
  );
  assert.match(rendered, /@acme\//);
  await assert.doesNotReject(() => checkRoot(root));
});

test("TEST-RENDERSCOPE-008 tolerates a missing skills-sync manifest", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "render-package-scope-noskills-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  await writeFile(join(root, "package.json"), JSON.stringify({ name: "acme" }));

  await assert.doesNotReject(() => renderPackageScope(root));
  await assert.rejects(
    () => readFile(join(root, ".skills-sync.json"), "utf8"),
    { code: "ENOENT" }
  );
});
