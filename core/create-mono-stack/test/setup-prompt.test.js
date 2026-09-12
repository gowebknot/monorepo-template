import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import test from "node:test";

import { promptForSetup } from "#src/setup-prompt.js";

function fakeStreams() {
  const input = new PassThrough();
  const output = new PassThrough();
  output.on("data", () => {});
  return { input, output };
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((resolvePromise, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

test("TEST-SETUPINT-001 resolves true for a real y answer", async () => {
  const { input, output } = fakeStreams();
  const result = promptForSetup({ input, output });
  input.write("y\n");
  assert.equal(await withTimeout(result, 2000, "timed out"), true);
});

test("TEST-SETUPINT-002 resolves false for a real n or empty answer", async () => {
  const first = fakeStreams();
  const firstResult = promptForSetup(first);
  first.input.write("n\n");
  assert.equal(await withTimeout(firstResult, 2000, "timed out"), false);

  const second = fakeStreams();
  const secondResult = promptForSetup(second);
  second.input.write("\n");
  assert.equal(await withTimeout(secondResult, 2000, "timed out"), false);
});

test("TEST-SETUPINT-003 resolves false when the input stream closes before an answer", async () => {
  const { input, output } = fakeStreams();
  const result = promptForSetup({ input, output });
  input.end();
  assert.equal(
    await withTimeout(
      result,
      2000,
      "promptForSetup left an unsettled promise after the input stream closed"
    ),
    false
  );
});
