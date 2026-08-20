import { stdin, stdout } from "node:process";

import { Box, Text, render, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import { createElement, useState } from "react";

import { MANAGEABLE_APP_DEFINITIONS } from "./project-management.js";

const h = createElement;
const back = "__back__";

function Header({ description, label }) {
  return h(
    Box,
    { flexDirection: "column" },
    h(Text, { bold: true }, label),
    h(Text, { dimColor: true }, description)
  );
}

function Item({ label, isSelected = false }) {
  return h(Text, { color: isSelected ? "blue" : undefined }, label);
}

function Choice({ description, items, label, onSelect }) {
  return h(
    Box,
    { flexDirection: "column" },
    h(Header, { description, label }),
    h(
      Box,
      { marginTop: 1 },
      h(SelectInput, { itemComponent: Item, items, onSelect })
    )
  );
}

function Entry({ description, label, onSubmit, placeholder }) {
  const [value, setValue] = useState("");
  return h(
    Box,
    { flexDirection: "column" },
    h(Header, { description, label }),
    h(
      Box,
      { marginTop: 1 },
      h(Text, { color: "cyan" }, "> "),
      h(TextInput, { onChange: setValue, onSubmit, placeholder, value })
    )
  );
}

const actions = [
  { label: "Add app", value: "add-app" },
  { label: "Remove app", value: "remove-app" },
  { label: "Add package", value: "add-package" },
  { label: "Remove package", value: "remove-package" },
  { label: "Cancel", value: "cancel" }
];

export function ManagementWizard({ apps, packages, onComplete }) {
  const { exit } = useApp();
  const [step, setStep] = useState("action");
  const [selection, setSelection] = useState({});

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === "c")) {
      onComplete(undefined);
      exit();
    }
  });

  function complete(action) {
    onComplete(action);
    exit();
  }

  if (step === "action") {
    return h(Choice, {
      description: "Change an existing generated project.",
      items: actions,
      label: "Project management",
      onSelect(item) {
        if (item.value === "cancel") return complete(undefined);
        setSelection({ action: item.value });
        setStep(item.value);
      }
    });
  }

  if (step === "add-app") {
    return h(Choice, {
      description: "Choose an app generator supported by create-mono-stack.",
      items: MANAGEABLE_APP_DEFINITIONS.map(({ feature, generator }) => ({
        label: `${feature} (${generator})`,
        value: feature
      })),
      label: "App type",
      onSelect(item) {
        setSelection((current) => ({ ...current, feature: item.value }));
        setStep("add-app-name");
      }
    });
  }

  if (step === "add-app-name") {
    return h(Entry, {
      description: "Use a unique folder name under apps/.",
      label: "New app name",
      onSubmit: (name) => complete({ ...selection, name: name.trim() }),
      placeholder: "admin"
    });
  }

  if (step === "add-package") {
    return h(Entry, {
      description: "Create a user-owned package under packages/.",
      label: "New package name",
      onSubmit: (name) => complete({ ...selection, name: name.trim() }),
      placeholder: "billing"
    });
  }

  const choices = step === "remove-app" ? apps : packages;
  if (step === "remove-app" || step === "remove-package") {
    if (choices.length === 0) {
      return h(Choice, {
        description: "There are no removable entries of this type.",
        items: [{ label: "Back", value: back }],
        label: "Nothing to remove",
        onSelect: () => setStep("action")
      });
    }
    return h(Choice, {
      description: "Removal permanently deletes the selected directory.",
      items: [
        ...choices.map(({ name, path }) => ({
          label: `${name} (${path})`,
          value: name
        })),
        { label: "Back", value: back }
      ],
      label: step === "remove-app" ? "Remove app" : "Remove package",
      onSelect(item) {
        if (item.value === back) return setStep("action");
        setSelection((current) => ({
          ...current,
          action: step,
          name: item.value
        }));
        setStep("confirm-remove");
      }
    });
  }

  if (step === "confirm-remove") {
    return h(Choice, {
      description: `Permanently delete ${selection.name} and run pnpm install?`,
      items: [
        { label: "Delete permanently", value: true },
        { label: "Cancel", value: false }
      ],
      label: "Confirm removal",
      onSelect(item) {
        if (!item.value) return complete(undefined);
        complete({ ...selection, confirmed: true });
      }
    });
  }

  return null;
}

export async function promptForProjectManagement({
  apps,
  input = stdin,
  output = stdout,
  packages,
  renderApp = render
} = {}) {
  let completeWizard;
  const result = new Promise((resolveResult) => {
    completeWizard = resolveResult;
  });
  const app = renderApp(
    h(ManagementWizard, { apps, onComplete: completeWizard, packages }),
    { exitOnCtrlC: false, stdin: input, stdout: output }
  );
  const exited = app.waitUntilExit();
  try {
    return await Promise.race([result, exited.then(() => undefined)]);
  } finally {
    app.unmount();
    await exited;
  }
}
