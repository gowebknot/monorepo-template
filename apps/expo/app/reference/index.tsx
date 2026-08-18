import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReferenceIndex() {
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
          <Link href="/reference/todos" asChild>
            <Button>
              <ButtonText>Open Todos</ButtonText>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </View>
  );
}
