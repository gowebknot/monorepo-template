import type { ReactNode } from "react";

import { Select, type SelectOption } from "@/components/ui/select";

import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";

export function FormSelect({
  labelProps,
  placeholder,
  options
}: {
  labelProps?: { children?: ReactNode };
  placeholder?: string;
  options: SelectOption[];
}) {
  const { field, isInvalid } = useFieldMeta<string>();

  return (
    <FieldWrapper
      label={labelProps?.children}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <Select
        value={field.state.value}
        options={options}
        placeholder={placeholder}
        onValueChange={field.handleChange}
      />
    </FieldWrapper>
  );
}
