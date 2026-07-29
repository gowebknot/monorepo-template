import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import { useAppForm } from "@/components/forms/form-core";
import { bugReportFormOption } from "@/routes/-form-demo-option";

export const Route = createFileRoute("/form-demo")({
  component: FormDemo
});

function FormDemo() {
  const bugForm = useAppForm({
    ...bugReportFormOption,
    onSubmit: async ({ value }) => {
      toast("Submitted values:", {
        description: (
          <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        )
      });
    }
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    bugForm.handleSubmit();
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full sm:max-w-lg">
        <CardHeader>
          <CardTitle>Bug Report</CardTitle>
          <CardDescription>
            Help us improve by reporting bugs you encounter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <bugForm.AppForm>
            <form
              method="POST"
              className="flex w-full flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <bugForm.AppField name="title">
                {(field) => (
                  <field.FormInput
                    placeholder="Login button not working on mobile"
                    labelProps={{ children: "Bug Title" }}
                    autoComplete="off"
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="password">
                {(field) => (
                  <field.FormInput
                    isPasswordType
                    placeholder="••••••••"
                    labelProps={{ children: "Password" }}
                    autoComplete="off"
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="description">
                {(field) => (
                  <field.FormTextarea
                    placeholder="I'm having an issue with..."
                    rows={6}
                    className="min-h-24 resize-none"
                    labelProps={{ children: "Description" }}
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="category">
                {(field) => (
                  <field.FormSelect
                    placeholder="Select a category"
                    labelProps={{ children: "Category" }}
                  >
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="docs">Documentation</SelectItem>
                  </field.FormSelect>
                )}
              </bugForm.AppField>

              <bugForm.AppField name="isPublic">
                {(field) => (
                  <field.FormSwitch
                    labelProps={{
                      children: "Make this report publicly visible"
                    }}
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="agreeToTerms">
                {(field) => (
                  <field.FormCheckbox
                    labelProps={{
                      children: "I agree to the terms and conditions"
                    }}
                  />
                )}
              </bugForm.AppField>

              <bugForm.SubmitButton className="w-full">
                Submit
              </bugForm.SubmitButton>
            </form>
          </bugForm.AppForm>
        </CardContent>
      </Card>
    </div>
  );
}
