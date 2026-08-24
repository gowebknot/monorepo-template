import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoots = [
  "apps",
  "packages",
  "core/create-mono-stack/reference-templates/managed"
];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

async function collectSourceFiles(directory) {
  const entries = await readdir(join(repositoryRoot, directory), {
    withFileTypes: true
  });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
    } else if (
      sourceExtensions.has(entry.name.slice(entry.name.lastIndexOf(".")))
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

function findManualFormManagement(source, filePath) {
  if (filePath.includes("/components/forms/")) {
    return [];
  }

  const controlledInputPattern =
    /<(?:Input|TextInput|textarea|select)\b[\s\S]*?\bvalue=\{[^}]+\}[\s\S]*?\bonChange(?:Text)?=/g;
  const reversedControlledInputPattern =
    /<(?:Input|TextInput|textarea|select)\b[\s\S]*?\bonChange(?:Text)?=[\s\S]*?\bvalue=\{[^}]+\}/g;

  return [
    ...source.matchAll(controlledInputPattern),
    ...source.matchAll(reversedControlledInputPattern)
  ].map((match) => ({
    filePath,
    snippet: match[0].replace(/\s+/g, " ").slice(0, 180)
  }));
}

async function scanForManualFormManagement() {
  const findings = [];
  for (const sourceRoot of sourceRoots) {
    for (const filePath of await collectSourceFiles(sourceRoot)) {
      const source = await readFile(join(repositoryRoot, filePath), "utf8");
      findings.push(
        ...findManualFormManagement(source, relative(repositoryRoot, filePath))
      );
    }
  }
  return findings;
}

test("TEST-FORM-005 rejects controlled local form inputs", () => {
  const findings = findManualFormManagement(
    'const [title, setTitle] = useState("");\n<Input value={title} onChange={(event) => setTitle(event.target.value)} />',
    "apps/example/src/form.tsx"
  );

  assert.equal(findings.length, 1);
});

test("TEST-FORM-005 allows TanStack Form adapters", () => {
  const findings = findManualFormManagement(
    "<Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />",
    "apps/example/src/components/forms/field.tsx"
  );

  assert.deepEqual(findings, []);
});

test("TEST-FORM-005 finds no manual form management in repository apps or templates", async () => {
  const findings = await scanForManualFormManagement();
  assert.deepEqual(findings, []);
});
