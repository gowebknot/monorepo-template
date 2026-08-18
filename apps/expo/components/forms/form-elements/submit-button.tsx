import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

import { useFormContext } from "@/components/forms/form-context";

type SubmitButtonProps = Omit<ButtonProps, "children"> & {
  children?: ReactNode;
};

export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button disabled={isSubmitting} {...props}>
          {children ?? "Submit"}
        </Button>
      )}
    </form.Subscribe>
  );
}
