"use client";

import * as React from "react";
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
import { bugReportFormOption } from "@/app/form-demo/bug-report-option";

export default function FormDemoPage() {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    bugForm.handleSubmit();
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card data-testid="next-form-demo-card" className="w-full sm:max-w-lg">
        <CardHeader data-testid="next-form-demo-header">
          <CardTitle data-testid="next-form-demo-title">Bug Report</CardTitle>
          <CardDescription data-testid="next-form-demo-description">
            Help us improve by reporting bugs you encounter.
          </CardDescription>
        </CardHeader>
        <CardContent data-testid="next-form-demo-content">
          <bugForm.AppForm>
            <form
              method="POST"
              className="flex w-full flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <bugForm.AppField name="title">
                {(field) => (
                  <field.FormInput
                    data-testid="next-form-demo-title-input"
                    placeholder="Login button not working on mobile"
                    labelProps={{
                      children: "Bug Title",
                      "data-testid": "next-form-demo-title-label"
                    }}
                    autoComplete="off"
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="password">
                {(field) => (
                  <field.FormInput
                    data-testid="next-form-demo-password-input"
                    isPasswordType
                    placeholder="••••••••"
                    labelProps={{
                      children: "Password",
                      "data-testid": "next-form-demo-password-label"
                    }}
                    autoComplete="off"
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="description">
                {(field) => (
                  <field.FormTextarea
                    data-testid="next-form-demo-description-input"
                    placeholder="I'm having an issue with..."
                    rows={6}
                    className="min-h-24 resize-none"
                    labelProps={{
                      children: "Description",
                      "data-testid": "next-form-demo-description-label"
                    }}
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="category">
                {(field) => (
                  <field.FormSelect
                    data-testid="next-form-demo-category-select"
                    placeholder="Select a category"
                    labelProps={{
                      children: "Category",
                      "data-testid": "next-form-demo-category-label"
                    }}
                  >
                    <SelectItem
                      data-testid="next-form-demo-category-bug"
                      value="bug"
                    >
                      Bug
                    </SelectItem>
                    <SelectItem
                      data-testid="next-form-demo-category-feature"
                      value="feature"
                    >
                      Feature
                    </SelectItem>
                    <SelectItem
                      data-testid="next-form-demo-category-docs"
                      value="docs"
                    >
                      Documentation
                    </SelectItem>
                  </field.FormSelect>
                )}
              </bugForm.AppField>

              <bugForm.AppField name="isPublic">
                {(field) => (
                  <field.FormSwitch
                    data-testid="next-form-demo-public-switch"
                    labelProps={{
                      children: "Make this report publicly visible",
                      "data-testid": "next-form-demo-public-label"
                    }}
                  />
                )}
              </bugForm.AppField>

              <bugForm.AppField name="agreeToTerms">
                {(field) => (
                  <field.FormCheckbox
                    data-testid="next-form-demo-terms-checkbox"
                    labelProps={{
                      children: "I agree to the terms and conditions",
                      "data-testid": "next-form-demo-terms-label"
                    }}
                  />
                )}
              </bugForm.AppField>

              <bugForm.SubmitButton
                data-testid="next-form-demo-submit"
                className="w-full"
              >
                Submit
              </bugForm.SubmitButton>
            </form>
          </bugForm.AppForm>
        </CardContent>
      </Card>
    </div>
  );
}
