import { useFormContext } from "@/components/forms/form-core";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {}

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
        />
      )}
    </form.Subscribe>
  );
}
