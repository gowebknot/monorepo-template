import type { ReactNode } from "react";
import type { TextInputProps } from "react-native";

import { Textarea } from "@/components/ui/textarea";

import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";

type FormTextareaProps = Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur"
> & {
  labelProps?: { children?: ReactNode };
  className?: string;
};

export function FormTextarea({
  labelProps,
  ...textareaProps
}: FormTextareaProps) {
  const { field, isInvalid } = useFieldMeta<string>();

  return (
    <FieldWrapper
      label={labelProps?.children}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <Textarea
        {...textareaProps}
        value={field.state.value}
        onBlur={() => field.handleBlur()}
        onChangeText={field.handleChange}
      />
    </FieldWrapper>
  );
}
