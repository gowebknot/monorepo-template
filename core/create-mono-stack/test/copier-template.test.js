import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const templateAdapters = new Map([
  [
    ".copier-answers.yml.jinja",
    "# Changes here will be overwritten by Copier; NEVER EDIT MANUALLY\n<%= _copier_answers | to_nice_yaml =%>\n"
  ],
  [
    "package.json.jinja",
    `<%!- set project_slug = project_name | lower | regex_replace('[^a-z0-9]+', '-') | regex_replace('^-+|-+$', '') -!%>
<%!- filter replace("monorepo-template", project_slug)
  | replace('    "core:test": "node --test core/test/core-packages.test.js",\\n', "")
  | replace('    "template:test": "pnpm core:test && pnpm --filter create-mono-stack test",\\n', "")
  | replace('    "template:test:integration": "pnpm --filter create-mono-stack test:integration",\\n', "") -!%>
<%!- include "package.json" -!%>
<%!- endfilter -!%>
`
  ],
  [
    "pnpm-workspace.yaml.jinja",
    `<%!- filter replace('  - "core/*"\\n', "") -!%>
<%!- include "pnpm-workspace.yaml" -!%>
<%!- endfilter -!%>
`
  ],
  [
    "pnpm-lock.yaml.jinja",
    `<%!- filter regex_replace('(?m)\\n  core/create-mono-stack:\\n(?: {4,}.*\\n)*', "") -!%>
<%!- include "pnpm-lock.yaml" -!%>
<%!- endfilter -!%>
`
  ],
  [
    "packages/config/src/index.ts.jinja",
    "<%!- set project_slug = project_name | lower | regex_replace('[^a-z0-9]+', '-') | regex_replace('^-+|-+$', '') -!%>\n<%!- filter replace(\"monorepo-template\", project_slug) -!%>\n<%!- include \"packages/config/src/index.ts\" -!%>\n<%!- endfilter -!%>\n"
  ],
  [
    "README.md.jinja",
    `<%!- filter replace("# Monorepo Template", "# " ~ project_name)
  | replace('- \`core/create-mono-stack\`: source-only npm launcher and Copier tests\\n', "")
  | regex_replace('(?s)## Creating a project.*?(?=## Structure)', '## Template updates\\n\\nProject setup creates .venv with pinned Copier dependencies and keeps the latest Python declaration in mise.toml. Native CLI versions win for overlapping packages, template-only packages are added, and profile overlays support Vite React TypeScript and the NestJS reference. No separate updater bootstrap is required. Setup initializes Git on main without creating a commit, so create the baseline commit before the first update.\\n\\nThis project records its Copier source and version in .copier-answers.yml and its selected stack in .mono-stack.json. Run updates from a clean working tree.\\n\\nProject setup stores any --git-host-alias value in the local Git configuration automatically. Because .git/config is not committed, configure the alias once after cloning the project elsewhere or when repairing an older project:\\n\\n    git config --local mono-stack.template-host-alias github-webknot\\n\\nOmit that setting when generic GitHub SSH works. Run updates through the wrapper so Copier keeps the generic source URL while Git uses the local alias when needed:\\n\\n    pnpm template:update\\n\\nReview and resolve any reported conflicts, then run just check.\\n\\n') -!%>
<%!- include "README.md" -!%>
<%!- endfilter -!%>
`
  ],
  [
    "Justfile.jinja",
    `<%!- filter replace(" skills-test template-test", " skills-test")
  | replace('\\ntemplate-test:\\n    pnpm template:test\\n', "")
  | replace('\\ntemplate-test-integration:\\n    pnpm template:test:integration\\n', "") -!%>
<%!- include "Justfile" -!%>
<%!- endfilter -!%>
`
  ],
  [
    "AGENTS.md.jinja",
    '<%!- filter replace(" + template-test", "")\n  | regex_replace(\'(?m)^core/\\n  create-mono-stack/.*\\n\', "")\n  | regex_replace(\'(?m)^.*create-mono-stack.*\\n\', "") -!%>\n<%!- include "AGENTS.md" -!%>\n<%!- endfilter -!%>\n'
  ]
]);

