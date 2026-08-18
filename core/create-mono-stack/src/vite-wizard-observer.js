import { stripVTControlCharacters } from "node:util";

const defaultCaptureLimit = 128 * 1024;
const promptLabels = {
  framework: "Select a framework:",
  linter: "Which linter to use?",
  variant: "Select a variant:"
};

function cleanTerminalLine(line) {
  return line.replace(/^[\s│┃┆┊◇◆○●◉◌└├┌┐┘┤┬┴┼─━]+/u, "").trim();
}

function answerAfterPrompt(lines, prompt) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = cleanTerminalLine(lines[index]);
    const promptIndex = line.indexOf(prompt);
    if (promptIndex === -1) continue;

    const inlineAnswer = cleanTerminalLine(
      line.slice(promptIndex + prompt.length)
    );
    if (inlineAnswer) return inlineAnswer;

    for (
      let answerIndex = index + 1;
      answerIndex < lines.length;
      answerIndex += 1
    ) {
      const answer = cleanTerminalLine(lines[answerIndex]);
      if (answer) return answer;
    }
  }
  return undefined;
}

export function observeViteWizardTranscript(transcript) {
  const lines = stripVTControlCharacters(transcript).split(/[\r\n]+/u);
  const framework = answerAfterPrompt(lines, promptLabels.framework);
  const variant = answerAfterPrompt(lines, promptLabels.variant);
  if (!framework || !variant) return null;

  const linter = answerAfterPrompt(lines, promptLabels.linter);
  return {
    framework,
    ...(linter ? { linter } : {}),
    variant
  };
}

export function createViteWizardObserver({
  captureLimit = defaultCaptureLimit
} = {}) {
  let transcript = "";

  return {
    finish() {
      return observeViteWizardTranscript(transcript);
    },
    write(chunk) {
      transcript = `${transcript}${chunk}`.slice(-captureLimit);
    }
  };
}
