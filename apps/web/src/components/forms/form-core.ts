import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormCheckbox } from "@/components/forms/field-elements/form-checkbox";
import { FormInput } from "@/components/forms/field-elements/form-input";
import { FormSelect } from "@/components/forms/field-elements/form-select";
import { FormSwitch } from "@/components/forms/field-elements/form-switch";
import { FormTextarea } from "@/components/forms/field-elements/form-textarea";
import { SubmitButton } from "@/components/forms/form-elements/submit-button";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

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
