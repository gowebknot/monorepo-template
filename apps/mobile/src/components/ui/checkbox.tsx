import { Pressable, Text, View } from "react-native";

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  className
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      className={className}
      onPress={() => onCheckedChange(!checked)}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary" : "border-input bg-background"} ${disabled ? "opacity-50" : ""}`}
      >
        {checked && (
          <Text className="text-xs font-bold text-primary-foreground">x</Text>
        )}
      </View>
    </Pressable>
  );
}
