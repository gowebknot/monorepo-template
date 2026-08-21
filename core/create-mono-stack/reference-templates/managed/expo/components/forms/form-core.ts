import { createFormHook } from "@tanstack/react-form";

import { FormCheckbox } from "@/components/forms/field-elements/form-checkbox";
import { FormInput } from "@/components/forms/field-elements/form-input";
import { FormSelect } from "@/components/forms/field-elements/form-select";
import { FormSwitch } from "@/components/forms/field-elements/form-switch";
import { FormTextarea } from "@/components/forms/field-elements/form-textarea";
import { SubmitButton } from "@/components/forms/form-elements/submit-button";
import { fieldContext, formContext } from "@/components/forms/form-context";

export {
  useFieldContext,
  useFormContext
} from "@/components/forms/form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    FormInput,
    FormTextarea,
    FormCheckbox,
    FormSelect,
    FormSwitch
  },
  formComponents: {
    SubmitButton
  },
  fieldContext,
  formContext
});
