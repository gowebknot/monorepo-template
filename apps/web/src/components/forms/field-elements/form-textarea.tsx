import { FieldWrapper, useFieldMeta } from "./field-wrapper";
import { FieldLabel } from "../../ui/field";
import { Textarea } from "../../ui/textarea";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  labelProps?: React.ComponentProps<typeof FieldLabel>;
}

export const FormTextarea = (props: FormTextareaProps) => {
  const { labelProps, ...textareaProps } = props;
  const { field, isInvalid, inputId } = useFieldMeta<string>();

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel
        data-testid="web-form-textarea-label"
        {...labelProps}
        htmlFor={inputId}
      >
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Textarea
        {...textareaProps}
        data-testid="web-form-textarea"
        id={inputId}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  );
};
