import {
  FieldWrapper,
  useFieldMeta
} from "@/components/forms/field-elements/field-wrapper";
import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value || "")}
      >
        <SelectTrigger
          {...selectTriggerProps}
          id={inputId}
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FieldWrapper>
  );
};

export { SelectItem };
