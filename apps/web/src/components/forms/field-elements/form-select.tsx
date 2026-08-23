import { FieldWrapper, useFieldMeta } from "./field-wrapper";
import { FieldLabel } from "../../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select";

interface FormSelectProps extends Omit<
  React.ComponentProps<typeof SelectTrigger>,
  "children"
> {
  labelProps?: React.ComponentProps<typeof FieldLabel>;
  placeholder?: string;
  children: React.ReactNode;
}

export const FormSelect = ({
  labelProps,
  placeholder,
  children,
  ...selectTriggerProps
}: FormSelectProps) => {
  const { field, isInvalid, inputId } = useFieldMeta<string>();

  return (
    <FieldWrapper isInvalid={isInvalid} errors={field.state.meta.errors}>
      <FieldLabel
        {...labelProps}
        data-testid="web-form-select-label"
        htmlFor={inputId}
      >
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value || "")}
      >
        <SelectTrigger
          {...selectTriggerProps}
          data-testid="web-form-select-trigger"
          id={inputId}
          aria-invalid={isInvalid}
        >
          <SelectValue
            data-testid="web-form-select-value"
            placeholder={placeholder}
          />
        </SelectTrigger>
        <SelectContent data-testid="web-form-select-content">
          {children}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
};

export { SelectItem };
