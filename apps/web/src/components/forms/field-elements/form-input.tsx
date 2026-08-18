import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldWrapper, useFieldMeta } from "./field-wrapper";
import { Button } from "../../ui/button";
import { FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";

interface FormInputProps extends React.ComponentProps<typeof Input> {
  isPasswordType?: boolean;
  labelProps?: React.ComponentProps<typeof FieldLabel>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormInput = (props: FormInputProps) => {
  const {
    labelProps,
    isPasswordType,
    rightIcon: RightIcon,
    leftIcon: LeftIcon,
    ...inputProps
  } = props;
  const [showPassword, setShowPassword] = useState(!!isPasswordType);
  const { field, isInvalid, inputId } = useFieldMeta<string>();

  return (
    <FieldWrapper
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
      hidden={props.hidden}
    >
      <FieldLabel {...labelProps} htmlFor={inputId}>
        <span>{labelProps?.children}</span>
      </FieldLabel>

      <div className="relative">
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {LeftIcon}
          </div>
        )}

        <Input
          {...inputProps}
          id={inputId}
          type={showPassword ? "password" : inputProps.type}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={cn(
            LeftIcon && "pl-9",
            RightIcon && "pr-9",
            inputProps.className
          )}
        />

        {isPasswordType && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="size-3 text-muted-foreground" />
              ) : (
                <Eye className="size-3" />
              )}
            </Button>
          </div>
        )}

        {RightIcon && !isPasswordType && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            {RightIcon}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};
