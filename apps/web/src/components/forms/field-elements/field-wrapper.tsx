import { useId } from "react";
import { useFieldContext } from "../form-core";
import { Field, FieldError } from "../../ui/field";
import { cn } from "../../../lib/utils";

export function useFieldMeta<TValue>() {
  const field = useFieldContext<TValue>();
  const generatedId = useId();
  const inputId = `${generatedId}-${field.name}`;
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return { field, isInvalid, inputId } as const;
}

interface FieldWrapperProps {
  children: React.ReactNode;
  isInvalid: boolean;
  errors: Array<{ message?: string } | undefined>;
  orientation?: "vertical" | "horizontal" | "responsive";
  hidden?: boolean;
}

export function FieldWrapper({
  children,
  isInvalid,
  errors,
  orientation,
  hidden
}: FieldWrapperProps) {
  return (
    <Field
      orientation={orientation}
      data-invalid={isInvalid}
      className={cn(hidden && "hidden")}
    >
      {children}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
