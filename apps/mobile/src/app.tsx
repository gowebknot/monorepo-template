import "@/global.css";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Providers } from "@/lib/providers";
import type { RootStackParamList } from "@/navigation";
import { FormDemoScreen } from "@/screens/form-demo";
import { HomeScreen } from "@/screens/home";
import { ReferenceScreen } from "@/screens/reference";
import { TableDemoScreen } from "@/screens/table-demo";
import { TodoDetailScreen } from "@/screens/todo-detail";
import { TodosScreen } from "@/screens/todos";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Providers>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Mobile reference" }}
            />
            <Stack.Screen
              name="FormDemo"
              component={FormDemoScreen}
              options={{ title: "Form Demo" }}
            />
            <Stack.Screen
              name="TableDemo"
              component={TableDemoScreen}
              options={{ title: "Table Demo" }}
            />
            <Stack.Screen
              name="Reference"
              component={ReferenceScreen}
              options={{ title: "Reference" }}
            />
            <Stack.Screen
              name="Todos"
              component={TodosScreen}
              options={{ title: "Todos" }}
            />
            <Stack.Screen
              name="TodoDetail"
              component={TodoDetailScreen}
              options={{ title: "Todo Detail" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Providers>
  );
}
