import * as Clipboard from "expo-clipboard";

export function copyText(value: string) {
  return Clipboard.setStringAsync(value);
}
