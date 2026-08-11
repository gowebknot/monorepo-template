import { basename, resolve } from "node:path";
import { stdin, stdout } from "node:process";

import { Box, Text, render, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import { createElement, useRef, useState } from "react";
import { discoverWizardOptions } from "./wizard-discovery.js";

export { parseSshAliases } from "./wizard-discovery.js";

const h = createElement;
const defaultDestination = "my-project";
const advancedChoices = [
  { label: "Use defaults", value: false },
  { label: "Configure advanced options", value: true }
];
const customChoice = "__custom__";
const backChoice = "__back__";
const destinationChoices = [
  { label: "my-project (recommended)", value: "my-project" },
  { label: "Custom destination", value: customChoice }
];
const confirmationChoices = [
  { label: "Create project", value: true },
  { label: "Cancel", value: false },
  { label: "Back", value: backChoice }
];
const advancedSteps = [
  {
    field: "gitHostAlias",
    label: "Git SSH host alias",
    next: "python",
    previous: "advanced",
    choices: [
      { label: "No alias (default: none)", value: "" },
      { label: "Custom alias", value: customChoice }
    ],
    placeholder: "github host alias"
  },
  {
    field: "python",
    label: "Python executable",
    next: "template",
    previous: "gitHostAlias",
    choices: [
      { label: "Auto-detect (runtime discovery)", value: "" },
      { label: "Custom executable", value: customChoice }
    ],
    placeholder: "path to Python 3.10+"
  },
  {
    field: "template",
    label: "Template source",
    next: "vcsRef",
    previous: "python",
    choices: [
      { label: "Latest stable template (canonical GitHub source)", value: "" },
      { label: "Custom template source", value: customChoice }
    ],
    placeholder: "Git URL or local path"
  },
  {
    field: "vcsRef",
    label: "Template revision",
    next: "confirm",
    previous: "template",
    choices: [
      { label: "Latest stable version (template default)", value: "" },
      { label: "Custom revision", value: customChoice }
    ],
    placeholder: "tag, branch, or commit"
  }
];

function advancedStepsWithOptions(options) {
  return advancedSteps.map((step) =>
    step.field === "python" && options.python
      ? {
          ...step,
          choices: [step.choices[0], ...options.python, step.choices.at(-1)]
        }
      : step.field === "gitHostAlias" && options.gitHostAliases
        ? {
            ...step,
            choices: [
              step.choices[0],
              ...options.gitHostAliases,
              step.choices.at(-1)
            ]
          }
        : step.field === "template" && options.templateSources
          ? {
              ...step,
              choices: [
                step.choices[0],
                ...options.templateSources,
                step.choices.at(-1)
              ]
            }
          : step.field === "vcsRef" && options.vcsRefs
            ? {
                ...step,
                choices: [
                  step.choices[0],
                  ...options.vcsRefs,
                  step.choices.at(-1)
                ]
              }
            : step
  );
}

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

function ChoiceQuestion({ items, label, onSelect, showBack = false }) {
  const choices = showBack
    ? [...items, { label: "Back", value: backChoice }]
    : items;
  return h(
    Box,
    { flexDirection: "column" },
    h(Text, { bold: true }, label),
    h(Box, { marginTop: 1 }, h(SelectInput, { items: choices, onSelect }))
  );
}

function customStep(field) {
  return `custom:${field}`;
}

function projectNameChoices(destination) {
  return [
    {
      label: `${basename(resolve(destination))} (derived from destination)`,
      value: basename(resolve(destination))
    },
    { label: "Custom project name", value: customChoice }
  ];
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

export function ProjectWizard({ onComplete, options = {} }) {
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
  const steps = advancedStepsWithOptions(options);

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
    content = h(ChoiceQuestion, {
      key: step,
      items: options.destinations
        ? [
            destinationChoices[0],
            ...options.destinations,
            destinationChoices[1]
          ]
        : destinationChoices,
      label: "Destination directory",
      onSelect(item) {
        if (item.value === customChoice) {
          setStep(customStep("destination"));
          return;
        }
        setAnswers((current) => ({ ...current, destination: item.value }));
        setStep("projectName");
      }
    });
  } else if (step === "projectName") {
    content = h(ChoiceQuestion, {
      key: step,
      items: projectNameChoices(answers.destination),
      label: "Project name",
      showBack: true,
      onSelect(item) {
        if (item.value === backChoice) {
          setStep("destination");
          return;
        }
        if (item.value === customChoice) {
          setStep(customStep("projectName"));
          return;
        }
        setAnswers((current) => ({ ...current, projectName: item.value }));
        setStep("advanced");
      }
    });
  } else if (step === "advanced") {
    content = h(ChoiceQuestion, {
      items: advancedChoices,
      label: "Advanced options",
      showBack: true,
      onSelect(item) {
        if (item.value === backChoice) {
          setStep("projectName");
          return;
        }
        setStep(item.value ? steps[0].field : "confirm");
      }
    });
  } else if (step === "confirm") {
    content = h(Confirmation, {
      answers,
      onSelect(item) {
        if (item.value === backChoice) {
          setStep("advanced");
          return;
        }
        complete(item.value ? buildProjectArguments(answers) : undefined);
      }
    });
  } else {
    const currentStep = steps.find(({ field }) => field === step);
    if (currentStep) {
      content = h(ChoiceQuestion, {
        key: step,
        items: currentStep.choices,
        label: currentStep.label,
        showBack: true,
        onSelect(item) {
          if (item.value === backChoice) {
            setStep(currentStep.previous);
            return;
          }
          if (item.value === customChoice) {
            setStep(customStep(currentStep.field));
            return;
          }
          setAnswers((current) => ({
            ...current,
            [currentStep.field]: item.value
          }));
          setStep(currentStep.next);
        }
      });
    } else {
      const customField = step.slice("custom:".length);
      const customStepDefinition =
        customField === "destination"
          ? {
              label: "Destination directory",
              next: "projectName",
              placeholder: defaultDestination
            }
          : customField === "projectName"
            ? {
                label: "Project name",
                next: "advanced",
                placeholder: basename(resolve(answers.destination))
              }
            : steps.find(({ field }) => field === customField);
      content = h(TextQuestion, {
        key: step,
        label: customStepDefinition.label,
        onSubmit(value) {
          const fallback =
            customField === "destination"
              ? defaultDestination
              : customField === "projectName"
                ? basename(resolve(answers.destination))
                : "";
          setAnswers((current) => ({
            ...current,
            [customField]: value.trim() || fallback
          }));
          setStep(customStepDefinition.next);
        },
        placeholder: customStepDefinition.placeholder
      });
    }
  }

  return h(WizardFrame, null, content);
}

export async function promptForProjectArguments({
  input = stdin,
  output = stdout,
  renderApp = render,
  discoverOptions = discoverWizardOptions
} = {}) {
  let completeWizard;
  const result = new Promise((resolveResult) => {
    completeWizard = resolveResult;
  });
  const options = await discoverOptions();
  const app = renderApp(
    h(ProjectWizard, { onComplete: completeWizard, options }),
    {
      exitOnCtrlC: false,
      stdin: input,
      stdout: output
    }
  );
  const exited = app.waitUntilExit();

  try {
    return await Promise.race([result, exited.then(() => undefined)]);
  } finally {
    app.unmount();
    await exited;
  }
}
