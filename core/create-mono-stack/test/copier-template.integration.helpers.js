import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function assertGeneratedProject({ projectRoot, templateRoot }) {
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
    JSON.parse(
      await readFile(
        join(projectRoot, "packages/api-client/package.json"),
        "utf8"
      )
    ).name,
    "@repo/api-client"
  );
  await assert.rejects(readFile(join(projectRoot, "copier.yml"), "utf8"));
  await assert.rejects(readFile(join(projectRoot, "core"), "utf8"));
  await assert.rejects(readFile(join(projectRoot, ".npmrc"), "utf8"));
  assert.doesNotMatch(
    await readFile(join(projectRoot, "pnpm-workspace.yaml"), "utf8"),
    /core\/\*/
  );
  assert.doesNotMatch(
    await readFile(join(projectRoot, "pnpm-lock.yaml"), "utf8"),
    /^ {2}core\//m
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

  const generatedReadme = await readFile(
    join(projectRoot, "README.md"),
    "utf8"
  );
  assert.match(generatedReadme, /## Template updates/);
  assert.match(generatedReadme, /mono-stack\.template-host-alias/);
  assert.match(generatedReadme, /pnpm template:update/);
  assert.doesNotMatch(generatedReadme, /copier copy/);
  assert.doesNotMatch(generatedReadme, /core\/create-mono-stack/);

  const generatedAgents = await readFile(
    join(projectRoot, "AGENTS.md"),
    "utf8"
  );
  assert.doesNotMatch(generatedAgents, /core\/create-mono-stack/);
  assert.doesNotMatch(generatedAgents, /pnpm --filter create-mono-stack test/);
  assert.match(
    await readFile(join(projectRoot, "scripts/update-template.mjs"), "utf8"),
    /mono-stack\.template-host-alias/
  );
}

export function assertDevelopmentTaskGraph(graph) {
  const tasks = new Map(graph.tasks.map((task) => [task.taskId, task]));
  const expectedDependencies = new Map([
    [
      "web#dev",
      [
        "@repo/api-client#build",
        "@repo/entities#build",
        "@repo/env#build",
        "@repo/query-client#build"
      ]
    ],
    ["server#dev", ["@repo/db#build", "@repo/env#build"]]
  ]);

  for (const [taskId, dependencies] of expectedDependencies) {
    const task = tasks.get(taskId);
    assert.ok(task, `Missing ${taskId} from Turbo's development graph`);
    assert.deepEqual(task.resolvedTaskDefinition.dependsOn, ["^build"]);
    assert.deepEqual([...task.dependencies].sort(), [...dependencies].sort());
  }
}
