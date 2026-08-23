"use client";

import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";
import {
  FieldContent,
  FieldDescription,
  FieldLabel
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

interface FormSwitchProps extends React.ComponentProps<typeof Switch> {
  labelProps?: React.ComponentProps<typeof FieldLabel>;
}

export const FormSwitch = (props: FormSwitchProps) => {
  const { labelProps, ...switchProps } = props;
  const { field, isInvalid, inputId } = useFieldMeta<boolean>();

  return (
    <FieldWrapper
      orientation="horizontal"
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
    >
      <FieldContent data-testid="next-form-switch-content">
        {labelProps && (
          <FieldLabel
            {...labelProps}
            data-testid="next-form-switch-label"
            htmlFor={inputId}
          >
            <span>{labelProps.children}</span>
          </FieldLabel>
        )}
        {labelProps?.children && (
          <FieldDescription data-testid="next-form-switch-description">
            {labelProps.children}
          </FieldDescription>
        )}
      </FieldContent>
      <Switch
        {...switchProps}
        data-testid="next-form-switch"
        id={inputId}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  );
};
