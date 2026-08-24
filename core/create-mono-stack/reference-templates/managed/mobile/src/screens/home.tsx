import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 justify-center gap-4 bg-background p-6">
      <Card>
        <CardHeader>
          <Text className="text-2xl font-bold text-foreground">
            Mobile reference app
          </Text>
          <Text className="text-muted-foreground">
            A bare React Native app wired to the shared @monorepo-template/* contracts, API
            client, and query hooks.
          </Text>
        </CardHeader>
        <CardContent>
          <Button onPress={() => navigation.navigate("Reference")}>
            <ButtonText>Open Reference</ButtonText>
          </Button>
          <Button
            variant="secondary"
            onPress={() => navigation.navigate("FormDemo")}
          >
            <ButtonText className="text-secondary-foreground">
              Open Form Demo
            </ButtonText>
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.navigate("TableDemo")}
          >
            <ButtonText className="text-foreground">Open Table Demo</ButtonText>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
