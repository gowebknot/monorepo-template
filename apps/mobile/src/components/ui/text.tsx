import { Text as NativeText, type TextProps } from "react-native";

export function Text({
  className,
  ...props
}: TextProps & { className?: string }) {
  return <NativeText className={className ?? "text-foreground"} {...props} />;
}
