import { useState } from "react";
import { Modal, Pressable, Text, View, type ViewProps } from "react-native";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = ViewProps & {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export function Select({
  value,
  options,
  placeholder = "Select an option",
  onValueChange,
  disabled,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className={className}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected?.label ?? placeholder}
        disabled={disabled}
        className="rounded-lg border border-input bg-background px-3 py-3 disabled:opacity-50"
        onPress={() => setIsOpen(true)}
      >
        <Text
          className={selected ? "text-foreground" : "text-muted-foreground"}
        >
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>
      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-center bg-black/40 p-6"
          onPress={() => setIsOpen(false)}
        >
          <View className="rounded-xl bg-card p-3">
            {options.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                className="rounded-lg px-3 py-3 active:bg-secondary"
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text className="text-base text-foreground">
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
