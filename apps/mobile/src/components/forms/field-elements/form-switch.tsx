import type { ReactNode } from "react";

import { Switch } from "@/components/ui/switch";

import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";

export function FormSwitch({
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
      <Switch value={field.state.value} onValueChange={field.handleChange} />
    </FieldWrapper>
  );
}
