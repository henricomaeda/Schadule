// Import required modules and dependencies.
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import React from "react";

// Import the components to render, and global variables.
import HomeScreen from "./screens/HomeScreen";
import FormScreen from "./screens/FormScreen";
import { globals } from "./Globals";

// Import the new functions to navigate and define the navigation theme.
import { navigateToHome, replaceRoute } from "./utils/Navigation";
const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: globals.colors.background
  },
};

// Create a native stack navigator component.
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer theme={NavigationTheme}>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitle: globals.app.name,
          headerTintColor: globals.colors.foreground,
          headerTitleStyle: { fontSize: globals.app.width / 22 },
          headerStyle: { backgroundColor: globals.colors.midground },
          headerLeft: () => route.name !== "HomeScreen" && (
            <TouchableOpacity
              style={{ marginRight: globals.app.width / 22 }}
              onPress={() => navigateToHome(navigation)}>
              <Icon
                color={globals.colors.foreground}
                size={globals.app.width / 18}
                name="chevron-left"
              />
            </TouchableOpacity>
          ),
          headerRight: () => route.name === "HomeScreen" && (
            <TouchableOpacity onPress={() => replaceRoute(navigation, route.name)}>
              <Icon
                color={globals.colors.foreground}
                size={globals.app.width / 18}
                name="cached"
              />
            </TouchableOpacity>
          )
        })}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="FormScreen" component={FormScreen} />
      </Stack.Navigator>
    </NavigationContainer >
  );
};
