import { View, type ViewProps } from "react-native";

type CardProps = ViewProps & {
  className?: string;
};

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border border-border bg-card p-5 ${className ?? ""}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <View className={`gap-1 ${className ?? ""}`} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <View className={`gap-4 ${className ?? ""}`} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return <View className={`mt-4 ${className ?? ""}`} {...props} />;
}
