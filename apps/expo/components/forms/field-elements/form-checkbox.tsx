import type { ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";

import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";

export function FormCheckbox({
  labelProps
}: {
  labelProps?: { children?: ReactNode };
}) {
  const { field, isInvalid } = useFieldMeta<boolean>();

  return (
    <FieldWrapper
      label={labelProps?.children}
      horizontal
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <Checkbox
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
    </FieldWrapper>
  );
}
