import { TextInput, type TextInputProps } from "react-native";

export type InputProps = TextInputProps & {
  className?: string;
  ref?: React.Ref<React.ElementRef<typeof TextInput>>;
};

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <TextInput
      ref={ref}
      className={`rounded-lg border border-input bg-background px-3 py-3 text-foreground ${className ?? ""}`}
      placeholderTextColor="#6b7280"
      {...props}
    />
  );
}
