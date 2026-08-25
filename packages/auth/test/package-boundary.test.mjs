import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("publishes the supported auth entrypoints without deferred integrations", async () => {
  const packageManifest = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8")
  );

  for (const entrypoint of ["index", "server", "web", "expo"]) {
    const exportConfig =
      packageManifest.exports[entrypoint === "index" ? "." : `./${entrypoint}`];
    assert.equal(exportConfig.default, `./dist/${entrypoint}.js`);
    assert.equal(exportConfig.types, `./dist/${entrypoint}.d.ts`);
    await readFile(new URL(`../dist/${entrypoint}.js`, import.meta.url));
    await readFile(new URL(`../dist/${entrypoint}.d.ts`, import.meta.url));
  }

  assert.equal(packageManifest.dependencies["@aws-sdk/client-ses"], undefined);
  assert.equal(
    packageManifest.dependencies["better-auth"].includes("1.7"),
    true
  );
});
