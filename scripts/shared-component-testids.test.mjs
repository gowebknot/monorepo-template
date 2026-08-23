import assert from "node:assert/strict";
import test from "node:test";

import {
  checkSharedComponentSource,
  checkStagedSharedComponents
} from "./shared-component-testids.mjs";

const validComponent = `
function Button({ "data-testid": testId, ...props }: Props & TestIdProps) {
  return <button data-testid={testId} {...props} />;
}

export { Button };
`;

test("TEST-UI-001 accepts a rendered component with a required test ID contract", () => {
  assert.deepEqual(
    checkSharedComponentSource(
      validComponent,
      "packages/ui/src/components/ui/button.tsx"
    ),
    []
  );
});

test("TEST-UI-002 rejects a rendered component without a test ID contract", () => {
  const issues = checkSharedComponentSource(
    "function Button(props: Props) { return <button {...props} />; }\nexport { Button };",
    "packages/ui/src/components/ui/button.tsx"
  );

  assert.deepEqual(issues, [
    "packages/ui/src/components/ui/button.tsx: Button must use required TestIdProps and forward data-testid"
  ]);
});

test("TEST-UI-003 accepts documented non-rendering helpers without test IDs", () => {
  assert.deepEqual(
    checkSharedComponentSource(
      `function Select(props: RootProps) { return null; }\nexport { Select };`,
      "packages/ui/src/components/ui/select.tsx"
    ),
    []
  );
});

test("TEST-UI-004 rejects invalid staged shared components and ignores unrelated files", async () => {
  const issues = await checkStagedSharedComponents({
    files: [
      "apps/web/src/routes/home.tsx",
      "packages/ui/src/components/ui/new-card.tsx"
    ],
    readFile: async () =>
      "function NewCard(props: Props) { return <div {...props} />; }\nexport { NewCard };"
  });

  assert.deepEqual(issues, [
    "packages/ui/src/components/ui/new-card.tsx: NewCard must use required TestIdProps and forward data-testid"
  ]);
});

test("TEST-UI-006 discovers valid future components without an allowlist", async () => {
  const issues = await checkStagedSharedComponents({
    files: ["packages/ui/src/components/ui/future-widget.tsx"],
    readFile: async () => validComponent.replaceAll("Button", "FutureWidget")
  });

  assert.deepEqual(issues, []);
});
