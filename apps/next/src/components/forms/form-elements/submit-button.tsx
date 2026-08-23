"use client";

import { useFormContext } from "@/components/forms/form-context";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton(props: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          disabled={isSubmitting}
          {...props}
          variant={props.variant ?? "default"}
          data-testid="next-submit-button"
        />
      )}
    </form.Subscribe>
  );
}
