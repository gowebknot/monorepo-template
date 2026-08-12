import { basename, resolve } from "node:path";
import { stdin, stdout } from "node:process";

import { Box, Text, render, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import { createElement, useRef, useState } from "react";
import {
  DEFAULT_APP_NAMES,
  DEFAULT_FEATURES,
  DEFAULT_FEATURE_NAMES,
  FEATURE_DEFINITIONS
} from "./feature-config.js";
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
    h(Text, { dimColor: true }, "Enter select | Space toggle | Esc cancel")
  );
}

function TextQuestion({ label, onBack, onSubmit, placeholder }) {
  const [value, setValue] = useState("");
  const [backFocused, setBackFocused] = useState(false);

  useInput((input, key) => {
    if (key.tab) {
      setBackFocused((current) => !current);
      return;
    }
    if (backFocused && key.return) onBack?.();
  });

  return h(
    Box,
    { flexDirection: "column" },
    h(Text, { bold: true }, label),
    h(
      Box,
      { marginTop: 1 },
      h(Text, { color: "cyan" }, "> "),
      backFocused
        ? h(Text, { dimColor: true }, value || placeholder)
        : h(TextInput, {
            onChange: setValue,
            onSubmit,
            placeholder,
            value
          })
    ),
    h(
      Text,
      { color: backFocused ? "cyan" : undefined },
      `${backFocused ? "❯" : " "} Back`
    ),
    h(Text, { dimColor: true }, "Tab focus Back | Enter submit/select")
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

function FeatureQuestion({ onBack, onSubmit, selected }) {
  const [cursor, setCursor] = useState(0);
  const [current, setCurrent] = useState(() => new Set(selected));

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((value) =>
        value === 0 ? FEATURE_DEFINITIONS.length - 1 : value - 1
      );
      return;
    }
    if (key.downArrow) {
      setCursor((value) => (value + 1) % FEATURE_DEFINITIONS.length);
      return;
    }
    if (input === " ") {
      setCurrent((value) => {
        const next = new Set(value);
        const id = FEATURE_DEFINITIONS[cursor].id;
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }
    if (key.leftArrow) {
      onBack();
      return;
    }
    if (key.return) {
      onSubmit(
        FEATURE_DEFINITIONS.filter(({ id }) => current.has(id)).map(
          ({ id }) => id
        )
      );
    }
  });

  return h(
    Box,
    { flexDirection: "column" },
    h(Text, { bold: true }, "Stack features"),
    h(
      Box,
      { flexDirection: "column", marginTop: 1 },
      ...FEATURE_DEFINITIONS.map(({ id, label }, index) =>
        h(
          Text,
          { key: id, color: index === cursor ? "cyan" : undefined },
          `${index === cursor ? "❯" : " "} [${current.has(id) ? "x" : " "}] ${label}`
        )
      )
    ),
    h(Text, { dimColor: true }, "Space toggle | Enter continue | Left go back")
  );
}

function customStep(field) {
  return `custom:${field}`;
}

function featureNameStep(featureId) {
  return `feature-name:${featureId}`;
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
    ["Features", answers.features.join(", ")],
    ...answers.features.map((featureId) => [
      `${FEATURE_DEFINITIONS.find(({ id }) => id === featureId)?.label ?? featureId} name`,
      answers.featureNames[featureId]
    ]),
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
  const features = answers.features ?? DEFAULT_FEATURES;
  const featureNames = answers.featureNames ?? DEFAULT_FEATURE_NAMES;
  const args = [
    `--name=${answers.projectName}`,
    `--features=${features.join(",")}`,
    ...features.map(
      (featureId) => `--app-name=${featureId}:${featureNames[featureId]}`
    )
  ];
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
    features: DEFAULT_FEATURES,
    featureNames: { ...DEFAULT_FEATURE_NAMES },
    serverAppName: DEFAULT_APP_NAMES.serverAppName,
    webAppName: DEFAULT_APP_NAMES.webAppName,
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
        setStep("features");
      }
    });
  } else if (step === "features") {
    content = h(FeatureQuestion, {
      onBack() {
        setStep("projectName");
      },
      onSubmit(features) {
        setAnswers((current) => ({ ...current, features }));
        setStep(
          features.length > 0 ? featureNameStep(features[0]) : "advanced"
        );
      },
      selected: answers.features
    });
  } else if (step === "advanced") {
    content = h(ChoiceQuestion, {
      items: advancedChoices,
      label: "Advanced options",
      showBack: true,
      onSelect(item) {
        if (item.value === backChoice) {
          setStep("features");
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
    const appNameStep = step.startsWith("feature-name:");
    if (appNameStep) {
      const featureId = step.slice("feature-name:".length);
      const feature = FEATURE_DEFINITIONS.find(({ id }) => id === featureId);
      const featureIndex = answers.features.indexOf(featureId);
      const nextFeature = answers.features[featureIndex + 1];
      content = h(TextQuestion, {
        key: step,
        label: `${feature.label} name`,
        onBack() {
          setStep(
            featureIndex === 0
              ? "features"
              : featureNameStep(answers.features[featureIndex - 1])
          );
        },
        onSubmit(value) {
          const fallback = DEFAULT_FEATURE_NAMES[featureId];
          setAnswers((current) => ({
            ...current,
            featureNames: {
              ...current.featureNames,
              [featureId]: value.trim() || fallback
            }
          }));
          setStep(nextFeature ? featureNameStep(nextFeature) : "advanced");
        },
        placeholder: DEFAULT_FEATURE_NAMES[featureId]
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
                  next: "features",
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
