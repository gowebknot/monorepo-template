import { FieldWrapper, useFieldMeta } from "@reference/components/forms/field-elements/field-wrapper";
import { FieldLabel } from "@reference/components/ui/field";
import { Textarea } from "@reference/components/ui/textarea";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  labelProps?: React.ComponentProps<typeof FieldLabel>;
}

export const FormTextarea = (props: FormTextareaProps) => {
  const { labelProps, ...textareaProps } = props;
  const { field, isInvalid, inputId } = useFieldMeta<string>();

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Textarea
        {...textareaProps}
        id={inputId}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  );
};
