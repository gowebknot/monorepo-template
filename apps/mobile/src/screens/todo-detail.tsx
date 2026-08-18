import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useCreateTodoItemOptimistic,
  useRemoveTodoItemOptimistic,
  useTodoDetail,
  useTodoItemListByTodo,
  useUpdateTodoItemOptimistic,
  useUpdateTodoOptimistic
} from "@repo/query-client/example";
import type { CreateTodoItemInput } from "@repo/entities/example";

import { useAppForm } from "@/components/forms/form-core";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { clientEnv } from "@/lib/env";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TodoDetail">;
const apiOptions = { baseURL: clientEnv.RN_PUBLIC_API_BASE_URL };

export function TodoDetailScreen({ navigation, route }: Props) {
  const { todoId } = route.params;
  const { data: todo, isLoading: todoLoading } = useTodoDetail(
    todoId,
    apiOptions,
    {
      enabled: Boolean(todoId)
    }
  );
  const { data: items, isLoading: itemsLoading } = useTodoItemListByTodo(
    todoId,
    apiOptions,
    {
      enabled: Boolean(todoId)
    }
  );
  const updateTodo = useUpdateTodoOptimistic(apiOptions);
  const createItem = useCreateTodoItemOptimistic(apiOptions);
  const updateItem = useUpdateTodoItemOptimistic(apiOptions);
  const removeItem = useRemoveTodoItemOptimistic(apiOptions);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const itemForm = useAppForm({
    defaultValues: {
      todoId,
      title: "",
      completed: false
    } satisfies CreateTodoItemInput,
    onSubmit: async ({ value }) => {
      createItem.mutate(value);
      itemForm.reset({ todoId, title: "", completed: false });
    }
  });

  if (todoLoading) return <Spinner />;
  if (!todo) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
        <Text className="text-foreground">Todo not found.</Text>
        <Button onPress={() => navigation.goBack()}>
          <ButtonText>Back to Todos</ButtonText>
        </Button>
      </View>
    );
  }

  const saveTitle = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      updateTodo.mutate({ id: todoId, input: { title: editTitle } });
    }
    setIsEditing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-4"
    >
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        onPress={() => navigation.goBack()}
      >
        <ButtonText className="text-muted-foreground">Back to Todos</ButtonText>
      </Button>
      <View className="gap-2">
        {isEditing ? (
          <View className="gap-3">
            <Input value={editTitle} onChangeText={setEditTitle} autoFocus />
            <View className="flex-row gap-2">
              <Button size="sm" onPress={saveTitle}>
                <ButtonText>Save</ButtonText>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setIsEditing(false)}
              >
                <ButtonText className="text-muted-foreground">
                  Cancel
                </ButtonText>
              </Button>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-3xl font-bold text-foreground">
              {todo.title}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                setEditTitle(todo.title);
                setIsEditing(true);
              }}
            >
              <ButtonText className="text-muted-foreground">Edit</ButtonText>
            </Button>
          </View>
        )}
        <Text className="text-sm text-muted-foreground">ID: {todo.id}</Text>
        <Text className="text-sm text-muted-foreground">
          User ID: {todo.userId}
        </Text>
      </View>
      <Card className="gap-4">
        <Text className="text-xl font-semibold text-foreground">Add Item</Text>
        <itemForm.AppForm>
          <View className="gap-4">
            <itemForm.AppField name="title">
              {(field) => (
                <field.FormInput
                  placeholder="Item title"
                  labelProps={{ children: "Title" }}
                />
              )}
            </itemForm.AppField>
            <itemForm.AppField name="completed">
              {(field) => (
                <field.FormSwitch labelProps={{ children: "Completed" }} />
              )}
            </itemForm.AppField>
            <itemForm.SubmitButton>
              <ButtonText>Add Item</ButtonText>
            </itemForm.SubmitButton>
          </View>
        </itemForm.AppForm>
      </Card>
      <View className="gap-3">
        <Text className="text-xl font-semibold text-foreground">Items</Text>
        {itemsLoading && <Spinner />}
        {items && items.length === 0 && (
          <Text className="text-muted-foreground">No items yet.</Text>
        )}
        {items?.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center gap-3 rounded-lg border border-border p-3"
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={(completed) =>
                updateItem.mutate({ id: item.id, input: { completed } })
              }
            />
            <Text
              className={`flex-1 text-foreground ${item.completed ? "text-muted-foreground line-through" : ""}`}
            >
              {item.title}
            </Text>
            <Button
              variant="destructive"
              size="sm"
              onPress={() => removeItem.mutate(item.id)}
            >
              <ButtonText>Delete</ButtonText>
            </Button>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
