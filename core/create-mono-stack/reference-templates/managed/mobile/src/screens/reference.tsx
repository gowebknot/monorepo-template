import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Reference">;

export function ReferenceScreen({ navigation }: Props) {
  return (
    <View className="flex-1 justify-center bg-background p-6">
      <Card>
        <CardHeader>
          <Text className="text-2xl font-bold text-foreground">Reference</Text>
          <Text className="text-muted-foreground">
            Shared todo and todo-item data powered by the example API.
          </Text>
        </CardHeader>
        <CardContent>
          <Button onPress={() => navigation.navigate("Todos")}>
            <ButtonText>Open Todos</ButtonText>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
