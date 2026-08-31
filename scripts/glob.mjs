// Tiny hand-written glob matcher shared by the skill gate and the commit-msg
// backstop. Supports the subset used by .claude/skill-triggers.json:
//   **/   any number of leading path segments
//   **    anything, including separators
//   *     anything except a separator
//   ?     one non-separator character
// No brace expansion and no negation.

export function globToRegExp(glob) {
  let regex = "^";
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === "*") {
      if (glob[index + 1] === "*") {
        index += 1;
        if (glob[index + 1] === "/") {
          index += 1;
          regex += "(?:.*/)?";
        } else {
          regex += ".*";
        }
      } else {
        regex += "[^/]*";
      }
    } else if (char === "?") {
      regex += "[^/]";
    } else if (".+^${}()|[]\\".includes(char)) {
      regex += `\\${char}`;
    } else {
      regex += char;
    }
  }
  return new RegExp(`${regex}$`);
}

export function matchesAny(relativePath, patterns = []) {
  return patterns.some((pattern) => globToRegExp(pattern).test(relativePath));
}
