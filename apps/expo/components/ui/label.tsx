import { Text } from "react-native";

export function Label({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-sm font-medium text-foreground ${className ?? ""}`}>
      {children}
    </Text>
  );
}
