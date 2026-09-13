import { FieldWrapper, useFieldMeta } from "@reference/components/forms/field-elements/field-wrapper";
import { FieldContent, FieldDescription, FieldLabel } from "@reference/components/ui/field";
import { Switch } from "@reference/components/ui/switch";

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
      <FieldContent>
        {labelProps && (
          <FieldLabel {...labelProps} htmlFor={inputId}>
            <span>{labelProps.children}</span>
          </FieldLabel>
        )}
        {labelProps?.children && (
          <FieldDescription>{labelProps.children}</FieldDescription>
        )}
      </FieldContent>
      <Switch
        {...switchProps}
        id={inputId}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  );
};
