import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormCheckbox } from "./field-elements/form-checkbox";
import { FormInput } from "./field-elements/form-input";
import { FormSelect } from "./field-elements/form-select";
import { FormSwitch } from "./field-elements/form-switch";
import { FormTextarea } from "./field-elements/form-textarea";
import { SubmitButton } from "./form-elements/submit-button";

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
