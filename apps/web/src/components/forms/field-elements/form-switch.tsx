import { FieldWrapper, useFieldMeta } from "./field-wrapper";
import { FieldContent, FieldDescription, FieldLabel } from "../../ui/field";
import { Switch } from "../../ui/switch";

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
      <FieldContent data-testid="web-form-switch-content">
        {labelProps && (
          <FieldLabel
            {...labelProps}
            data-testid="web-form-switch-label"
            htmlFor={inputId}
          >
            <span>{labelProps.children}</span>
          </FieldLabel>
        )}
        {labelProps?.children && (
          <FieldDescription data-testid="web-form-switch-description">
            {labelProps.children}
          </FieldDescription>
        )}
      </FieldContent>
      <Switch
        {...switchProps}
        data-testid="web-form-switch"
        id={inputId}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  );
};