templateAdapters.set(
  "README.md.jinja",
  templateAdapters
    .get("README.md.jinja")
    .replace(
      "Omit that setting when generic GitHub SSH works.",
      "Omit the setting when generic GitHub SSH works."
    )
);

test("uses Copier-native project identity rendering", async () => {
  const config = parse(await readFile(join(root, "copier.yml"), "utf8"));

  assert.equal(config._min_copier_version, "9.0.0");
  assert.equal(config._tasks, undefined);
  assert.deepEqual(config._envops, {
    block_start_string: "<%!",
    block_end_string: "!%>",
    variable_start_string: "<%=",
    variable_end_string: "=%>",
    comment_start_string: "<%#",
    comment_end_string: "#%>"
  });
  assert.equal(config.project_slug, undefined);
  assert.equal(config.features_json.default, '["web-vite", "api-nest"]');
  assert.equal(config.feature_web_vite.default, true);
  assert.equal(config.feature_api_nest.default, true);
  assert.equal(config.feature_web_next.default, false);
  assert.equal(config.feature_api_express.default, false);
  assert.equal(config.feature_mobile_expo.default, false);
  assert.equal(config.feature_mobile_react_native.default, false);
  assert.match(config.project_name.validator, /letter or number/);
  assert.match(config.project_name.validator, /214 characters/);
  assert.equal(config._message_after_copy, "");
  assert.ok(config._exclude.includes("copier.yml"));
  assert.ok(config._exclude.includes("core"));
  assert.ok(config._exclude.includes(".npmrc"));
  assert.ok(config._exclude.includes(".npmrc.auth"));
  assert.ok(config._exclude.includes(".venv"));
  assert.ok(!config._exclude.includes(".github"));

  await assert.rejects(
    access(join(root, "scripts/configure-template-project.mjs"))
  );
});

test("TEST-MANIFEST-036 keeps stack metadata launcher-owned", async () => {
  await assert.rejects(access(join(root, ".mono-stack.json.jinja")));
  await access(join(root, "scripts/stack-config.mjs"));
  assert.match(
    await readFile(join(root, "scripts/update-template.mjs"), "utf8"),
    /from "\.\/stack-config\.mjs"/
  );
});

test("TEST-DOCS-001 documents hybrid reference profiles", async () => {
  const launcherReadme = await readFile(
    join(root, "core/create-mono-stack/README.md"),
    "utf8"
  );
  const generatedReadmeAdapter = await readFile(
    join(root, "README.md.jinja"),
    "utf8"
  );

  for (const contents of [launcherReadme, generatedReadmeAdapter]) {
    assert.match(contents, /native CLI versions win/i);
    assert.match(contents, /template-only packages/i);
    assert.match(contents, /Vite React TypeScript/i);
    assert.match(contents, /NestJS reference/i);
    assert.doesNotMatch(
      contents,
      /refreshes npm dependencies to their latest releases/i
    );
  }
});

test("builds workspace dependencies before starting development", async () => {
  const rootPackage = JSON.parse(
    await readFile(join(root, "package.json"), "utf8")
  );
  const turbo = JSON.parse(await readFile(join(root, "turbo.json"), "utf8"));
  const gitignore = await readFile(join(root, ".gitignore"), "utf8");

  assert.equal(rootPackage.scripts.dev, "turbo dev");
  assert.equal(rootPackage.scripts["dev:reference"], "turbo dev:reference");
  assert.deepEqual(turbo.tasks.dev.dependsOn, ["^build"]);
  assert.deepEqual(turbo.tasks["dev:reference"].dependsOn, ["^build"]);
  assert.match(gitignore, /^\.npmrc$/m);
});

