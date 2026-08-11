import { basename, resolve } from "node:path";
import { stdin, stdout } from "node:process";

import { Box, Text, render, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import { createElement, useRef, useState } from "react";

const h = createElement;
const defaultDestination = "my-project";
const advancedChoices = [
  { label: "Use defaults", value: false },
  { label: "Configure advanced options", value: true }
];
const confirmationChoices = [
  { label: "Create project", value: true },
  { label: "Cancel", value: false }
];
const advancedSteps = [
  {
    field: "gitHostAlias",
    label: "Git SSH host alias",
    next: "python",
    placeholder: "optional"
  },
  {
    field: "python",
    label: "Python executable",
    next: "template",
    placeholder: "auto-detect"
  },
  {
    field: "template",
    label: "Template source",
    next: "vcsRef",
    placeholder: "latest stable template"
  },
  {
    field: "vcsRef",
    label: "Template revision",
    next: "confirm",
    placeholder: "latest stable version"
  }
];

function WizardFrame({ children }) {
  return h(
    Box,
    { flexDirection: "column" },
    h(
      Box,
      {
        borderColor: "cyan",
        borderStyle: "round",
        flexDirection: "column",
        paddingX: 1
      },
      h(Text, { bold: true, color: "cyan" }, "create-mono-stack"),
      h(Text, { dimColor: true }, "Interactive project setup"),
      h(Box, { flexDirection: "column", marginTop: 1 }, children)
    ),
    h(Text, { dimColor: true }, "Enter select | Esc cancel")
  );
}

function TextQuestion({ label, onSubmit, placeholder }) {
  const [value, setValue] = useState("");

  return h(
    Box,
    { flexDirection: "column" },
    h(Text, { bold: true }, label),
    h(
      Box,
      { marginTop: 1 },
      h(Text, { color: "cyan" }, "> "),
      h(TextInput, {
        onChange: setValue,
        onSubmit,
        placeholder,
        value
      })
    )
  );
}

function ChoiceQuestion({ items, label, onSelect }) {
  return h(
    Box,
    { flexDirection: "column" },
    h(Text, { bold: true }, label),
    h(Box, { marginTop: 1 }, h(SelectInput, { items, onSelect }))
  );
}

function SummaryLine({ label, value }) {
  return h(Text, null, h(Text, { dimColor: true }, `${label}: `), value);
}

function Confirmation({ answers, onSelect }) {
  const lines = [
    ["Destination", answers.destination],
    ["Project name", answers.projectName],
    ["SSH alias", answers.gitHostAlias || "none"],
    ["Python", answers.python || "auto-detect"],
    ["Template", answers.template || "latest stable"],
    ["Revision", answers.vcsRef || "latest stable"]
  ];

  return h(
    Box,
    { flexDirection: "column" },
    h(Text, { bold: true }, "Ready to create"),
    h(
      Box,
      { flexDirection: "column", marginY: 1 },
      ...lines.map(([label, value]) =>
        h(SummaryLine, { key: label, label, value })
      )
    ),
    h(SelectInput, { items: confirmationChoices, onSelect })
  );
}

export function buildProjectArguments(answers) {
  const args = [`--name=${answers.projectName}`];
  const options = [
    ["--git-host-alias", answers.gitHostAlias],
    ["--python", answers.python],
    ["--template", answers.template],
    ["--vcs-ref", answers.vcsRef]
  ];
  for (const [name, value] of options) {
    if (value) args.push(`${name}=${value}`);
  }
  args.push("--", answers.destination);
  return args;
}

export function ProjectWizard({ onComplete }) {
  const { exit } = useApp();
  const completed = useRef(false);
  const [step, setStep] = useState("destination");
  const [answers, setAnswers] = useState({
    destination: "",
    gitHostAlias: "",
    projectName: "",
    python: "",
    template: "",
    vcsRef: ""
  });

  function complete(result) {
    if (completed.current) return;
    completed.current = true;
    onComplete(result);
    exit();
  }

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === "c")) complete(undefined);
  });

  let content;
  if (step === "destination") {
    content = h(TextQuestion, {
      key: step,
      label: "Destination directory",
      onSubmit(value) {
        const destination = value.trim() || defaultDestination;
        setAnswers((current) => ({ ...current, destination }));
        setStep("projectName");
      },
      placeholder: defaultDestination
    });
  } else if (step === "projectName") {
    const defaultProjectName = basename(resolve(answers.destination));
    content = h(TextQuestion, {
      key: step,
      label: "Project name",
      onSubmit(value) {
        const projectName = value.trim() || defaultProjectName;
        setAnswers((current) => ({ ...current, projectName }));
        setStep("advanced");
      },
      placeholder: defaultProjectName
    });
  } else if (step === "advanced") {
    content = h(ChoiceQuestion, {
      items: advancedChoices,
      label: "Advanced options",
      onSelect(item) {
        setStep(item.value ? advancedSteps[0].field : "confirm");
      }
    });
  } else if (step === "confirm") {
    content = h(Confirmation, {
      answers,
      onSelect(item) {
        complete(item.value ? buildProjectArguments(answers) : undefined);
      }
    });
  } else {
    const currentStep = advancedSteps.find(({ field }) => field === step);
    content = h(TextQuestion, {
      key: step,
      label: currentStep.label,
      onSubmit(value) {
        setAnswers((current) => ({
          ...current,
          [currentStep.field]: value.trim()
        }));
        setStep(currentStep.next);
      },
      placeholder: currentStep.placeholder
    });
  }

  return h(WizardFrame, null, content);
}

export async function promptForProjectArguments({
  input = stdin,
  output = stdout,
  renderApp = render
} = {}) {
  let completeWizard;
  const result = new Promise((resolveResult) => {
    completeWizard = resolveResult;
  });
  const app = renderApp(h(ProjectWizard, { onComplete: completeWizard }), {
    exitOnCtrlC: false,
    stdin: input,
    stdout: output
  });
  const exited = app.waitUntilExit();

  try {
    return await Promise.race([result, exited.then(() => undefined)]);
  } finally {
    app.unmount();
    await exited;
  }
}
