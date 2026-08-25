import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

export async function assertGeneratedProject({
  projectRoot,
  stackConfig,
  templateRoot
}) {
  const generatedPackage = JSON.parse(
    await readFile(join(projectRoot, "package.json"), "utf8")
  );
  assert.equal(generatedPackage.name, "acme-platform");
  assert.equal(generatedPackage.scripts["core:test"], undefined);
  assert.equal(generatedPackage.scripts["template:test"], undefined);
  assert.equal(
    generatedPackage.scripts["template:test:integration"],
    undefined
  );
  assert.equal(
    generatedPackage.scripts["template:update"],
    "node scripts/update-template.mjs"
  );
  assert.equal(
    generatedPackage.scripts["dev:reference"],
    "node scripts/dev-ports.mjs && turbo dev:reference --ui tui"
  );
  assert.equal(
    JSON.parse(
      await readFile(
        join(projectRoot, "packages/api-client/package.json"),
        "utf8"
      )
    ).name,
    "@acme-platform/api-client"
  );
  assert.deepEqual(
    JSON.parse(await readFile(join(projectRoot, ".mono-stack.json"))),
    stackConfig
  );
  const environmentExample = await readFile(
    join(projectRoot, ".env.example"),
    "utf8"
  );
  assert.equal(
    await readFile(join(projectRoot, ".env"), "utf8"),
    environmentExample
  );
  const webPackage = JSON.parse(
    await readFile(join(projectRoot, "apps/web/package.json"), "utf8")
  );
  const serverPackage = JSON.parse(
    await readFile(join(projectRoot, "apps/server/package.json"), "utf8")
  );
  assert.equal(webPackage.version, "1.0.0");
  assert.equal(webPackage.scripts.test, "vitest run");
  assert.equal(webPackage.devDependencies.vitest, "^4.1.11");
  assert.equal(
    webPackage.scripts["dev:reference"],
    "node ../../scripts/run-app.mjs reference"
  );
  assert.equal(
    webPackage.scripts["build:reference"],
    "pnpm routes:generate:reference && vite build reference --config vite.config.ts"
  );
  assert.equal(webPackage.scripts.build, "tsc -b && vite build");
  assert.equal(
    webPackage.dependencies["@acme-platform/api-client"],
    "workspace:^"
  );
  assert.equal(serverPackage.version, "1.0.0");
  assert.equal(
    serverPackage.scripts.test,
    "pnpm test:unit && pnpm test:api:e2e"
  );
  assert.equal(serverPackage.scripts["test:e2e"], "pnpm test:api:e2e");
  assert.equal(serverPackage.devDependencies.jest, undefined);
  assert.equal(serverPackage.devDependencies["ts-jest"], undefined);
  assert.equal(serverPackage.jest, undefined);
  await access(join(projectRoot, "apps/web/vitest.config.ts"));
  await access(join(projectRoot, "apps/server/vitest.config.ts"));
  await access(join(projectRoot, "apps/server/vitest.e2e.config.ts"));
  await assert.rejects(
    readFile(join(projectRoot, "apps/server/test/jest-e2e.json"), "utf8")
  );
  assert.equal(
    serverPackage.scripts["build:reference"],
    "nest build --config nest-cli.reference.json"
  );
  assert.equal(serverPackage.dependencies["@acme-platform/db"], "workspace:^");
  assert.equal(
    serverPackage.dependencies["@acme-platform/auth"],
    "workspace:^"
  );
  for (const path of [
    "apps/server/src/http/auth/auth.controller.ts",
    "apps/server/src/http/auth/auth.module.ts",
    "apps/server/src/infra/auth/auth-handler.provider.ts",
    "apps/server/src/infra/auth/auth.constants.ts",
    "apps/server/src/http/auth/auth.controller.spec.ts"
  ]) {
    await access(join(projectRoot, path));
  }
  for (const path of [
    "apps/server/src/auth.controller.ts",
    "apps/server/src/auth.module.ts",
    "apps/server/src/auth.constants.ts"
  ]) {
    await assert.rejects(access(join(projectRoot, path)));
  }
  await assert.rejects(readFile(join(projectRoot, "copier.yml"), "utf8"));
  await assert.rejects(readFile(join(projectRoot, "core"), "utf8"));
  await assert.rejects(readFile(join(projectRoot, "docs/checklists"), "utf8"));
  await assert.rejects(readFile(join(projectRoot, ".npmrc"), "utf8"));
  assert.doesNotMatch(
    await readFile(join(projectRoot, "pnpm-workspace.yaml"), "utf8"),
    /core\/\*/
  );
  assert.doesNotMatch(
    await readFile(join(projectRoot, "pnpm-lock.yaml"), "utf8"),
    /^ {2}core\//m
  );
  assert.match(
    await readFile(join(projectRoot, ".gitignore"), "utf8"),
    /^\.env$/m
  );
  assert.equal(
    await readFile(
      join(projectRoot, ".github/workflows/template-check.yml"),
      "utf8"
    ),
    "name: Template check\n"
  );
  assert.equal(
    await readFile(join(projectRoot, "LICENSE"), "utf8"),
    await readFile(join(templateRoot, "LICENSE"), "utf8")
  );
  assert.equal(
    await readFile(join(projectRoot, "mise.toml"), "utf8"),
    await readFile(join(templateRoot, "mise.toml"), "utf8")
  );
  await access(join(projectRoot, "compose.yaml"));
  assert.match(
    await readFile(join(projectRoot, "compose.yaml"), "utf8"),
    /postgres:\n[\s\S]*redis:\n[\s\S]*open-design:/
  );
  assert.match(
    await readFile(join(projectRoot, "Justfile"), "utf8"),
    /setup:\n {4}pnpm install --frozen-lockfile\n {4}docker compose up -d\n {4}pnpm build/
  );

  const generatedReadme = await readFile(
    join(projectRoot, "README.md"),
    "utf8"
  );
  assert.match(generatedReadme, /## Template updates/);
  assert.match(
    generatedReadme,
    /Native Vite source, configuration, scripts, dependency placement, and dependency versions remain authoritative/
  );
  assert.match(generatedReadme, /isolated application under reference\//);
  assert.match(
    generatedReadme,
    /custom-path and unsupported native apps remain untouched/i
  );
  assert.match(generatedReadme, /mise\.toml declares the latest Python/);
  assert.match(generatedReadme, /create the baseline commit/);
  assert.match(generatedReadme, /selected stack in \.mono-stack\.json/);
  assert.match(generatedReadme, /mono-stack\.template-host-alias/);
  assert.match(generatedReadme, /pnpm template:update/);
  assert.doesNotMatch(generatedReadme, /python3 -m venv/);
  assert.doesNotMatch(generatedReadme, /copier copy/);
  assert.doesNotMatch(generatedReadme, /core\/create-mono-stack/);

  const generatedAgents = await readFile(
    join(projectRoot, "AGENTS.md"),
    "utf8"
  );
  assert.doesNotMatch(generatedAgents, /core\/create-mono-stack/);
  assert.doesNotMatch(generatedAgents, /pnpm --filter create-mono-stack test/);
  assert.equal(
    (await readFile(join(projectRoot, "CLAUDE.md"), "utf8")).trim(),
    "@AGENTS.md"
  );
  assert.equal(
    (await readFile(join(projectRoot, "apps/server/CLAUDE.md"), "utf8")).trim(),
    "@AGENTS.md"
  );

  // TEST-GATE-021: generated projects ship the skill-invocation gate.
  await access(join(projectRoot, "scripts/skill-gate.mjs"));
  const generatedTriggers = JSON.parse(
    await readFile(join(projectRoot, ".claude/skill-triggers.json"), "utf8")
  );
  assert.ok(generatedTriggers.always.includes("test-first-workflow"));
  assert.match(
    await readFile(join(projectRoot, ".claude/settings.json"), "utf8"),
    /skill-gate\.mjs/
  );
  assert.match(
    await readFile(join(projectRoot, "scripts/update-template.mjs"), "utf8"),
    /mono-stack\.template-host-alias/
  );
}

export function assertReferenceTaskGraph(graph) {
  const tasks = new Map(graph.tasks.map((task) => [task.taskId, task]));
  const expectedDependencies = new Map([
    [
      "web#dev:reference",
      [
        "@acme-platform/api-client#build",
        "@acme-platform/entities#build",
        "@acme-platform/env#build",
        "@acme-platform/query-client#build",
        "@acme-platform/ui#build"
      ]
    ],
    [
      "server#dev:reference",
      [
        "@acme-platform/auth#build",
        "@acme-platform/db#build",
        "@acme-platform/env#build"
      ]
    ]
  ]);

  for (const [taskId, dependencies] of expectedDependencies) {
    const task = tasks.get(taskId);
    assert.ok(task, `Missing ${taskId} from Turbo's development graph`);
    assert.deepEqual(task.resolvedTaskDefinition.dependsOn, ["^build"]);
    assert.deepEqual([...task.dependencies].sort(), [...dependencies].sort());
  }
}

export async function assertReferenceBuilds({ projectRoot, run }) {
  run("pnpm", ["build"], { cwd: projectRoot, timeout: 180_000 });
  run("pnpm", ["--filter", "web", "build"], {
    cwd: projectRoot,
    timeout: 180_000
  });
  run("pnpm", ["--filter", "web", "build:reference"], {
    cwd: projectRoot,
    timeout: 180_000
  });
  run("pnpm", ["--filter", "web", "test"], {
    cwd: projectRoot,
    timeout: 180_000
  });
  run("pnpm", ["--filter", "server", "test"], {
    cwd: projectRoot,
    timeout: 180_000
  });
  run("pnpm", ["--filter", "server", "test:e2e"], {
    cwd: projectRoot,
    timeout: 180_000
  });
  run("pnpm", ["--filter", "server", "build:reference"], {
    cwd: projectRoot,
    timeout: 180_000
  });
  await access(join(projectRoot, "apps/web/dist/index.html"));
  await access(join(projectRoot, "apps/web/reference/dist/index.html"));
  await access(join(projectRoot, "apps/server/dist/reference/main.js"));
}
