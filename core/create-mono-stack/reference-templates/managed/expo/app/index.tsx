import { Link } from "expo-router";
import { Text, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center gap-4 bg-background p-6">
      <Text className="text-2xl font-bold text-foreground">
        Expo reference app
      </Text>
      <Text className="text-base text-muted-foreground">
        A React Native app styled with NativeWind, wired to the shared @repo/*
        contracts, API client, and query hooks.
      </Text>
      <Link href="/reference" asChild>
        <Button>
          <ButtonText>Open Reference</ButtonText>
        </Button>
      </Link>
      <Link href="/form-demo" asChild>
        <Button variant="secondary">
          <ButtonText className="text-secondary-foreground">
            Open Form Demo
          </ButtonText>
        </Button>
      </Link>
      <Link href="/table-demo" asChild>
        <Button variant="outline">
          <ButtonText className="text-foreground">Open Table Demo</ButtonText>
        </Button>
      </Link>
    </View>
  );
}
