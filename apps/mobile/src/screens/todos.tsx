import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStore } from "@tanstack/react-form";
import {
  useCreateTodoOptimistic,
  useRemoveTodoOptimistic,
  useTodoListByUser
} from "@repo/query-client/example";
import type { CreateTodoInput } from "@repo/entities/example";

import { useAppForm } from "@/components/forms/form-core";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Todos">;
export function TodosScreen({ navigation }: Props) {
  const createTodo = useCreateTodoOptimistic();
  const removeTodo = useRemoveTodoOptimistic();
  const filterForm = useAppForm({
    defaultValues: { userId: "" },
    onSubmit: async () => undefined
  });
  const userId = useStore(filterForm.store, (state) => state.values.userId);
  const {
    data: todos,
    isError,
    isLoading
  } = useTodoListByUser(userId, undefined, {
    enabled: Boolean(userId)
  });
  const createForm = useAppForm({
    defaultValues: { userId: "", title: "" } satisfies CreateTodoInput,
    onSubmit: async ({ value }) => {
      createTodo.mutate(value);
      createForm.reset();
    }
  });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-4"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-foreground">Todos</Text>
        <Text className="text-muted-foreground">
          Create, filter, and manage todos from the shared example API.
        </Text>
      </View>
      <Card className="gap-4">
        <Text className="text-xl font-semibold text-foreground">
          Create Todo
        </Text>
        <createForm.AppForm>
          <View className="gap-4">
            <createForm.AppField name="userId">
              {(field) => (
                <field.FormInput
                  placeholder="User ID"
                  labelProps={{ children: "User ID" }}
                  autoCapitalize="none"
                />
              )}
            </createForm.AppField>
            <createForm.AppField name="title">
              {(field) => (
                <field.FormInput
                  placeholder="Todo title"
                  labelProps={{ children: "Title" }}
                />
              )}
            </createForm.AppField>
            <createForm.SubmitButton>
              <ButtonText>Create Todo</ButtonText>
            </createForm.SubmitButton>
          </View>
        </createForm.AppForm>
      </Card>
      <View className="gap-3">
        <Text className="text-xl font-semibold text-foreground">
          Filter by User
        </Text>
        <filterForm.AppForm>
          <filterForm.AppField name="userId">
            {(field) => (
              <field.FormInput
                placeholder="Enter a User ID to load todos"
                labelProps={{ children: "User ID" }}
                autoCapitalize="none"
              />
            )}
          </filterForm.AppField>
        </filterForm.AppForm>
      </View>
      {isLoading && <Spinner />}
      {isError && (
        <Text className="text-destructive">
          Unable to load todos. Try again.
        </Text>
      )}
      {todos && todos.length === 0 && (
        <Text className="text-muted-foreground">
          No todos found for this user.
        </Text>
      )}
      {todos && todos.length > 0 && (
        <View className="gap-3">
          {todos.map((todo) => (
            <View
              key={todo.id}
              className="flex-row items-center justify-between rounded-lg border border-border p-3"
            >
              <Pressable
                accessibilityRole="link"
                className="flex-1"
                onPress={() =>
                  navigation.navigate("TodoDetail", { todoId: todo.id })
                }
              >
                <Text className="text-base font-medium text-foreground">
                  {todo.title}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  ID: {todo.id}
                </Text>
              </Pressable>
              <Button
                variant="destructive"
                size="sm"
                disabled={removeTodo.isPending}
                onPress={() => removeTodo.mutate(todo.id)}
              >
                <ButtonText>Delete</ButtonText>
              </Button>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
