"use client";

import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";
import { FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  labelProps?: React.ComponentProps<typeof FieldLabel>;
}

export const FormTextarea = (props: FormTextareaProps) => {
  const { labelProps, ...textareaProps } = props;
  const { field, isInvalid, inputId } = useFieldMeta<string>();

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel
        data-testid="next-form-textarea-label"
        {...labelProps}
        htmlFor={inputId}
      >
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Textarea
        {...textareaProps}
        data-testid="next-form-textarea"
        id={inputId}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
    </FieldWrapper>
  );
};
