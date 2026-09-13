import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormCheckbox } from "@reference/components/forms/field-elements/form-checkbox";
import { FormInput } from "@reference/components/forms/field-elements/form-input";
import { FormSelect } from "@reference/components/forms/field-elements/form-select";
import { FormSwitch } from "@reference/components/forms/field-elements/form-switch";
import { FormTextarea } from "@reference/components/forms/field-elements/form-textarea";
import { SubmitButton } from "@reference/components/forms/form-elements/submit-button";

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
