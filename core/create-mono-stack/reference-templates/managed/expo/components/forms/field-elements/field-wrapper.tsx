import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useFieldContext } from "@/components/forms/form-context";

export function useFieldMeta<TValue>() {
  const field = useFieldContext<TValue>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return { field, isInvalid } as const;
}

function errorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return String(error);
}

export function FieldWrapper({
  children,
  label,
  isInvalid,
  errors,
  horizontal = false
}: {
  children: ReactNode;
  label?: ReactNode;
  isInvalid: boolean;
  errors: unknown[];
  horizontal?: boolean;
}) {
  const messages = [...new Set(errors.map(errorMessage))];

  return (
    <View
      className={`gap-2 ${horizontal ? "flex-row items-center justify-between" : ""}`}
    >
      <View className={horizontal ? "flex-1 pr-4" : ""}>
        {label && (
          <Text className="text-sm font-medium text-foreground">{label}</Text>
        )}
        {!horizontal && children}
      </View>
      {horizontal && children}
      {isInvalid && messages.length > 0 && (
        <Text className="text-sm text-destructive">{messages.join("\n")}</Text>
      )}
    </View>
  );
}
