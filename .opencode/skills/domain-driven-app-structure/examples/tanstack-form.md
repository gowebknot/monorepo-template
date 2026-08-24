# TanStack Form Example

Use this pattern for every web, mobile, or shared form. The form instance owns field values,
validation, submission, reset, and pending state. API contracts or shared schemas remain the
authoritative value shape.

```tsx
import { useAppForm } from "@/components/forms/form-core";
import {
  createTodoInputSchema,
  type CreateTodoInput
} from "@monorepo-template/entities/example";

const form = useAppForm({
  defaultValues: {
    userId: "",
    title: ""
  } satisfies CreateTodoInput,
  validators: {
    onSubmit: createTodoInputSchema
  },
  onSubmit: async ({ value }) => {
    await createTodo(value);
    form.reset();
  }
});

return (
  <form.AppForm>
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.AppField name="title">
        {(field) => <field.FormInput labelProps={{ children: "Title" }} />}
      </form.AppField>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting}>
            Save
          </button>
        )}
      </form.Subscribe>
    </form>
  </form.AppForm>
);
```

For a filter or inline edit, create a TanStack Form instance even when there is only one field. Read
its current value through a TanStack Form subscription or store selector, and submit mutations from
the form's `onSubmit` callback.

```tsx
const filterForm = useAppForm({
  defaultValues: { userId: "" },
  onSubmit: async ({ value }) => loadTodos(value.userId)
});
```

Never use a local state value as a form field:

```tsx
// Forbidden: this is manual form management.
const [title, setTitle] = useState("");
<Input value={title} onChange={(event) => setTitle(event.target.value)} />;
```

Local state remains appropriate for non-form UI state such as password visibility, menu open state,
dialog visibility, edit-mode visibility, and table sorting.