test("declares the latest Python runtime through mise", async () => {
  assert.equal(
    await readFile(join(root, "mise.toml"), "utf8"),
    '[tools]\npython = "latest"\n'
  );
});

test("keeps core tooling in the source workspace only", async () => {
  const workspace = parse(
    await readFile(join(root, "pnpm-workspace.yaml"), "utf8")
  );
  const corePackage = JSON.parse(
    await readFile(join(root, "core/create-mono-stack/package.json"), "utf8")
  );

  assert.ok(workspace.packages.includes("core/*"));
  assert.equal(corePackage.name, "create-mono-stack");
  assert.equal(
    corePackage.bin["create-mono-stack"],
    "bin/create-mono-stack.js"
  );
  assert.deepEqual(corePackage.dependencies, {
    ink: "^6.8.0",
    "ink-select-input": "^6.2.0",
    "ink-text-input": "^6.0.0",
    react: "^19.2.0"
  });
  assert.equal(corePackage.devDependencies["ink-testing-library"], "^4.0.0");
  assert.equal(
    await readFile(
      join(root, "core/create-mono-stack/requirements/copier.txt"),
      "utf8"
    ),
    await readFile(join(root, "requirements/copier.txt"), "utf8")
  );
});

test("uses synchronized MIT licensing for the template and launcher", async () => {
  const rootPackage = JSON.parse(
    await readFile(join(root, "package.json"), "utf8")
  );
  const corePackage = JSON.parse(
    await readFile(join(root, "core/create-mono-stack/package.json"), "utf8")
  );
  const rootLicense = await readFile(join(root, "LICENSE"), "utf8");
  const packageLicense = await readFile(
    join(root, "core/create-mono-stack/LICENSE"),
    "utf8"
  );

  assert.equal(rootPackage.license, "MIT");
  assert.equal(corePackage.license, "MIT");
  assert.equal(packageLicense, rootLicense);
  assert.match(rootLicense, /^MIT License/);
  assert.match(rootLicense, /Copyright \(c\) 2026 Webknot Technologies/);
});

test("keeps project identity adapters synchronized with live source files", async () => {
  for (const [path, expected] of templateAdapters) {
    assert.equal(await readFile(join(root, path), "utf8"), expected);
  }
});

test("uses a stable internal workspace package scope", async () => {
  const packagePaths = [
    "packages/api-client/package.json",
    "packages/config/package.json",
    "packages/db/package.json",
    "packages/entities/package.json",
    "packages/env/package.json",
    "packages/query-client/package.json"
  ];

  for (const path of packagePaths) {
    const packageJson = JSON.parse(await readFile(join(root, path), "utf8"));
    assert.match(packageJson.name, /^@repo\/[a-z0-9-]+$/);
  }

  const trackedFiles = spawnSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8"
  });
  assert.equal(trackedFiles.status, 0, trackedFiles.stderr);
  const legacyScope = Buffer.from(["@monorepo", "template"].join("-"));

  for (const path of trackedFiles.stdout.split("\0").filter(Boolean)) {
    if (path.endsWith(".jinja")) continue;
    const contents = await readFile(join(root, path)).catch(() => undefined);
    if (!contents?.includes(legacyScope)) continue;
    assert.fail(`${path} still uses the template-specific package scope`);
  }
});

test("scaffolds new packages in the stable workspace scope", async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "package-scope-test-"));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  await writeFile(
    join(temporaryRoot, "package.json"),
    '{"name":"customer-project"}\n'
  );

  const result = spawnSync(
    process.execPath,
    [
      join(root, "skills/create-minimal-package/scripts/scaffold-package.mjs"),
      "billing",
      "--root",
      temporaryRoot
    ],
    { encoding: "utf8" }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const packageJson = JSON.parse(
    await readFile(join(temporaryRoot, "packages/billing/package.json"), "utf8")
  );
  assert.equal(packageJson.name, "@repo/billing");
});
