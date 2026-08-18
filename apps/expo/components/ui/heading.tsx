import { Text, type TextProps } from "react-native";

export function Heading({
  className,
  ...props
}: TextProps & { className?: string }) {
  return (
    <Text
      className={`text-xl font-semibold text-foreground ${className ?? ""}`}
      {...props}
    />
  );
}
