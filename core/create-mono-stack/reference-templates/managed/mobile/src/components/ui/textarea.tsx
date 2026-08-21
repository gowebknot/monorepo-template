import { TextInput, type TextInputProps } from "react-native";

export type TextareaProps = TextInputProps & {
  className?: string;
  ref?: React.Ref<React.ElementRef<typeof TextInput>>;
};

export function Textarea({
  className,
  numberOfLines = 5,
  ref,
  ...props
}: TextareaProps) {
  return (
    <TextInput
      ref={ref}
      multiline
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      className={`min-h-28 rounded-lg border border-input bg-background px-3 py-3 text-foreground ${className ?? ""}`}
      placeholderTextColor="#6b7280"
      {...props}
    />
  );
}
