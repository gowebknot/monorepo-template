import { useState, type ReactNode } from "react";
import { View, type TextInputProps } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";

type FormInputProps = Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur"
> & {
  labelProps?: { children?: ReactNode };
  isPasswordType?: boolean;
  className?: string;
};

export function FormInput({
  labelProps,
  isPasswordType,
  className,
  ...inputProps
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { field, isInvalid } = useFieldMeta<string>();

  return (
    <FieldWrapper
      label={labelProps?.children}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <ViewWithPasswordToggle
        isPasswordType={isPasswordType}
        showPassword={showPassword}
        onToggle={() => setShowPassword((visible) => !visible)}
      >
        <Input
          {...inputProps}
          className={className}
          value={field.state.value}
          onBlur={() => field.handleBlur()}
          onChangeText={field.handleChange}
          secureTextEntry={isPasswordType && !showPassword}
        />
      </ViewWithPasswordToggle>
    </FieldWrapper>
  );
}

function ViewWithPasswordToggle({
  children,
  isPasswordType,
  showPassword,
  onToggle
}: {
  children: ReactNode;
  isPasswordType?: boolean;
  showPassword: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="relative">
      {children}
      {isPasswordType && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1"
          onPress={onToggle}
        >
          <ButtonText className="text-xs text-muted-foreground">
            {showPassword ? "Hide" : "Show"}
          </ButtonText>
        </Button>
      )}
    </View>
  );
}
