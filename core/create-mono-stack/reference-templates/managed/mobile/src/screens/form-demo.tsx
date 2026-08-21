import { Alert, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ButtonText } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormSelect } from "@/components/forms/field-elements/form-select";
import { useAppForm } from "@/components/forms/form-core";
import { bugReportFormOption } from "@/lib/bug-report-form";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "FormDemo">;

export function FormDemoScreen(_props: Props) {
  const bugForm = useAppForm({
    ...bugReportFormOption,
    onSubmit: async ({ value }) => {
      Alert.alert("Submitted values", JSON.stringify(value, null, 2));
    }
  });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="items-center p-4"
    >
      <Card className="w-full max-w-xl">
        <CardHeader>
          <Text className="text-2xl font-bold text-foreground">Bug Report</Text>
          <Text className="text-muted-foreground">
            Help us improve by reporting bugs you encounter.
          </Text>
        </CardHeader>
        <CardContent>
          <bugForm.AppForm>
            <View className="gap-4">
              <bugForm.AppField name="title">
                {(field) => (
                  <field.FormInput
                    placeholder="Login button not working on mobile"
                    labelProps={{ children: "Bug Title" }}
                    autoCapitalize="sentences"
                  />
                )}
              </bugForm.AppField>
              <bugForm.AppField name="password">
                {(field) => (
                  <field.FormInput
                    isPasswordType
                    placeholder="Password"
                    labelProps={{ children: "Password" }}
                    autoCapitalize="none"
                  />
                )}
              </bugForm.AppField>
              <bugForm.AppField name="description">
                {(field) => (
                  <field.FormTextarea
                    placeholder="I'm having an issue with..."
                    numberOfLines={6}
                    labelProps={{ children: "Description" }}
                  />
                )}
              </bugForm.AppField>
              <bugForm.AppField name="category">
                {() => (
                  <FormSelect
                    placeholder="Select a category"
                    labelProps={{ children: "Category" }}
                    options={[
                      { value: "bug", label: "Bug" },
                      { value: "feature", label: "Feature" },
                      { value: "docs", label: "Documentation" }
                    ]}
                  />
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
              <bugForm.SubmitButton>
                <ButtonText>Submit</ButtonText>
              </bugForm.SubmitButton>
            </View>
          </bugForm.AppForm>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
