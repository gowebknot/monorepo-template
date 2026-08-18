import {
  Pressable,
  Text,
  type PressableProps,
  type TextProps
} from "react-native";

export type ButtonProps = PressableProps & {
  size?: "default" | "sm" | "icon";
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  className?: string;
  ref?: React.Ref<React.ElementRef<typeof Pressable>>;
};

export function Button({
  className,
  children,
  size = "default",
  variant = "default",
  ref,
  ...props
}: ButtonProps) {
  const variantClassName = {
    default: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-border bg-transparent",
    destructive: "bg-destructive",
    ghost: "bg-transparent"
  }[variant];
  const textClassName = {
    default: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    outline: "text-foreground",
    destructive: "text-white",
    ghost: "text-foreground"
  }[variant];
  const sizeClassName = {
    default: "px-4 py-3",
    sm: "px-3 py-2",
    icon: "h-10 w-10 p-0"
  }[size];

  return (
    <Pressable
      ref={ref}
      className={`items-center justify-center rounded-lg ${variantClassName} ${sizeClassName} disabled:opacity-50 ${className ?? ""}`}
      accessibilityRole="button"
      {...props}
    >
      {typeof children === "string" ? (
        <ButtonText className={textClassName}>{children}</ButtonText>
      ) : (
        children
      )}
    </Pressable>
  );
}

type ButtonTextProps = TextProps & {
  className?: string;
};

export function ButtonText({ className, ...props }: ButtonTextProps) {
  return (
    <Text
      className={`font-semibold ${className ?? "text-primary-foreground"}`}
      {...props}
    />
  );
}
