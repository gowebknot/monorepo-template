import Clipboard from "@react-native-clipboard/clipboard";

export function copyText(value: string) {
  return Clipboard.setString(value);
}
